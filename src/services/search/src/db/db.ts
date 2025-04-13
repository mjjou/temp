import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); 

const mongoURI = process.env.MONGO_URI || '';

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB Atlas connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
