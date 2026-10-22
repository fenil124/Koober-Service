import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[MongoDB] Warning: MONGODB_URI environment variable is not defined.');
    return null;
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'royalrides',
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to Atlas cluster. DB: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.error('[MongoDB] Connection error:', error);
    return null;
  }
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB] Disconnected from MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('[MongoDB] Connection runtime error:', err);
});
