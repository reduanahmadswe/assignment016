import express, { Application } from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { env } from './config/env.js';
import routes from './routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { licenseMiddleware } from './middlewares/license.middleware.js';

const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // CORS configuration - Production ready
  const allowedOrigins = [
    'https://oriyet.org',
    'https://www.oriyet.org',
    'https://api.oriyet.org',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5173',
    env.frontendUrl,
  ].filter((origin): origin is string => Boolean(origin));

  // Remove duplicates
  const uniqueOrigins = [...new Set(allowedOrigins)];
  
  console.log('🌐 Allowed CORS origins:', uniqueOrigins);

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin is allowed
      if (uniqueOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Log blocked origins for debugging
      console.log('⚠️ CORS: Origin not in whitelist:', origin);
      
      // In production, you might want to block unknown origins
      // For now, allow all for debugging
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
  }));

  // Handle preflight requests
  app.options('*', cors());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Increased limit for testing
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  // app.use('/api/', limiter); // Optional: Disable completely if needed
  app.use('/api/', limiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression());

  // Logging
  if (env.nodeEnv === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Static files
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // License Verification Middleware
  // Blocks access if the system is expired
  app.use(licenseMiddleware);

  // API Routes
  app.use('/api', routes);

  // Root route
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to ORIYET API',
      version: '1.0.0',
      documentation: '/api/health',
    });
  });

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
