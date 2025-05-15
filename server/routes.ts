import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { 
  productValidationSchema, 
  reviewValidationSchema,
  insertTransactionSchema,
  insertContactAccessSchema
} from "@shared/schema";

// Helper for response error handling
const handleError = (res: Response, error: unknown) => {
  console.error("API Error:", error);
  if (error instanceof ZodError) {
    return res.status(400).json({ 
      message: "Validation error", 
      errors: error.errors 
    });
  }
  return res.status(500).json({ message: "Internal server error" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // API Routes
  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { category, limit = "10", sellerId } = req.query;
      
      if (sellerId) {
        const products = await storage.getProductsBySeller(parseInt(sellerId as string, 10));
        return res.json(products);
      }
      
      if (category && typeof category === "string") {
        const products = await storage.getProductsByCategory(category);
        return res.json(products);
      }
      
      const numLimit = parseInt(limit as string, 10);
      const products = await storage.getRecentProducts(numLimit);
      res.json(products);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = productValidationSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      // Only validate the fields that are present in the request
      const updates = productValidationSchema.partial().parse(req.body);
      
      const updatedProduct = await storage.updateProduct(id, updates);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch("/api/products/:id/mark-sold", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updatedProduct = await storage.markProductAsSold(id);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Transactions
  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/transactions/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const transactions = await storage.getTransactionsByUser(userId);
      res.json(transactions);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch("/api/transactions/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedTransaction = await storage.updateTransactionStatus(id, status);
      
      if (!updatedTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(updatedTransaction);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Contact Access
  app.post("/api/contact-access", async (req, res) => {
    try {
      const validatedData = insertContactAccessSchema.parse(req.body);
      const access = await storage.createContactAccess(validatedData);
      res.status(201).json(access);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/contact-access/check", async (req, res) => {
    try {
      const { productId, buyerId } = req.query;
      
      if (!productId || !buyerId) {
        return res.status(400).json({ message: "Product ID and buyer ID are required" });
      }
      
      const hasAccess = await storage.hasContactAccess(
        parseInt(productId as string, 10),
        parseInt(buyerId as string, 10)
      );
      
      res.json({ hasAccess });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/contact-access/buyer/:buyerId", async (req, res) => {
    try {
      const buyerId = parseInt(req.params.buyerId, 10);
      const contacts = await storage.getContactsForBuyer(buyerId);
      res.json(contacts);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Reviews
  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = reviewValidationSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/reviews/product/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId, 10);
      const reviews = await storage.getReviewsForProduct(productId);
      res.json(reviews);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/reviews/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const reviews = await storage.getReviewsByUser(userId);
      res.json(reviews);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/reviews/rating/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const rating = await storage.getAverageRatingForUser(userId);
      res.json({ rating });
    } catch (error) {
      handleError(res, error);
    }
  });

  // User operations
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/users/email/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Add a route for user authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, you would compare hashed passwords
      // For now, just simulate successful authentication
      if (password !== user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't send the password back to the client
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Registration route
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, displayName } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }
      
      // Create new user
      const newUser = await storage.createUser({
        username,
        email,
        password, // In a real app, this would be hashed
        displayName: displayName || username,
        role: 'user'
      });
      
      // Don't send the password back to the client
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });

  return httpServer;
}
