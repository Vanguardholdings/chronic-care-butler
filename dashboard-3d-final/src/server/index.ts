import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import xmlBodyParser from 'express-xml-bodyparser';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { connectDatabase } from './config/database';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import User from './models/User';
import bcrypt from 'bcryptjs';
import { WebSocketManager } from './websocket';

const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT || '3001', 10);

// Initialize WebSocket manager
export const wsManager = new WebSocketManager(server);

// ─── Security Middleware ──────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow all localhost ports in development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    // Allow configured production origins
    const allowed = process.env.CORS_ORIGIN?.split(',') || [];
    if (allowed.includes(origin)) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Stricter limit for auth endpoints
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
  },
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// ─── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(xmlBodyParser()); // Parse XML for WeChat webhooks

// ─── Logging ──────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    },
  });
});

// ─── WeChat Webhook (Direct - for debugging) ─────────────────
app.get('/api/wechat/webhook', (req, res) => {
  console.log('>>> DIRECT WEBHOOK HIT:', req.query);
  res.send(req.query.echostr || 'success');
});

// ─── API Routes ───────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 Handler ──────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────
const seedUsers = async (): Promise<void> => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding default users...');
      // Note: Pass plaintext password - the User model's pre-save hook will hash it
      await User.create([
        {
          email: 'admin@chroniccare.com',
          passwordHash: 'admin123',  // Will be hashed by pre-save hook
          role: 'admin',
          name: '管理员',
        },
        {
          email: 'nurse@chroniccare.com',
          passwordHash: 'nurse123',  // Will be hashed by pre-save hook
          role: 'nurse',
          name: '护士小李',
        },
        {
          email: 'staff@chroniccare.com',
          passwordHash: 'staff123',  // Will be hashed by pre-save hook
          role: 'staff',
          name: '工作人员',
        },
      ]);
      console.log('✅ Default users created:');
      console.log('   - admin@chroniccare.com / admin123');
      console.log('   - nurse@chroniccare.com / nurse123');
      console.log('   - staff@chroniccare.com / staff123');
    }
  } catch (error) {
    console.error('❌ Failed to seed users:', error);
  }
};

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Seed default users if none exist
    await seedUsers();

    // Initialize cron jobs for medication reminders
    const { initReminderCron } = await import('./cron/reminders');
    initReminderCron();

    server.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════╗');
      console.log('║   Chronic Care Butler — API Server           ║');
      console.log('╠══════════════════════════════════════════════╣');
      console.log(`║   🚀 Server:  http://localhost:${PORT}          ║`);
      console.log(`║   📋 Health:  http://localhost:${PORT}/api/health ║`);
      console.log(`║   🌐 WebSocket: ws://localhost:${PORT}         ║`);
      console.log(`║   💬 WeChat:   /api/wechat/webhook           ║`);
      console.log(`║   🌍 Env:     ${(process.env.NODE_ENV || 'development').padEnd(27)}║`);
      console.log('╚══════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;