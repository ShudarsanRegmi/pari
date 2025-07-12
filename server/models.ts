import mongoose, { Schema } from 'mongoose';

export const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: String,
  photoURL: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  ecoImpact: { type: Number, default: 0 }, // Carbon footprint savings in kg CO2
  createdAt: { type: Date, default: Date.now },
  password: { type: String, required: true },
});
export const User = mongoose.model('User', UserSchema);

export const ProductSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['books', 'electronics', 'clothes', 'stationery', 'misc'], required: true },
  condition: { type: String, enum: ['new', 'like_new', 'good', 'fair', 'poor'], required: true },
  imageUrl: String,
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isSold: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
export const Product = mongoose.model('Product', ProductSchema);

export const TransactionSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
export const Transaction = mongoose.model('Transaction', TransactionSchema);

export const ContactAccessSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});
export const ContactAccess = mongoose.model('ContactAccess', ContactAccessSchema);

export const ReviewSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});
export const Review = mongoose.model('Review', ReviewSchema); 