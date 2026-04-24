const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing in environment variables.');
  }

  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    if (uri.startsWith('mongodb+srv://') && /querySrv|ENOTFOUND|ECONNREFUSED/i.test(error.message)) {
      throw new Error(
        'MongoDB SRV lookup failed. Check your DNS/network access to Atlas, confirm the cluster host is correct, or use the standard mongodb:// connection string from Atlas instead of mongodb+srv://.'
      );
    }

    throw error;
  }
}

module.exports = connectDB;
