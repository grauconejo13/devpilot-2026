import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'authdb'
    });
    console.log('[auth-service] MongoDB connected to authdb');
  } catch (err) {
    console.error('[auth-service] DB connection error:', err.message);
    process.exit(1);
  }
};
