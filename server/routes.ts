import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { body, query, param, validationResult } from "express-validator";
import sanitizeHtml from "sanitize-html";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertListingSchema, insertMessageSchema, insertReportSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security: Input validation and sanitization middleware
const validateInput = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: "Validation failed", 
      errors: errors.array() 
    });
  }
  next();
};

// Security: Sanitize HTML content
const sanitizeContent = (content: string) => {
  return sanitizeHtml(content, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {
      'a': ['href']
    },
    allowedSchemes: ['http', 'https', 'mailto']
  });
};

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      // Security: Generate secure filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(sanitizedName));
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Security: Strict file type validation
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    // Additional security check for file signature
    if (mimetype && extname && file.originalname.length < 255) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, png, gif, webp) under 255 characters are allowed!'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categoryData = req.body;
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Listing routes
  app.get('/api/listings', async (req, res) => {
    try {
      const {
        categoryId,
        userId,
        search,
        status = 'active',
        condition,
        brand,
        model,
        size,
        color,
        minPrice,
        maxPrice,
        city,
        state,
        zipCode,
        latitude,
        longitude,
        radius,
        sortBy,
        limit = 20,
        offset = 0,
      } = req.query;

      const listings = await storage.getListings({
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        userId: userId as string,
        search: search as string,
        status: status as string,
        condition: condition as string,
        brand: brand as string,
        model: model as string,
        size: size as string,
        color: color as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        city: city as string,
        state: state as string,
        zipCode: zipCode as string,
        latitude: latitude as string,
        longitude: longitude as string,
        radius: radius ? parseFloat(radius as string) : undefined,
        sortBy: sortBy as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  app.get('/api/listings/:id', [
    param('id').isInt({ min: 1 }),
    validateInput
  ], async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Security: Check if ID is valid integer
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const listing = await storage.getListing(id);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      // Increment view count
      await storage.incrementViewCount(id);
      
      res.json(listing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ message: "Failed to fetch listing" });
    }
  });

  app.post('/api/listings', [
    isAuthenticated,
    body('title').isLength({ min: 1, max: 200 }).trim().escape(),
    body('description').isLength({ min: 1, max: 2000 }).trim(),
    body('categoryId').isInt({ min: 1 }),
    body('price').optional().isFloat({ min: 0 }),
    body('location').optional().isLength({ max: 200 }).trim(),
    validateInput
  ], upload.array('images', 5), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Security: Sanitize description content
      const sanitizedDescription = sanitizeContent(req.body.description);
      
      const listingData = {
        ...req.body,
        description: sanitizedDescription,
        userId,
        categoryId: parseInt(req.body.categoryId),
        images: req.files ? req.files.map((file: any) => `/uploads/${file.filename}`) : [],
      };

      const validatedData = insertListingSchema.omit({ id: true }).parse(listingData);
      const listing = await storage.createListing(validatedData);
      res.json(listing);
    } catch (error) {
      console.error("Error creating listing:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  app.put('/api/listings/:id', isAuthenticated, upload.array('images', 5), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const listing = await storage.getListing(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      const user = await storage.getUser(userId);
      if (listing.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Not authorized to update this listing" });
      }

      const updateData = {
        ...req.body,
        categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : undefined,
        images: req.files ? req.files.map((file: any) => `/uploads/${file.filename}`) : undefined,
      };

      const updatedListing = await storage.updateListing(id, updateData);
      res.json(updatedListing);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ message: "Failed to update listing" });
    }
  });

  app.delete('/api/listings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const listing = await storage.getListing(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      const user = await storage.getUser(userId);
      if (listing.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this listing" });
      }

      await storage.deleteListing(id);
      res.json({ message: "Listing deleted successfully" });
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });

  // Message routes
  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { listingId } = req.query;
      
      const messages = await storage.getMessages(
        userId,
        listingId ? parseInt(listingId as string) : undefined
      );
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/messages', [
    isAuthenticated,
    body('content').isLength({ min: 1, max: 1000 }).trim(),
    body('receiverId').isLength({ min: 1, max: 50 }).trim(),
    body('listingId').optional().isInt({ min: 1 }),
    validateInput
  ], async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Security: Sanitize message content
      const sanitizedContent = sanitizeContent(req.body.content);
      
      const messageData = {
        ...req.body,
        content: sanitizedContent,
        senderId: userId,
      };

      const validatedData = insertMessageSchema.omit({ id: true }).parse(messageData);
      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.put('/api/messages/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markMessageAsRead(id);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Report routes
  app.get('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = req.query;
      const reports = await storage.getReports(status as string);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post('/api/reports', [
    isAuthenticated,
    body('reason').isLength({ min: 1, max: 500 }).trim(),
    body('description').optional().isLength({ max: 1000 }).trim(),
    body('listingId').optional().isInt({ min: 1 }),
    body('reportedUserId').optional().isLength({ min: 1, max: 50 }),
    validateInput
  ], async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Security: Sanitize report content
      const sanitizedDescription = req.body.description ? sanitizeContent(req.body.description) : undefined;
      
      const reportData = {
        ...req.body,
        description: sanitizedDescription,
        reporterId: userId,
      };

      const validatedData = insertReportSchema.omit({ id: true }).parse(reportData);
      const report = await storage.createReport(validatedData);
      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.put('/api/reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const report = await storage.updateReportStatus(id, status);
      res.json(report);
    } catch (error) {
      console.error("Error updating report:", error);
      res.status(500).json({ message: "Failed to update report" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const [usersCount, listingsCount, reportsCount, pendingReportsCount] = await Promise.all([
        storage.getUsersCount(),
        storage.getListingsCount(),
        storage.getReportsCount(),
        storage.getPendingReportsCount(),
      ]);

      res.json({
        usersCount,
        listingsCount,
        reportsCount,
        pendingReportsCount,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Comment routes
  app.get("/api/comments", async (req, res) => {
    try {
      const { listingId, forumPostId, parentId } = req.query;
      const comments = await storage.getComments({
        listingId: listingId ? parseInt(listingId as string) : undefined,
        forumPostId: forumPostId ? parseInt(forumPostId as string) : undefined,
        parentId: parentId ? parseInt(parentId as string) : undefined,
      });
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const comment = await storage.createComment({
        ...req.body,
        userId,
      });
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.put("/api/comments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const commentId = parseInt(req.params.id);
      
      // Check if user owns the comment
      const existingComments = await storage.getComments();
      const comment = existingComments.find(c => c.id === commentId);
      
      if (!comment || comment.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to edit this comment" });
      }
      
      const updatedComment = await storage.updateComment(commentId, req.body);
      res.json(updatedComment);
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  app.delete("/api/comments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const commentId = parseInt(req.params.id);
      
      // Check if user owns the comment
      const existingComments = await storage.getComments();
      const comment = existingComments.find(c => c.id === commentId);
      
      if (!comment || comment.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this comment" });
      }
      
      await storage.deleteComment(commentId);
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Seed marketplace listings route
  app.post("/api/seed/marketplace", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categories = await storage.getCategories();
      const mockListings = [];

      // Housing category listings
      const housingCategory = categories.find(c => c.name === "Housing");
      if (housingCategory) {
        mockListings.push(
          {
            userId,
            categoryId: housingCategory.id,
            title: "Modern Studio Apartment Downtown",
            description: "Fully furnished studio apartment in the heart of downtown. Features include modern kitchen, high-speed internet, and access to gym facilities. Perfect for professionals or students.",
            price: "850.00",
            priceType: "fixed",
            location: "Downtown District",
            condition: "new",
            brand: "Property Management Co.",
            tags: ["furnished", "downtown", "studio", "modern"],
            images: [],
            isFeatured: true,
            shippingInfo: "Available for immediate move-in",
            returnPolicy: "30-day satisfaction guarantee"
          },
          {
            userId,
            categoryId: housingCategory.id,
            title: "Shared Room in Family Home",
            description: "Comfortable shared room in a quiet family home. Includes utilities, WiFi, and access to common areas. Great for budget-conscious renters.",
            price: "400.00",
            priceType: "fixed",
            location: "Residential Area",
            condition: "good",
            tags: ["shared", "family", "utilities-included", "budget"],
            images: [],
          }
        );
      }

      // Food category listings
      const foodCategory = categories.find(c => c.name === "Food");
      if (foodCategory) {
        mockListings.push(
          {
            userId,
            categoryId: foodCategory.id,
            title: "Weekly Meal Prep Service",
            description: "Healthy, portion-controlled meals prepared fresh weekly. Choose from various dietary options including vegetarian, keto, and gluten-free.",
            price: "8.50",
            originalPrice: "10.00",
            priceType: "fixed",
            location: "Citywide Delivery",
            condition: "new",
            brand: "Fresh Meals Co.",
            tags: ["healthy", "meal-prep", "delivery", "dietary-options"],
            images: [],
            isFeatured: true,
            shippingInfo: "Free delivery on orders over $50",
            returnPolicy: "Full refund if not satisfied"
          },
          {
            userId,
            categoryId: foodCategory.id,
            title: "Community Food Share Program",
            description: "Free fresh produce and pantry items for families in need. Available every Saturday morning at the community center.",
            price: "0.00",
            priceType: "free",
            location: "Community Center",
            condition: "good",
            tags: ["free", "community", "fresh-produce", "pantry"],
            images: [],
          }
        );
      }

      // Employment category listings
      const employmentCategory = categories.find(c => c.name === "Employment");
      if (employmentCategory) {
        mockListings.push(
          {
            userId,
            categoryId: employmentCategory.id,
            title: "Remote Data Entry Position",
            description: "Flexible remote data entry position with competitive hourly pay. Perfect for students or those seeking part-time work. Training provided.",
            price: "15.00",
            priceType: "fixed",
            location: "Remote Work",
            condition: "new",
            brand: "TechCorp Solutions",
            tags: ["remote", "data-entry", "flexible", "part-time"],
            images: [],
            isFeatured: true,
            shippingInfo: "Equipment provided",
            returnPolicy: "No commitment required"
          },
          {
            userId,
            categoryId: employmentCategory.id,
            title: "Trades Apprenticeship Program",
            description: "Paid apprenticeship program for electrical, plumbing, and HVAC trades. Earn while you learn with experienced professionals.",
            price: "0.00",
            priceType: "free",
            location: "Training Center",
            condition: "new",
            tags: ["apprenticeship", "trades", "paid-training", "career"],
            images: [],
          }
        );
      }

      // Healthcare category listings
      const healthcareCategory = categories.find(c => c.name === "Healthcare");
      if (healthcareCategory) {
        mockListings.push(
          {
            userId,
            categoryId: healthcareCategory.id,
            title: "Affordable Health Checkup Package",
            description: "Comprehensive health checkup package including blood work, physical exam, and consultation. Sliding scale pricing available.",
            price: "150.00",
            originalPrice: "200.00",
            priceType: "negotiable",
            location: "Health Clinic",
            condition: "new",
            brand: "Community Health Services",
            tags: ["health", "checkup", "affordable", "comprehensive"],
            images: [],
            isFeatured: true,
            shippingInfo: "Same-day appointments available",
            returnPolicy: "Satisfaction guaranteed"
          },
          {
            userId,
            categoryId: healthcareCategory.id,
            title: "Free Mental Health Support Group",
            description: "Weekly support group meetings for mental health and wellness. Professional facilitator and peer support in a safe environment.",
            price: "0.00",
            priceType: "free",
            location: "Community Center",
            condition: "new",
            tags: ["mental-health", "support-group", "free", "weekly"],
            images: [],
          }
        );
      }

      // Education category listings
      const educationCategory = categories.find(c => c.name === "Education");
      if (educationCategory) {
        mockListings.push(
          {
            userId,
            categoryId: educationCategory.id,
            title: "Online Programming Bootcamp",
            description: "Intensive 12-week online programming bootcamp covering modern web development. Job placement assistance included.",
            price: "2500.00",
            originalPrice: "3000.00",
            priceType: "fixed",
            location: "Online",
            condition: "new",
            brand: "CodeAcademy Pro",
            tags: ["programming", "bootcamp", "online", "job-placement"],
            images: [],
            isFeatured: true,
            shippingInfo: "Digital course materials",
            returnPolicy: "30-day money-back guarantee"
          },
          {
            userId,
            categoryId: educationCategory.id,
            title: "Free Adult Literacy Classes",
            description: "Free adult literacy and basic education classes. Small group settings with experienced instructors. Flexible scheduling available.",
            price: "0.00",
            priceType: "free",
            location: "Library",
            condition: "new",
            tags: ["literacy", "education", "free", "adult-learning"],
            images: [],
          }
        );
      }

      // Transportation category listings
      const transportationCategory = categories.find(c => c.name === "Transportation");
      if (transportationCategory) {
        mockListings.push(
          {
            userId,
            categoryId: transportationCategory.id,
            title: "Monthly Transit Pass - Discounted",
            description: "Discounted monthly public transit pass for eligible residents. Includes bus and light rail access throughout the city.",
            price: "25.00",
            originalPrice: "50.00",
            priceType: "fixed",
            location: "Transit Authority",
            condition: "new",
            brand: "City Transit",
            tags: ["transit", "monthly-pass", "discounted", "public-transport"],
            images: [],
            isFeatured: true,
            shippingInfo: "Pick up at transit centers",
            returnPolicy: "Refundable within 7 days"
          },
          {
            userId,
            categoryId: transportationCategory.id,
            title: "Free Ride Share for Seniors",
            description: "Free transportation service for seniors to medical appointments and essential errands. Volunteer drivers with background checks.",
            price: "0.00",
            priceType: "free",
            location: "Citywide",
            condition: "new",
            tags: ["seniors", "free", "medical-transport", "volunteer"],
            images: [],
          }
        );
      }

      // Legal Aid category listings
      const legalCategory = categories.find(c => c.name === "Legal Aid");
      if (legalCategory) {
        mockListings.push(
          {
            userId,
            categoryId: legalCategory.id,
            title: "Document Preparation Service",
            description: "Professional legal document preparation for wills, power of attorney, and other legal forms. Affordable rates with expert guidance.",
            price: "75.00",
            priceType: "fixed",
            location: "Legal Office",
            condition: "new",
            brand: "Legal Aid Society",
            tags: ["legal", "documents", "affordable", "professional"],
            images: [],
            isFeatured: true,
            shippingInfo: "Same-day service available",
            returnPolicy: "Satisfaction guaranteed"
          },
          {
            userId,
            categoryId: legalCategory.id,
            title: "Free Legal Consultation",
            description: "Free 30-minute legal consultation for qualifying individuals. Covers housing, employment, and family law matters.",
            price: "0.00",
            priceType: "free",
            location: "Legal Clinic",
            condition: "new",
            tags: ["free", "consultation", "legal-advice", "clinic"],
            images: [],
          }
        );
      }

      // Community Services category listings
      const communityCategory = categories.find(c => c.name === "Community Services");
      if (communityCategory) {
        mockListings.push(
          {
            userId,
            categoryId: communityCategory.id,
            title: "Volunteer Opportunity - Food Bank",
            description: "Join our team of volunteers at the local food bank. Flexible scheduling and meaningful work helping community members in need.",
            price: "0.00",
            priceType: "free",
            location: "Food Bank",
            condition: "new",
            tags: ["volunteer", "food-bank", "community", "flexible"],
            images: [],
            isFeatured: true,
            shippingInfo: "Training provided",
            returnPolicy: "No commitment required"
          },
          {
            userId,
            categoryId: communityCategory.id,
            title: "Community Garden Plot Rental",
            description: "Rent a plot in our community garden for the growing season. Includes water access, tools, and gardening workshops.",
            price: "50.00",
            priceType: "fixed",
            location: "Community Garden",
            condition: "good",
            tags: ["garden", "rental", "community", "seasonal"],
            images: [],
          }
        );
      }

      // Create all listings
      for (const listingData of mockListings) {
        await storage.createListing(listingData);
      }

      res.json({ 
        message: `Successfully created ${mockListings.length} marketplace listings`,
        count: mockListings.length 
      });
    } catch (error) {
      console.error("Error seeding marketplace:", error);
      res.status(500).json({ message: "Failed to seed marketplace" });
    }
  });

  // Seed forum posts route
  app.post("/api/seed/forum-posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categories = await storage.getCategories();
      const mockPosts = [];

      // Housing category posts
      const housingCategory = categories.find(c => c.name === "Housing");
      if (housingCategory) {
        mockPosts.push(
          {
            userId,
            categoryId: housingCategory.id,
            title: "🏠 Affordable 2BR Apartment - $850/month",
            content: `Looking for a comfortable 2-bedroom apartment in downtown area. Recently renovated with:
• Modern kitchen with stainless steel appliances
• In-unit washer/dryer
• Parking space included
• Pet-friendly building
• Near public transportation

**Rent: $850/month**
**Deposit: $500**
**Available: Immediately**

Contact me for viewing appointments!`,
            productRating: 4,
          },
          {
            userId,
            categoryId: housingCategory.id,
            title: "🏡 Room for Rent in Shared House - $400/month",
            content: `Nice room available in a clean, quiet shared house. Perfect for students or young professionals.

**Features:**
• Furnished bedroom
• Shared kitchen and living room
• Utilities included
• WiFi included
• Laundry facilities
• Safe neighborhood

**Monthly Rent: $400**
**Security deposit: $200**
**Available: Next month**

Looking for responsible, clean tenant. No smoking, no pets.`,
            productRating: 4,
          }
        );
      }

      // Food category posts
      const foodCategory = categories.find(c => c.name === "Food");
      if (foodCategory) {
        mockPosts.push(
          {
            userId,
            categoryId: foodCategory.id,
            title: "🍕 Local Food Bank - Free Meals Available",
            content: `Our community food bank provides free meals and groceries to families in need.

**Services Available:**
• Hot meals (Mon-Fri, 12-2 PM)
• Grocery packages (Saturdays, 9 AM-12 PM)
• Fresh produce when available
• Baby food and formula
• Special dietary accommodations

**Location:** 123 Community Center Dr.
**No income verification required**
**Just bring ID and proof of address**

We're here to help during difficult times. No questions asked, just support.`,
            productRating: 5,
          },
          {
            userId,
            categoryId: foodCategory.id,
            title: "🥗 Healthy Meal Prep Service - $8/meal",
            content: `Professional meal prep service offering nutritious, affordable meals delivered to your door.

**Meal Plans:**
• 5 meals/week: $40 ($8/meal)
• 10 meals/week: $75 ($7.50/meal)
• 15 meals/week: $105 ($7/meal)

**Features:**
• Fresh, locally-sourced ingredients
• Customizable dietary preferences
• Vegetarian, vegan, gluten-free options
• Delivered twice weekly
• Recyclable packaging

**Special discount for seniors and students: 20% off**
Order by Wednesday for next week delivery!`,
            productRating: 5,
          }
        );
      }

      // Employment category posts
      const employmentCategory = categories.find(c => c.name === "Employment");
      if (employmentCategory) {
        mockPosts.push(
          {
            userId,
            categoryId: employmentCategory.id,
            title: "💼 Part-time Customer Service - $15/hour",
            content: `Local retail store hiring part-time customer service representatives.

**Position Details:**
• 20-25 hours per week
• Flexible scheduling
• Evening and weekend availability required
• No experience necessary - will train

**Requirements:**
• High school diploma or equivalent
• Good communication skills
• Reliable transportation
• Able to stand for extended periods

**Benefits:**
• $15/hour starting wage
• Employee discount
• Flexible scheduling
• Growth opportunities

Apply in person at our downtown location or call (555) 123-4567`,
            productRating: 4,
          },
          {
            userId,
            categoryId: employmentCategory.id,
            title: "🔧 Skilled Trades Training Program - FREE",
            content: `6-month free training program for electrical, plumbing, and HVAC trades.

**Program Includes:**
• 240 hours of hands-on training
• Industry-standard certifications
• Job placement assistance
• Tool lending program
• Transportation vouchers

**Requirements:**
• 18+ years old
• High school diploma/GED
• Pass basic math and reading assessment
• Background check

**Starting Salary After Completion:**
• Electrical: $22-28/hour
• Plumbing: $20-26/hour
• HVAC: $18-24/hour

**Next enrollment:** March 1st
**Application deadline:** February 15th
Apply online or visit our center!`,
            productRating: 5,
          }
        );
      }

      // Healthcare category posts
      const healthcareCategory = categories.find(c => c.name === "Healthcare");
      if (healthcareCategory) {
        mockPosts.push(
          {
            userId,
            categoryId: healthcareCategory.id,
            title: "🏥 Free Health Clinic - Walk-ins Welcome",
            content: `Community health clinic providing free medical services to uninsured individuals and families.

**Services Offered:**
• Primary care consultations
• Preventive screenings
• Vaccination programs
• Basic dental care
• Mental health counseling
• Prescription assistance program

**Hours:**
• Monday-Friday: 8 AM - 6 PM
• Saturday: 9 AM - 2 PM
• Emergency services: 24/7

**What to Bring:**
• Photo ID
• Proof of income (if available)
• List of current medications
• Insurance card (if you have one)

**Location:** 456 Health Center Blvd.
**Phone:** (555) 987-6543
No appointment necessary for basic services!`,
            productRating: 5,
          },
          {
            userId,
            categoryId: healthcareCategory.id,
            title: "💊 Affordable Prescription Program",
            content: `Discounted prescription medications for low-income residents.

**Savings:**
• Generic medications: Up to 80% off
• Brand name drugs: Up to 60% off
• Insulin: Starting at $35/month
• Common antibiotics: $4-10

**Eligibility:**
• Household income below 200% of federal poverty level
• No insurance or high deductible plans
• Must be US resident

**How to Apply:**
1. Fill out income verification form
2. Bring recent pay stubs or tax return
3. Get doctor's prescription
4. Pick up at participating pharmacies

**Processing time:** 2-3 business days
**Annual membership:** $20/family
Call (555) 456-7890 for more information`,
            productRating: 4,
          }
        );
      }

      // Education category posts
      const educationCategory = categories.find(c => c.name === "Education");
      if (educationCategory) {
        mockPosts.push(
          {
            userId,
            categoryId: educationCategory.id,
            title: "📚 Free GED Preparation Classes",
            content: `Comprehensive GED preparation program to help you earn your high school equivalency diploma.

**Program Features:**
• 12-week intensive course
• All four subject areas covered
• Small class sizes (max 15 students)
• Experienced instructors
• Free materials and practice tests
• Flexible evening schedule

**Class Schedule:**
• Monday/Wednesday: 6-8 PM (Math & Science)
• Tuesday/Thursday: 6-8 PM (English & Social Studies)
• Saturday: 9 AM-12 PM (Review & Practice Tests)

**Requirements:**
• Must be 18+ years old
• Not currently enrolled in high school
• Commitment to attend regularly

**Success Rate:** 85% of students pass on first attempt
**Next session starts:** January 15th
**Registration deadline:** January 8th
Call (555) 234-5678 to register!`,
            productRating: 5,
          },
          {
            userId,
            categoryId: educationCategory.id,
            title: "💻 Computer Skills Workshop - $25/session",
            content: `Basic computer and internet skills workshop for beginners.

**Workshop Topics:**
• Basic computer operation
• Internet browsing and email
• Microsoft Office basics
• Online job applications
• Social media safety
• Digital banking basics

**Session Details:**
• 2-hour sessions
• Hands-on practice
• Take-home materials
• Small group setting (8 people max)
• Laptops provided

**Pricing:**
• Single session: $25
• 4-session package: $80 (save $20)
• 8-session complete course: $150 (save $50)

**Scholarships available** for those who qualify
**Next workshop:** This Saturday 10 AM-12 PM
Register at community center or call (555) 345-6789`,
            productRating: 4,
          }
        );
      }

      // Transportation category posts
      const transportationCategory = categories.find(c => c.name === "Transportation");
      if (transportationCategory) {
        mockPosts.push(
          {
            userId,
            categoryId: transportationCategory.id,
            title: "🚗 Free Transportation to Medical Appointments",
            content: `Volunteer-driven transportation service for medical appointments and essential errands.

**Services Provided:**
• Doctor appointments
• Hospital visits
• Pharmacy trips
• Grocery shopping
• Social services appointments

**Service Area:**
• City limits and surrounding areas
• Up to 20 miles from downtown
• Wheelchair accessible vehicles available

**How to Schedule:**
• Call at least 48 hours in advance
• Provide appointment details
• Confirm pickup location
• Be ready 15 minutes early

**Eligibility:**
• Seniors 65+
• Individuals with disabilities
• Low-income households
• No reliable transportation

**Phone:** (555) 567-8901
**Hours:** Monday-Friday, 8 AM-5 PM
**100% FREE SERVICE** - donations welcome but not required`,
            productRating: 5,
          },
          {
            userId,
            categoryId: transportationCategory.id,
            title: "🚌 Discounted Bus Passes Available",
            content: `Reduced-fare public transportation passes for qualifying residents.

**Available Passes:**
• Monthly pass: $15 (regular price $50)
• Weekly pass: $5 (regular price $15)
• Daily pass: $1 (regular price $3)
• Student pass: $10/month (with valid ID)

**Eligibility:**
• Household income below 150% of poverty level
• Senior citizens 65+
• Disabled individuals
• Students with valid ID

**Required Documents:**
• Photo ID
• Proof of income or benefits
• Proof of residence
• Student ID (if applicable)

**Where to Apply:**
• Transportation Authority Office
• Community service centers
• Online application available

**Processing Time:** 5-7 business days
**Renewal:** Required every 6 months
Visit transportationauthority.com for more details`,
            productRating: 4,
          }
        );
      }

      // Legal Aid category posts
      const legalCategory = categories.find(c => c.name === "Legal Aid");
      if (legalCategory) {
        mockPosts.push(
          {
            userId,
            categoryId: legalCategory.id,
            title: "⚖️ Free Legal Consultation - Housing Rights",
            content: `Free legal advice and representation for housing-related issues.

**Services Offered:**
• Landlord-tenant disputes
• Eviction defense
• Housing discrimination
• Lease review and negotiation
• Security deposit recovery
• Habitability issues

**Consultation Process:**
• 30-minute free consultation
• Case evaluation
• Legal advice and options
• Court representation if needed
• Document preparation assistance

**Eligibility:**
• Income below 200% of federal poverty level
• Legal issue within our service area
• Not currently represented by another attorney

**Office Hours:**
• Monday-Friday: 9 AM-5 PM
• Saturday: 10 AM-2 PM (appointments only)
• Emergency consultations available

**Contact:**
• Phone: (555) 678-9012
• Walk-ins welcome Tuesday/Thursday 1-4 PM
• Online scheduling available
Located at 789 Justice Center Dr.`,
            productRating: 5,
          },
          {
            userId,
            categoryId: legalCategory.id,
            title: "📝 Document Preparation Service - $50-150",
            content: `Affordable legal document preparation for common legal needs.

**Documents We Prepare:**
• Wills and basic estate planning: $75
• Power of attorney: $50
• Living wills/advance directives: $50
• Divorce papers (uncontested): $150
• Name change petitions: $100
• Small claims court filings: $75

**Process:**
1. Initial consultation (free)
2. Document review and preparation
3. Notarization service included
4. Filing assistance available

**What's Included:**
• Professional document drafting
• Legal guidance on completion
• Notary services
• Basic filing instructions
• One revision included

**Payment Plans Available**
**Senior/Student Discount:** 20% off
**Office Hours:** Monday-Friday 9 AM-5 PM
**Appointments:** Call (555) 789-0123
Located next to courthouse for your convenience`,
            productRating: 4,
          }
        );
      }

      // Community Services category posts
      const communityCategory = categories.find(c => c.name === "Community Services");
      if (communityCategory) {
        mockPosts.push(
          {
            userId,
            categoryId: communityCategory.id,
            title: "🤝 Volunteer Opportunities - Give Back to Community",
            content: `Multiple volunteer opportunities available to help your neighbors in need.

**Current Needs:**
• Food bank sorting and distribution
• Tutoring and mentoring
• Senior companion visits
• Community garden maintenance
• Event planning and coordination
• Transportation assistance

**Time Commitments:**
• One-time events: 2-4 hours
• Regular volunteer: 2-3 hours/week
• Specialized skills: Flexible schedule
• Group volunteering welcome

**Benefits of Volunteering:**
• Make a real difference in your community
• Meet like-minded people
• Develop new skills
• Build professional network
• Feel-good factor

**Training Provided:**
• Orientation session
• Skill-specific training
• Ongoing support
• Recognition events

**How to Get Started:**
1. Attend orientation (every 2nd Saturday)
2. Complete background check
3. Choose your volunteer role
4. Start making a difference!

**Contact:** volunteer@communityservices.org
**Phone:** (555) 890-1234`,
            productRating: 5,
          },
          {
            userId,
            categoryId: communityCategory.id,
            title: "🎒 Back-to-School Supply Drive - Donations Needed",
            content: `Annual school supply drive to help local students start the year prepared.

**Items Needed:**
• Backpacks and lunch boxes
• Notebooks and composition books
• Pens, pencils, and markers
• Calculators and rulers
• Binders and folders
• Art supplies
• Gift cards to office supply stores

**Donation Guidelines:**
• New items only
• Age-appropriate supplies
• Check current school supply lists
• Monetary donations welcome

**Distribution Details:**
• Serves 500+ local students
• K-12 grade levels
• No income verification required
• First-come, first-served basis

**Drop-off Locations:**
• Community center main desk
• Local churches and schools
• Corporate partner locations
• Volunteers can pick up large donations

**Timeline:**
• Collection: July 1-31
• Sorting: August 1-7
• Distribution: August 8-15

**Volunteer Opportunities:**
• Collection coordination
• Sorting and organizing
• Distribution day assistance

**Impact:** Last year we helped 487 students!
**Contact:** schoolsupplies@community.org`,
            productRating: 5,
          }
        );
      }

      // Create all posts
      for (const postData of mockPosts) {
        await storage.createForumPost(postData);
      }

      res.json({ 
        message: `Successfully created ${mockPosts.length} mock forum posts`,
        count: mockPosts.length 
      });
    } catch (error) {
      console.error("Error seeding forum posts:", error);
      res.status(500).json({ message: "Failed to seed forum posts" });
    }
  });

  // Forum routes
  app.get("/api/forum/posts", async (req, res) => {
    try {
      const { categoryId, limit, offset } = req.query;
      const posts = await storage.getForumPosts({
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(posts);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });

  app.get("/api/forum/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getForumPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Forum post not found" });
      }
      
      // Increment view count
      await storage.incrementForumPostViewCount(postId);
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching forum post:", error);
      res.status(500).json({ message: "Failed to fetch forum post" });
    }
  });

  app.post("/api/forum/posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const post = await storage.createForumPost({
        ...req.body,
        userId,
      });
      res.json(post);
    } catch (error) {
      console.error("Error creating forum post:", error);
      res.status(500).json({ message: "Failed to create forum post" });
    }
  });

  app.put("/api/forum/posts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      
      // Check if user owns the post
      const post = await storage.getForumPost(postId);
      
      if (!post || post.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to edit this post" });
      }
      
      const updatedPost = await storage.updateForumPost(postId, req.body);
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating forum post:", error);
      res.status(500).json({ message: "Failed to update forum post" });
    }
  });

  app.delete("/api/forum/posts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      
      // Check if user owns the post
      const post = await storage.getForumPost(postId);
      
      if (!post || post.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }
      
      await storage.deleteForumPost(postId);
      res.json({ message: "Forum post deleted successfully" });
    } catch (error) {
      console.error("Error deleting forum post:", error);
      res.status(500).json({ message: "Failed to delete forum post" });
    }
  });

  // Review routes
  app.get("/api/reviews", async (req, res) => {
    try {
      const { reviewedUserId, listingId, limit, offset } = req.query;
      const reviews = await storage.getReviews({
        reviewedUserId: reviewedUserId as string,
        listingId: listingId ? parseInt(listingId as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const review = await storage.createReview({
        ...req.body,
        reviewerId: userId,
      });
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.put("/api/reviews/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewId = parseInt(req.params.id);
      
      // Check if user owns the review
      const existingReviews = await storage.getReviews();
      const review = existingReviews.find(r => r.id === reviewId);
      
      if (!review || review.reviewerId !== userId) {
        return res.status(403).json({ message: "Not authorized to edit this review" });
      }
      
      const updatedReview = await storage.updateReview(reviewId, req.body);
      res.json(updatedReview);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.delete("/api/reviews/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewId = parseInt(req.params.id);
      
      // Check if user owns the review
      const existingReviews = await storage.getReviews();
      const review = existingReviews.find(r => r.id === reviewId);
      
      if (!review || review.reviewerId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this review" });
      }
      
      await storage.deleteReview(reviewId);
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // User rating routes
  app.get("/api/users/:id/rating", async (req, res) => {
    try {
      const userId = req.params.id;
      const rating = await storage.getUserRating(userId);
      res.json(rating || { totalPoints: 0, totalReviews: 0, averageRating: 0 });
    } catch (error) {
      console.error("Error fetching user rating:", error);
      res.status(500).json({ message: "Failed to fetch user rating" });
    }
  });

  // Cart endpoints
  app.get("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.get("/api/cart/count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getCartItemsCount(userId);
      res.json(count);
    } catch (error) {
      console.error("Error fetching cart count:", error);
      res.status(500).json({ message: "Failed to fetch cart count" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { listingId, quantity } = req.body;
      
      const cartItem = await storage.addToCart(userId, listingId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      const cartItem = await storage.updateCartItem(userId, cartItemId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItemId = parseInt(req.params.id);
      
      await storage.removeFromCart(userId, cartItemId);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Wishlist endpoints
  app.get("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistItems = await storage.getWishlistItems(userId);
      res.json(wishlistItems.map(item => item.listingId));
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist/toggle", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { listingId } = req.body;
      
      const result = await storage.toggleWishlistItem(userId, listingId);
      res.json(result);
    } catch (error) {
      console.error("Error toggling wishlist item:", error);
      res.status(500).json({ message: "Failed to toggle wishlist item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
