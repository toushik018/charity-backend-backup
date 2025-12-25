/* eslint-disable @typescript-eslint/no-explicit-any */

import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './app/config';
import { CustomError } from './app/interface/error.interface';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import requestLogger from './app/middlewares/requestLogger';
import router from './routes';

const app: Application = express();

// Trust proxy for correct client IPs and secure cookies behind proxies (Vercel/NGINX)
app.set('trust proxy', 1);

// Security & performance middleware
app.use(helmet());
app.use(compression());

// Request logging with Winston (structured logs for production)
app.use(requestLogger);

// Morgan for dev console output (skip in production - Winston handles it)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Stripe webhook needs raw body - must be before json parser
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Parsers with sane size limits (large uploads should use multipart endpoints)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const corsConfig = {
  origin: function (origin: string | undefined, callback: any) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const defaults = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://fundsusko.vercel.app',
      'https://fundsusko.vercel.app/',
    ];
    const configured = Array.isArray(config.cors_origins)
      ? config.cors_origins
      : [];
    const extras = config.frontend_url ? [config.frontend_url] : [];
    const allowedOrigins = [
      ...new Set([...defaults, ...configured, ...extras]),
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Reject origin
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};

app.use(cors(corsConfig));
app.use(cookieParser());

// Application routes
app.use('/api', router);

// Health check
app.get('/', (req, res) => {
  res.send('Server is working');
});

// Not Found
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  const error: CustomError = new Error(
    `Can't find ${req.originalUrl} route on the server`
  );
  error.status = 404;
  next(error);
});

// Error handling (should come after Not Found so it receives errors forwarded via next(err))
app.use(globalErrorHandler);

export default app;
