import {
  users,
  categories,
  listings,
  messages,
  reports,
  comments,
  forumPosts,
  reviews,
  userRatings,
  cart,
  wishlist,
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
  type Comment,
  type InsertComment,
  type CommentWithDetails,
  type ForumPost,
  type InsertForumPost,
  type ForumPostWithDetails,
  type Review,
  type InsertReview,
  type ReviewWithDetails,
  type UserRating,
  type InsertUserRating,
  type UserWithRating,
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
    condition?: string;
    brand?: string;
    model?: string;
    size?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
    city?: string;
    state?: string;
    zipCode?: string;
    latitude?: string;
    longitude?: string;
    radius?: number;
    sortBy?: string;
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
  
  // Comment operations
  getComments(params?: { listingId?: number; forumPostId?: number; parentId?: number }): Promise<CommentWithDetails[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<InsertComment>): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
  
  // Forum operations
  getForumPosts(params?: { categoryId?: number; limit?: number; offset?: number }): Promise<ForumPostWithDetails[]>;
  getForumPost(id: number): Promise<ForumPostWithDetails | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  updateForumPost(id: number, post: Partial<InsertForumPost>): Promise<ForumPost>;
  deleteForumPost(id: number): Promise<void>;
  incrementForumPostViewCount(id: number): Promise<void>;
  
  // Review operations
  getReviews(params?: { reviewedUserId?: string; listingId?: number; limit?: number; offset?: number }): Promise<ReviewWithDetails[]>;
  getUserReviews(userId: string): Promise<ReviewWithDetails[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<InsertReview>): Promise<Review>;
  deleteReview(id: number): Promise<void>;
  
  // User rating operations
  getUserRating(userId: string): Promise<UserRating | undefined>;
  updateUserRating(userId: string, rating: Partial<InsertUserRating>): Promise<UserRating>;
  calculateUserRating(userId: string): Promise<void>;
  
  // Cart operations
  getCartItems(userId: string): Promise<any[]>;
  getCartItemsCount(userId: string): Promise<number>;
  addToCart(userId: string, listingId: number, quantity: number): Promise<any>;
  updateCartItem(userId: string, cartItemId: number, quantity: number): Promise<any>;
  removeFromCart(userId: string, cartItemId: number): Promise<void>;
  
  // Wishlist operations
  getWishlistItems(userId: string): Promise<any[]>;
  toggleWishlistItem(userId: string, listingId: number): Promise<any>;
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
      sortBy = 'newest',
      limit = 20, 
      offset = 0 
    } = params || {};
    
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
        city: listings.city,
        state: listings.state,
        zipCode: listings.zipCode,
        latitude: listings.latitude,
        longitude: listings.longitude,
        condition: listings.condition,
        brand: listings.brand,
        model: listings.model,
        size: listings.size,
        color: listings.color,
        weight: listings.weight,
        dimensions: listings.dimensions,
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
          like(listings.description, `%${search}%`),
          like(listings.location, `%${search}%`),
          like(listings.brand, `%${search}%`),
          like(listings.model, `%${search}%`),
          like(listings.city, `%${search}%`),
          like(listings.state, `%${search}%`)
        )
      );
    }
    
    if (condition) {
      conditions.push(eq(listings.condition, condition));
    }
    
    if (brand) {
      conditions.push(eq(listings.brand, brand));
    }
    
    if (model) {
      conditions.push(eq(listings.model, model));
    }
    
    if (size) {
      conditions.push(eq(listings.size, size));
    }
    
    if (color) {
      conditions.push(eq(listings.color, color));
    }
    
    if (minPrice !== undefined) {
      conditions.push(sql`${listings.price} >= ${minPrice}`);
    }
    
    if (maxPrice !== undefined) {
      conditions.push(sql`${listings.price} <= ${maxPrice}`);
    }
    
    if (city) {
      conditions.push(eq(listings.city, city));
    }
    
    if (state) {
      conditions.push(eq(listings.state, state));
    }
    
    if (zipCode) {
      conditions.push(eq(listings.zipCode, zipCode));
    }
    
    // Location-based search using radius
    if (latitude && longitude && radius) {
      conditions.push(
        sql`(
          6371 * acos(
            cos(radians(${latitude})) * 
            cos(radians(CAST(${listings.latitude} AS DECIMAL))) * 
            cos(radians(CAST(${listings.longitude} AS DECIMAL)) - radians(${longitude})) + 
            sin(radians(${latitude})) * 
            sin(radians(CAST(${listings.latitude} AS DECIMAL)))
          )
        ) <= ${radius}`
      );
    }

    let query = baseQuery;
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    let orderByClause;
    switch (sortBy) {
      case 'price_low':
        orderByClause = [desc(listings.isPromoted), asc(listings.price)];
        break;
      case 'price_high':
        orderByClause = [desc(listings.isPromoted), desc(listings.price)];
        break;
      case 'oldest':
        orderByClause = [desc(listings.isPromoted), asc(listings.createdAt)];
        break;
      case 'most_viewed':
        orderByClause = [desc(listings.isPromoted), desc(listings.viewCount)];
        break;
      case 'newest':
      default:
        orderByClause = [desc(listings.isPromoted), desc(listings.createdAt)];
        break;
    }

    const results = await query
      .orderBy(...orderByClause)
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

  // Comment operations
  async getComments(params?: { listingId?: number; forumPostId?: number; parentId?: number }): Promise<CommentWithDetails[]> {
    const { listingId, forumPostId, parentId } = params || {};
    
    let query = db
      .select({
        id: comments.id,
        userId: comments.userId,
        listingId: comments.listingId,
        forumPostId: comments.forumPostId,
        parentId: comments.parentId,
        content: comments.content,
        isEdited: comments.isEdited,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id));

    const conditions = [];
    
    if (listingId) {
      conditions.push(eq(comments.listingId, listingId));
    }
    
    if (forumPostId) {
      conditions.push(eq(comments.forumPostId, forumPostId));
    }
    
    if (parentId !== undefined) {
      conditions.push(parentId ? eq(comments.parentId, parentId) : sql`${comments.parentId} IS NULL`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(asc(comments.createdAt));
    
    return results.map(result => ({
      ...result,
      user: result.user as User,
    }));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async updateComment(id: number, commentData: Partial<InsertComment>): Promise<Comment> {
    const [comment] = await db
      .update(comments)
      .set({ ...commentData, isEdited: true, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return comment;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  // Forum operations
  async getForumPosts(params?: { categoryId?: number; limit?: number; offset?: number }): Promise<ForumPostWithDetails[]> {
    const { categoryId, limit = 20, offset = 0 } = params || {};
    
    let query = db
      .select({
        id: forumPosts.id,
        userId: forumPosts.userId,
        categoryId: forumPosts.categoryId,
        title: forumPosts.title,
        content: forumPosts.content,
        isPinned: forumPosts.isPinned,
        isLocked: forumPosts.isLocked,
        viewCount: forumPosts.viewCount,
        createdAt: forumPosts.createdAt,
        updatedAt: forumPosts.updatedAt,
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
          color: categories.color,
          icon: categories.icon,
        },
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .leftJoin(categories, eq(forumPosts.categoryId, categories.id));

    if (categoryId) {
      query = query.where(eq(forumPosts.categoryId, categoryId));
    }

    const results = await query
      .orderBy(desc(forumPosts.isPinned), desc(forumPosts.createdAt))
      .limit(limit)
      .offset(offset);
    
    return results.map(result => ({
      ...result,
      user: result.user as User,
      category: result.category as Category,
    }));
  }

  async getForumPost(id: number): Promise<ForumPostWithDetails | undefined> {
    const [result] = await db
      .select({
        id: forumPosts.id,
        userId: forumPosts.userId,
        categoryId: forumPosts.categoryId,
        title: forumPosts.title,
        content: forumPosts.content,
        isPinned: forumPosts.isPinned,
        isLocked: forumPosts.isLocked,
        viewCount: forumPosts.viewCount,
        createdAt: forumPosts.createdAt,
        updatedAt: forumPosts.updatedAt,
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
          color: categories.color,
          icon: categories.icon,
        },
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .leftJoin(categories, eq(forumPosts.categoryId, categories.id))
      .where(eq(forumPosts.id, id));

    if (!result) return undefined;
    
    return {
      ...result,
      user: result.user as User,
      category: result.category as Category,
    };
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const [newPost] = await db.insert(forumPosts).values(post).returning();
    return newPost;
  }

  async updateForumPost(id: number, postData: Partial<InsertForumPost>): Promise<ForumPost> {
    const [post] = await db
      .update(forumPosts)
      .set({ ...postData, updatedAt: new Date() })
      .where(eq(forumPosts.id, id))
      .returning();
    return post;
  }

  async deleteForumPost(id: number): Promise<void> {
    await db.delete(forumPosts).where(eq(forumPosts.id, id));
  }

  async incrementForumPostViewCount(id: number): Promise<void> {
    await db
      .update(forumPosts)
      .set({ viewCount: sql`${forumPosts.viewCount} + 1` })
      .where(eq(forumPosts.id, id));
  }

  // Review operations
  async getReviews(params?: { reviewedUserId?: string; listingId?: number; limit?: number; offset?: number }): Promise<ReviewWithDetails[]> {
    const { reviewedUserId, listingId, limit = 20, offset = 0 } = params || {};
    
    let query = db
      .select({
        id: reviews.id,
        reviewerId: reviews.reviewerId,
        reviewedUserId: reviews.reviewedUserId,
        listingId: reviews.listingId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        reviewer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.reviewerId, users.id));

    const conditions = [];
    
    if (reviewedUserId) {
      conditions.push(eq(reviews.reviewedUserId, reviewedUserId));
    }
    
    if (listingId) {
      conditions.push(eq(reviews.listingId, listingId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);
    
    return results.map(result => ({
      ...result,
      reviewer: result.reviewer as User,
    }));
  }

  async getUserReviews(userId: string): Promise<ReviewWithDetails[]> {
    return this.getReviews({ reviewedUserId: userId });
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update user rating after creating review
    if (review.reviewedUserId) {
      await this.calculateUserRating(review.reviewedUserId);
    }
    
    return newReview;
  }

  async updateReview(id: number, reviewData: Partial<InsertReview>): Promise<Review> {
    const [review] = await db
      .update(reviews)
      .set({ ...reviewData, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    
    // Update user rating after updating review
    if (review.reviewedUserId) {
      await this.calculateUserRating(review.reviewedUserId);
    }
    
    return review;
  }

  async deleteReview(id: number): Promise<void> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    await db.delete(reviews).where(eq(reviews.id, id));
    
    // Update user rating after deleting review
    if (review?.reviewedUserId) {
      await this.calculateUserRating(review.reviewedUserId);
    }
  }

  // User rating operations
  async getUserRating(userId: string): Promise<UserRating | undefined> {
    const [rating] = await db.select().from(userRatings).where(eq(userRatings.userId, userId));
    return rating;
  }

  async updateUserRating(userId: string, ratingData: Partial<InsertUserRating>): Promise<UserRating> {
    const [rating] = await db
      .insert(userRatings)
      .values({ userId, ...ratingData })
      .onConflictDoUpdate({
        target: userRatings.userId,
        set: { ...ratingData, updatedAt: new Date() },
      })
      .returning();
    return rating;
  }

  async calculateUserRating(userId: string): Promise<void> {
    const userReviews = await db.select().from(reviews).where(eq(reviews.reviewedUserId, userId));
    
    if (userReviews.length === 0) {
      await this.updateUserRating(userId, {
        totalPoints: 0,
        totalReviews: 0,
        averageRating: 0,
      });
      return;
    }

    const totalReviews = userReviews.length;
    const totalStars = userReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalStars / totalReviews;
    
    // Calculate points based on 785 max system: (average rating / 5) * 785
    const totalPoints = Math.round((averageRating / 5) * 785);

    await this.updateUserRating(userId, {
      totalPoints,
      totalReviews,
      averageRating,
    });
  }
  
  // Cart operations
  async getCartItems(userId: string): Promise<any[]> {
    const cartItems = await db.select({
      id: cart.id,
      quantity: cart.quantity,
      createdAt: cart.createdAt,
      listing: {
        id: listings.id,
        title: listings.title,
        price: listings.price,
        images: listings.images,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        }
      }
    })
    .from(cart)
    .innerJoin(listings, eq(cart.listingId, listings.id))
    .innerJoin(users, eq(listings.userId, users.id))
    .where(eq(cart.userId, userId));
    
    return cartItems;
  }
  
  async getCartItemsCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql`count(*)` }).from(cart).where(eq(cart.userId, userId));
    return parseInt(result[0].count as string);
  }
  
  async addToCart(userId: string, listingId: number, quantity: number): Promise<any> {
    // Check if item already exists in cart
    const existingItem = await db.select().from(cart).where(
      and(eq(cart.userId, userId), eq(cart.listingId, listingId))
    );
    
    if (existingItem.length > 0) {
      // Update quantity
      const [updatedItem] = await db
        .update(cart)
        .set({ quantity: existingItem[0].quantity + quantity })
        .where(eq(cart.id, existingItem[0].id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db
        .insert(cart)
        .values({ userId, listingId, quantity })
        .returning();
      return newItem;
    }
  }
  
  async updateCartItem(userId: string, cartItemId: number, quantity: number): Promise<any> {
    const [updatedItem] = await db
      .update(cart)
      .set({ quantity })
      .where(and(eq(cart.id, cartItemId), eq(cart.userId, userId)))
      .returning();
    return updatedItem;
  }
  
  async removeFromCart(userId: string, cartItemId: number): Promise<void> {
    await db.delete(cart).where(and(eq(cart.id, cartItemId), eq(cart.userId, userId)));
  }
  
  // Wishlist operations
  async getWishlistItems(userId: string): Promise<any[]> {
    const wishlistItems = await db.select().from(wishlist).where(eq(wishlist.userId, userId));
    return wishlistItems;
  }
  
  async toggleWishlistItem(userId: string, listingId: number): Promise<any> {
    const existingItem = await db.select().from(wishlist).where(
      and(eq(wishlist.userId, userId), eq(wishlist.listingId, listingId))
    );
    
    if (existingItem.length > 0) {
      // Remove from wishlist
      await db.delete(wishlist).where(eq(wishlist.id, existingItem[0].id));
      return { added: false, message: "Removed from wishlist" };
    } else {
      // Add to wishlist
      const [newItem] = await db
        .insert(wishlist)
        .values({ userId, listingId })
        .returning();
      return { added: true, message: "Added to wishlist", item: newItem };
    }
  }
}

export const storage = new DatabaseStorage();
