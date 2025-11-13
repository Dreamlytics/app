import mongoose from 'mongoose';
import { ensureIndexes } from '~/server/utils/db-setup';

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig();
  
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');
    
    // Ensure database indexes are properly created
    await ensureIndexes();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
});
