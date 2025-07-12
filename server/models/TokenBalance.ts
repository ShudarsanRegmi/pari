import mongoose from 'mongoose';

const tokenBalanceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  balance: {
    type: Number,
    default: 1000, // Default 1000 green tokens
    min: 0
  },
  totalEarned: {
    type: Number,
    default: 1000
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
tokenBalanceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const TokenBalance = mongoose.model('TokenBalance', tokenBalanceSchema); 