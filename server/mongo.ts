import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sudoerson:sudoerson@paricluster.e29fjga.mongodb.net/?retryWrites=true&w=majority&appName=paricluster';

export async function connectMongo() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI, {
    dbName: 'paricluster',
  });
} 