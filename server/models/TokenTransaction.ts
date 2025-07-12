import mongoose from 'mongoose';

const tokenTransactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['purchase', 'sale', 'reward', 'donation', 'recycling', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: false
  },
  sellerId: {
    type: String,
    required: false
  },
  buyerId: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const TokenTransaction = mongoose.model('TokenTransaction', tokenTransactionSchema); 