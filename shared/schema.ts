import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  isVerified: boolean("is_verified").default(false),
  isAdmin: boolean("is_admin").default(false),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 7 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Listings table
export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }), // For discounts
  priceType: varchar("price_type", { length: 20 }).notNull(), // 'fixed', 'free', 'negotiable'
  location: varchar("location", { length: 200 }),
  images: text("images").array(),
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'sold', 'suspended'
  condition: varchar("condition", { length: 20 }).default("new"), // 'new', 'like_new', 'good', 'fair', 'poor'
  quantity: integer("quantity").default(1),
  brand: varchar("brand", { length: 100 }),
  tags: text("tags").array(),
  isPromoted: boolean("is_promoted").default(false),
  isFeatured: boolean("is_featured").default(false),
  viewCount: integer("view_count").default(0),
  favoriteCount: integer("favorite_count").default(0),
  shippingInfo: text("shipping_info"),
  returnPolicy: text("return_policy"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id).notNull(),
  listingId: integer("listing_id").references(() => listings.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reports table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: varchar("reporter_id").references(() => users.id).notNull(),
  listingId: integer("listing_id").references(() => listings.id),
  reportedUserId: varchar("reported_user_id").references(() => users.id),
  reason: varchar("reason", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending', 'resolved', 'dismissed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  listingId: integer("listing_id").references(() => listings.id),
  forumPostId: integer("forum_post_id"),
  parentId: integer("parent_id"),
  content: text("content").notNull(),
  isEdited: boolean("is_edited").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Forum posts table
export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  productRating: integer("product_rating"), // 1-5 stars for product reviews
  productImage: text("product_image"), // URL for product images
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  reviewerId: varchar("reviewer_id").references(() => users.id).notNull(),
  reviewedUserId: varchar("reviewed_user_id").references(() => users.id),
  listingId: integer("listing_id").references(() => listings.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User ratings table
export const userRatings = pgTable("user_ratings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  totalPoints: integer("total_points").default(0),
  totalReviews: integer("total_reviews").default(0),
  averageRating: real("average_rating").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cart table for shopping cart functionality
export const cart = pgTable("cart", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  listingId: integer("listing_id").references(() => listings.id).notNull(),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wishlist table for saved items
export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  listingId: integer("listing_id").references(() => listings.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product reviews table (separate from user reviews)
export const productReviews = pgTable("product_reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  listingId: integer("listing_id").references(() => listings.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 200 }),
  content: text("content").notNull(),
  isVerified: boolean("is_verified").default(false), // For verified purchases
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  listings: many(listings),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  reports: many(reports),
  comments: many(comments),
  forumPosts: many(forumPosts),
  givenReviews: many(reviews, { relationName: "givenReviews" }),
  receivedReviews: many(reviews, { relationName: "receivedReviews" }),
  rating: one(userRatings, { fields: [users.id], references: [userRatings.userId] }),
  cartItems: many(cart),
  wishlistItems: many(wishlist),
  productReviews: many(productReviews),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  listings: many(listings),
  forumPosts: many(forumPosts),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  user: one(users, { fields: [listings.userId], references: [users.id] }),
  category: one(categories, { fields: [listings.categoryId], references: [categories.id] }),
  messages: many(messages),
  reports: many(reports),
  comments: many(comments),
  reviews: many(reviews),
  cartItems: many(cart),
  wishlistItems: many(wishlist),
  productReviews: many(productReviews),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "sentMessages" }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id], relationName: "receivedMessages" }),
  listing: one(listings, { fields: [messages.listingId], references: [listings.id] }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, { fields: [reports.reporterId], references: [users.id] }),
  listing: one(listings, { fields: [reports.listingId], references: [listings.id] }),
  reportedUser: one(users, { fields: [reports.reportedUserId], references: [users.id] }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  listing: one(listings, { fields: [comments.listingId], references: [listings.id] }),
  forumPost: one(forumPosts, { fields: [comments.forumPostId], references: [forumPosts.id] }),
  parent: one(comments, { fields: [comments.parentId], references: [comments.id] }),
  replies: many(comments, { relationName: "replies" }),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  user: one(users, { fields: [forumPosts.userId], references: [users.id] }),
  category: one(categories, { fields: [forumPosts.categoryId], references: [categories.id] }),
  comments: many(comments),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, { fields: [reviews.reviewerId], references: [users.id], relationName: "givenReviews" }),
  reviewedUser: one(users, { fields: [reviews.reviewedUserId], references: [users.id], relationName: "receivedReviews" }),
  listing: one(listings, { fields: [reviews.listingId], references: [listings.id] }),
}));

export const userRatingsRelations = relations(userRatings, ({ one }) => ({
  user: one(users, { fields: [userRatings.userId], references: [users.id] }),
}));

export const cartRelations = relations(cart, ({ one }) => ({
  user: one(users, { fields: [cart.userId], references: [users.id] }),
  listing: one(listings, { fields: [cart.listingId], references: [listings.id] }),
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, { fields: [wishlist.userId], references: [users.id] }),
  listing: one(listings, { fields: [wishlist.listingId], references: [listings.id] }),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  user: one(users, { fields: [productReviews.userId], references: [users.id] }),
  listing: one(listings, { fields: [productReviews.listingId], references: [listings.id] }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const insertCategorySchema = createInsertSchema(categories);
export const insertListingSchema = createInsertSchema(listings);
export const insertMessageSchema = createInsertSchema(messages);
export const insertReportSchema = createInsertSchema(reports);
export const insertCommentSchema = createInsertSchema(comments);
export const insertForumPostSchema = createInsertSchema(forumPosts);
export const insertReviewSchema = createInsertSchema(reviews);
export const insertUserRatingSchema = createInsertSchema(userRatings);
export const insertCartSchema = createInsertSchema(cart);
export const insertWishlistSchema = createInsertSchema(wishlist);
export const insertProductReviewSchema = createInsertSchema(productReviews);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = typeof listings.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type UserRating = typeof userRatings.$inferSelect;
export type InsertUserRating = typeof userRatings.$inferInsert;
export type Cart = typeof cart.$inferSelect;
export type InsertCart = typeof cart.$inferInsert;
export type Wishlist = typeof wishlist.$inferSelect;
export type InsertWishlist = typeof wishlist.$inferInsert;
export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = typeof productReviews.$inferInsert;

// Extended types for API responses
export type ListingWithDetails = Listing & {
  user: User;
  category: Category;
  images: string[];
};

export type MessageWithDetails = Message & {
  sender: User;
  receiver: User;
  listing?: Listing;
};

export type CommentWithDetails = Comment & {
  user: User;
  listing?: Listing;
  forumPost?: ForumPost;
  parent?: Comment;
  replies?: CommentWithDetails[];
};

export type ForumPostWithDetails = ForumPost & {
  user: User;
  category?: Category;
  comments?: CommentWithDetails[];
  commentCount?: number;
};

export type ReviewWithDetails = Review & {
  reviewer: User;
  reviewedUser?: User;
  listing?: Listing;
};

export type UserWithRating = User & {
  rating?: UserRating;
};
