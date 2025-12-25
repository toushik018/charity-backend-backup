/**
 * @fileoverview Request logging middleware using Winston.
 *
 * Logs HTTP requests with smart filtering:
 * - Always logs errors (4xx, 5xx)
 * - In production: only logs errors and slow requests (>1s)
 * - In development: logs all requests
 *
 * @module app/middlewares/requestLogger
 */

import { NextFunction, Request, Response } from 'express';
import config from '../config';
import logger from '../utils/logger';

/** Threshold for slow request logging in production (ms) */
const SLOW_REQUEST_THRESHOLD = 1000;

/**
 * Request logging middleware.
 *
 * Optimized for production to reduce log volume:
 * - Skips health checks and static assets
 * - In production: only logs errors and slow requests
 * - In development: logs everything
 */
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Skip logging for health checks, static assets, and OPTIONS preflight
  const skipPaths = ['/health', '/favicon.ico', '/robots.txt', '/'];
  if (skipPaths.includes(req.path) || req.method === 'OPTIONS') {
    return next();
  }

  const startTime = Date.now();

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userId = (req as unknown as { user?: { _id?: string } }).user?._id;
    const isProduction = config.NODE_ENV === 'production';
    const isError = res.statusCode >= 400;
    const isSlow = duration >= SLOW_REQUEST_THRESHOLD;

    // In production, only log errors and slow requests to reduce pressure
    if (isProduction && !isError && !isSlow) {
      return;
    }

    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.socket.remoteAddress,
      userId,
      ...(isError && { userAgent: req.get('user-agent') }),
      ...(res.get('content-length') && {
        contentLength: res.get('content-length'),
      }),
    };

    // Log level based on status code
    if (res.statusCode >= 500) {
      logger.error('Request failed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request error', logData);
    } else if (isSlow) {
      logger.warn('Slow request', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};

export default requestLogger;
