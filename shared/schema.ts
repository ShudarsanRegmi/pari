import { boolean, integer, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  role: userRoleEnum("role").default('user').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  password: text("password").notNull(), // Hashed password for local authentication
});

export const categoryEnum = pgEnum('category', ['books', 'electronics', 'clothes', 'stationery', 'misc']);
export const conditionEnum = pgEnum('condition', ['new', 'like_new', 'good', 'fair', 'poor']);

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Stored in smallest currency unit (paisa)
  category: categoryEnum("category").notNull(),
  condition: conditionEnum("condition").notNull(),
  imageUrl: text("image_url"),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  isSold: boolean("is_sold").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  buyerId: integer("buyer_id").references(() => users.id),
  amount: integer("amount").notNull(), // Stored in smallest currency unit (paisa)
  type: text("type").notNull(), // sale, purchase
  status: text("status").notNull(), // pending, completed, refunded
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contact access tracks buyers who can access seller contact info
export const contactAccess = pgTable("contact_access", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Review system for rating transactions
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  userId: integer("user_id").notNull().references(() => users.id), // The person being reviewed
  rating: integer("rating").notNull(), // 1-5 star rating
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type definitions
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  isSold: true 
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export const insertContactAccessSchema = createInsertSchema(contactAccess).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertContactAccess = z.infer<typeof insertContactAccessSchema>;
export type ContactAccess = typeof contactAccess.$inferSelect;

export const insertReviewSchema = createInsertSchema(reviews).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Validation schemas for API
export const productValidationSchema = insertProductSchema.extend({
  price: z.number().min(1).max(1000000),
  category: z.enum(['books', 'electronics', 'clothes', 'stationery', 'misc']),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']),
});

export const reviewValidationSchema = insertReviewSchema.extend({
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});
