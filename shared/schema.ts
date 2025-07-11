import { z } from "zod";

// MongoDB-compatible schemas (since we're using MongoDB instead of PostgreSQL)

// User schema for MongoDB
export const userSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId
  username: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
  role: z.enum(['user', 'admin']).default('user'),
  password: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Product schema for MongoDB
export const productSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(1), // Stored in smallest currency unit (paisa)
  category: z.enum(['books', 'electronics', 'clothes', 'stationery', 'misc']),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  sellerId: z.string(), // MongoDB ObjectId as string
  sellerName: z.string().optional(),
  isSold: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Transaction schema for MongoDB
export const transactionSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId
  productId: z.string().optional(), // MongoDB ObjectId as string
  sellerId: z.string(), // MongoDB ObjectId as string
  buyerId: z.string().optional(), // MongoDB ObjectId as string
  amount: z.number().min(1), // Stored in smallest currency unit (paisa)
  type: z.enum(['sale', 'purchase']),
  status: z.enum(['pending', 'completed', 'refunded']).default('pending'),
  createdAt: z.date().optional(),
});

// Contact access schema for MongoDB
export const contactAccessSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId
  productId: z.string(), // MongoDB ObjectId as string
  buyerId: z.string(), // MongoDB ObjectId as string
  sellerId: z.string(), // MongoDB ObjectId as string
  createdAt: z.date().optional(),
});

// Review schema for MongoDB
export const reviewSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId
  productId: z.string(), // MongoDB ObjectId as string
  reviewerId: z.string(), // MongoDB ObjectId as string
  reviewerName: z.string().optional(),
  userId: z.string(), // MongoDB ObjectId as string (person being reviewed)
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
  createdAt: z.date().optional(),
});

// Type definitions
export type User = z.infer<typeof userSchema>;
export type Product = z.infer<typeof productSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type ContactAccess = z.infer<typeof contactAccessSchema>;
export type Review = z.infer<typeof reviewSchema>;

// Insert schemas (omit _id for creation)
export const insertUserSchema = userSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export const insertProductSchema = productSchema.omit({ 
  _id: true, 
  createdAt: true, 
  updatedAt: true, 
  isSold: true 
});
export const insertTransactionSchema = transactionSchema.omit({ 
  _id: true, 
  createdAt: true 
});
export const insertContactAccessSchema = contactAccessSchema.omit({ 
  _id: true, 
  createdAt: true 
});
export const insertReviewSchema = reviewSchema.omit({ 
  _id: true, 
  createdAt: true 
});

// Type definitions for inserts
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertContactAccess = z.infer<typeof insertContactAccessSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;

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
