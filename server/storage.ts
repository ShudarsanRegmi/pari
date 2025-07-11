import { connectMongo } from './mongo';
import { User, Product, Transaction, ContactAccess, Review } from './models';

export class MongoStorage {
  constructor() {
    connectMongo();
  }

  // User operations
  async getUser(id: string) {
    return User.findById(id).lean();
  }
  
  async getUserByEmail(email: string) {
    console.log(`getUserByEmail called for: ${email}`);
    
    let user = await User.findOne({ email }).lean();
    console.log(`Existing user found: ${user ? 'yes' : 'no'}`);
    
    // If user doesn't exist, create one automatically
    if (!user) {
      try {
        console.log(`Auto-creating user for email: ${email}`);
        
        // Create a new user with basic info from email
        const username = email.split('@')[0]; // Use email prefix as username
        const displayName = username.charAt(0).toUpperCase() + username.slice(1); // Capitalize first letter
        
        console.log(`Creating user with username: ${username}, displayName: ${displayName}`);
        
        user = await this.createUser({
          email,
          username,
          displayName,
          photoURL: null,
          role: 'user',
          password: 'firebase-auth', // Placeholder since we're using Firebase auth
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`Auto-created MongoDB user for email: ${email}, ID: ${user._id}`);
      } catch (error) {
        console.error(`Failed to auto-create user for email ${email}:`, error);
        return null;
      }
    }
    
    console.log(`Returning user for email ${email}: ${user ? 'success' : 'null'}`);
    return user;
  }
  
  async getUserByUsername(username: string) {
    return User.findOne({ username }).lean();
  }
  
  async createUser(user: any) {
    const created = await User.create(user);
    return created.toObject();
  }

  // Product operations
  async getProduct(id: string) {
    return Product.findById(id).lean();
  }
  async getProductsByCategory(category: string) {
    return Product.find({ category, isSold: false }).sort({ createdAt: -1 }).lean();
  }
  async getProductsBySeller(sellerId: string) {
    return Product.find({ sellerId }).sort({ createdAt: -1 }).lean();
  }
  async getRecentProducts(limit: number) {
    return Product.find({ isSold: false }).sort({ createdAt: -1 }).limit(limit).lean();
  }
  async createProduct(product: any) {
    const created = await Product.create(product);
    return created.toObject();
  }
  async updateProduct(id: string, updates: any) {
    return Product.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true }).lean();
  }
  async markProductAsSold(id: string) {
    return Product.findByIdAndUpdate(id, { isSold: true, updatedAt: new Date() }, { new: true }).lean();
  }

  // Transaction operations
  async createTransaction(transaction: any) {
    const created = await Transaction.create(transaction);
    return created.toObject();
  }
  async getTransaction(id: string) {
    return Transaction.findById(id).lean();
  }
  async getTransactionsByUser(userId: string) {
    return Transaction.find({ $or: [{ sellerId: userId }, { buyerId: userId }] }).sort({ createdAt: -1 }).lean();
  }
  async updateTransactionStatus(id: string, status: string) {
    return Transaction.findByIdAndUpdate(id, { status }, { new: true }).lean();
  }

  // Contact access operations
  async createContactAccess(access: any) {
    const created = await ContactAccess.create(access);
    return created.toObject();
  }
  async hasContactAccess(productId: string, buyerId: string) {
    const found = await ContactAccess.findOne({ productId, buyerId });
    return !!found;
  }
  async getContactsForBuyer(buyerId: string) {
    return ContactAccess.find({ buyerId }).sort({ createdAt: -1 }).lean();
  }

  // Review operations
  async createReview(review: any) {
    const created = await Review.create(review);
    return created.toObject();
  }
  async getReviewsByUser(userId: string) {
    return Review.find({ reviewerId: userId }).sort({ createdAt: -1 }).lean();
  }
  async getReviewsForProduct(productId: string) {
    return Review.find({ productId }).sort({ createdAt: -1 }).lean();
  }
  async getAverageRatingForUser(userId: string) {
    const result = await Review.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avg: { $avg: "$rating" } } }
    ]);
    return result[0]?.avg || 0;
  }
}

export const storage = new MongoStorage();
