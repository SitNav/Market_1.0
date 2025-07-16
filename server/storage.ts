import {
  users,
  categories,
  listings,
  messages,
  reports,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Listing,
  type InsertListing,
  type ListingWithDetails,
  type Message,
  type InsertMessage,
  type MessageWithDetails,
  type Report,
  type InsertReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, or, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Listing operations
  getListings(params?: { 
    categoryId?: number; 
    userId?: string; 
    search?: string; 
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ListingWithDetails[]>;
  getListing(id: number): Promise<ListingWithDetails | undefined>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: number, listing: Partial<InsertListing>): Promise<Listing>;
  deleteListing(id: number): Promise<void>;
  incrementViewCount(id: number): Promise<void>;
  
  // Message operations
  getMessages(userId: string, listingId?: number): Promise<MessageWithDetails[]>;
  getConversations(userId: string): Promise<MessageWithDetails[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<void>;
  
  // Report operations
  getReports(status?: string): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReportStatus(id: number, status: string): Promise<Report>;
  
  // Admin operations
  getUsersCount(): Promise<number>;
  getListingsCount(): Promise<number>;
  getReportsCount(): Promise<number>;
  getPendingReportsCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Listing operations
  async getListings(params?: { 
    categoryId?: number; 
    userId?: string; 
    search?: string; 
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ListingWithDetails[]> {
    const { categoryId, userId, search, status = 'active', limit = 20, offset = 0 } = params || {};
    
    const baseQuery = db
      .select({
        id: listings.id,
        userId: listings.userId,
        categoryId: listings.categoryId,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        priceType: listings.priceType,
        location: listings.location,
        images: listings.images,
        status: listings.status,
        isPromoted: listings.isPromoted,
        viewCount: listings.viewCount,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
          color: categories.color,
        },
      })
      .from(listings)
      .leftJoin(users, eq(listings.userId, users.id))
      .leftJoin(categories, eq(listings.categoryId, categories.id));

    const conditions = [];
    
    if (status) {
      conditions.push(eq(listings.status, status));
    }
    
    if (categoryId) {
      conditions.push(eq(listings.categoryId, categoryId));
    }
    
    if (userId) {
      conditions.push(eq(listings.userId, userId));
    }
    
    if (search) {
      conditions.push(
        or(
          like(listings.title, `%${search}%`),
          like(listings.description, `%${search}%`)
        )
      );
    }

    let query = baseQuery;
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(listings.isPromoted), desc(listings.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map(result => ({
      ...result,
      user: result.user as User,
      category: result.category as Category,
      images: result.images || [],
    }));
  }

  async getListing(id: number): Promise<ListingWithDetails | undefined> {
    const [result] = await db
      .select({
        id: listings.id,
        userId: listings.userId,
        categoryId: listings.categoryId,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        priceType: listings.priceType,
        location: listings.location,
        images: listings.images,
        status: listings.status,
        isPromoted: listings.isPromoted,
        viewCount: listings.viewCount,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
          color: categories.color,
        },
      })
      .from(listings)
      .leftJoin(users, eq(listings.userId, users.id))
      .leftJoin(categories, eq(listings.categoryId, categories.id))
      .where(eq(listings.id, id));

    if (!result) return undefined;

    return {
      ...result,
      user: result.user as User,
      category: result.category as Category,
      images: result.images || [],
    };
  }

  async createListing(listing: InsertListing): Promise<Listing> {
    const [newListing] = await db.insert(listings).values(listing).returning();
    return newListing;
  }

  async updateListing(id: number, listingData: Partial<InsertListing>): Promise<Listing> {
    const [listing] = await db
      .update(listings)
      .set({ ...listingData, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }

  async deleteListing(id: number): Promise<void> {
    await db.delete(listings).where(eq(listings.id, id));
  }

  async incrementViewCount(id: number): Promise<void> {
    await db
      .update(listings)
      .set({ viewCount: sql`${listings.viewCount} + 1` })
      .where(eq(listings.id, id));
  }

  // Message operations
  async getMessages(userId: string, listingId?: number): Promise<MessageWithDetails[]> {
    let query = db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        listingId: messages.listingId,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        sender: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
        receiver: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
        listing: {
          id: listings.id,
          title: listings.title,
        },
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .leftJoin(listings, eq(messages.listingId, listings.id));

    const conditions = [
      or(
        eq(messages.senderId, userId),
        eq(messages.receiverId, userId)
      )
    ];

    if (listingId) {
      conditions.push(eq(messages.listingId, listingId));
    }

    const results = await query
      .where(and(...conditions))
      .orderBy(desc(messages.createdAt));

    return results.map(result => ({
      ...result,
      sender: result.sender as User,
      receiver: result.receiver as User,
      listing: result.listing as Listing,
    }));
  }

  async getConversations(userId: string): Promise<MessageWithDetails[]> {
    // Get latest message for each conversation
    const results = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        listingId: messages.listingId,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        sender: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
        receiver: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
        listing: {
          id: listings.id,
          title: listings.title,
        },
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .leftJoin(listings, eq(messages.listingId, listings.id))
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(desc(messages.createdAt));

    return results.map(result => ({
      ...result,
      sender: result.sender as User,
      receiver: result.receiver as User,
      listing: result.listing as Listing,
    }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id));
  }

  // Report operations
  async getReports(status?: string): Promise<Report[]> {
    const baseQuery = db.select().from(reports);
    
    if (status) {
      return await baseQuery.where(eq(reports.status, status)).orderBy(desc(reports.createdAt));
    }
    
    return await baseQuery.orderBy(desc(reports.createdAt));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async updateReportStatus(id: number, status: string): Promise<Report> {
    const [report] = await db
      .update(reports)
      .set({ status })
      .where(eq(reports.id, id))
      .returning();
    return report;
  }

  // Admin operations
  async getUsersCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(users);
    return result.count;
  }

  async getListingsCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(listings);
    return result.count;
  }

  async getReportsCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(reports);
    return result.count;
  }

  async getPendingReportsCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(reports)
      .where(eq(reports.status, 'pending'));
    return result.count;
  }
}

export const storage = new DatabaseStorage();
