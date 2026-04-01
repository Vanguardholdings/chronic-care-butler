import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;

interface ConnectionOptions {
  uri?: string;
  maxRetries?: number;
  retryDelay?: number;
  useMemoryDb?: boolean;
}

/**
 * Connect to MongoDB with retry logic and Memory Server fallback
 */
export const connectDatabase = async (options?: Partial<ConnectionOptions>): Promise<void> => {
  const maxRetries = options?.maxRetries || 5;
  const retryDelay = options?.retryDelay || 5000;
  const useMemoryDb = options?.useMemoryDb || process.env.USE_MEMORY_DB === 'true';

  let uri = options?.uri || process.env.MONGODB_URI;
  let retries = 0;

  // If no URI provided or memory DB requested, start memory server
  if (!uri || useMemoryDb) {
    try {
      console.log('🔄 Starting MongoDB Memory Server...');
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'chronic_care',
        },
        binary: {
          version: '7.0.14',
        },
      });
      uri = memoryServer.getUri();
      console.log('✅ MongoDB Memory Server started');
      console.log(`   URI: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')}`);
    } catch (error) {
      console.error('❌ Failed to start Memory Server:', (error as Error).message);
      throw error;
    }
  }

  const connect = async (): Promise<void> => {
    try {
      await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`✅ MongoDB connected successfully`);
      console.log(`   Database: ${mongoose.connection.db?.databaseName}`);
      console.log(`   Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
      if (memoryServer) {
        console.log('   Mode: In-Memory (ephemeral data)');
      }
    } catch (error) {
      retries++;
      console.error(`❌ MongoDB connection attempt ${retries}/${maxRetries} failed:`, (error as Error).message);

      if (retries < maxRetries) {
        console.log(`   Retrying in ${retryDelay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return connect();
      }

      throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts`);
    }
  };

  // Connection event handlers
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  });

  await connect();
};

/**
 * Disconnect from MongoDB and stop Memory Server
 */
export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.connection.close();
  
  if (memoryServer) {
    await memoryServer.stop();
    console.log('MongoDB Memory Server stopped');
    memoryServer = null;
  }
  
  console.log('MongoDB connection closed');
};