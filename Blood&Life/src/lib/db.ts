import mongoose from "mongoose";
import dns from "node:dns";

// Fix Node.js DNS SRV resolution issues on Windows ISPs for MongoDB Atlas
try {
  dns.setDefaultResultOrder?.("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  // Edge runtime fallback
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/blood-lagbe";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  try {
    dns.setDefaultResultOrder?.("ipv4first");
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (err) {
    // Edge runtime fallback
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10, // Optimized for Vercel serverless functions
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export const connectToDatabase = connectDB;

export default connectDB;
