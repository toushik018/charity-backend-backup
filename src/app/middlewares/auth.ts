/**
 * @fileoverview Authentication middleware for protecting routes.
 *
 * Provides middleware functions for JWT-based authentication and
 * role-based authorization across the application.
 *
 * @module app/middlewares/auth
 */

import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import config from '../config';
import AppError from '../error/AppError';
import { AUTH_MESSAGES } from '../modules/auth/auth.constant';
import { AuthRequest, IJWTPayload } from '../modules/auth/auth.interface';
import { User } from '../modules/auth/auth.model';
import { catchAsync } from '../utils/catchAsync';

/* -------------------------------------------------------------------------- */
/*                              TYPES                                         */
/* -------------------------------------------------------------------------- */

/**
 * API role types for authorization.
 */
export type ApiRole = 'user' | 'admin';

/* -------------------------------------------------------------------------- */
/*                              CONSTANTS                                     */
/* -------------------------------------------------------------------------- */

/**
 * Time threshold for suggesting token refresh (30 minutes in seconds).
 */
const TOKEN_REFRESH_THRESHOLD_SECONDS = 30 * 60;

/**
 * Bearer token prefix.
 */
const BEARER_PREFIX = 'Bearer ';

/* -------------------------------------------------------------------------- */
/*                              HELPERS                                       */
/* -------------------------------------------------------------------------- */

/**
 * Maps database user role to API role.
 *
 * @param role - Database role string
 * @returns Normalized API role
 */
const mapUserRoleToApiRole = (role: string): ApiRole =>
  role === 'admin' ? 'admin' : 'user';

/**
 * Extracts JWT token from Authorization header.
 *
 * @param authHeader - Authorization header value
 * @returns Token string or null if not found
 */
const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
    return null;
  }
  const token = authHeader.slice(BEARER_PREFIX.length);
  return token || null;
};

/**
 * Verifies JWT token and returns decoded payload.
 *
 * @param token - JWT token string
 * @returns Decoded JWT payload
 * @throws AppError if token is invalid or expired
 */
const verifyToken = (token: string): IJWTPayload => {
  try {
    return jwt.verify(token, config.jwt_access_secret as string) as IJWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        AUTH_MESSAGES.TOKEN_REFRESH_REQUIRED
      );
    }
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid access token');
  }
};

/**
 * Checks if token is close to expiry and sets refresh headers.
 *
 * @param decoded - Decoded JWT payload
 * @param res - Express response object
 */
const checkTokenExpiry = (decoded: IJWTPayload, res: Response): void => {
  const currentTime = Math.floor(Date.now() / 1000);
  const expiryTime = decoded.exp || 0;
  const timeUntilExpiry = expiryTime - currentTime;

  if (
    timeUntilExpiry > 0 &&
    timeUntilExpiry < TOKEN_REFRESH_THRESHOLD_SECONDS
  ) {
    res.setHeader('X-Token-Refresh-Suggested', 'true');
    res.setHeader('X-Token-Expires-In', timeUntilExpiry.toString());
  }
};

/* -------------------------------------------------------------------------- */
/*                              MIDDLEWARE                                    */
/* -------------------------------------------------------------------------- */

/**
 * Authentication middleware factory.
 *
 * Creates a middleware that:
 * 1. Extracts and validates JWT from Authorization header
 * 2. Verifies the user exists and is active
 * 3. Checks role-based authorization
 * 4. Attaches user info to request object
 *
 * @param requiredRoles - Roles allowed to access the route (empty = any authenticated user)
 * @returns Express middleware function
 *
 * @example
 * // Require authentication (any role)
 * router.get('/profile', auth(), ProfileController.get);
 *
 * @example
 * // Require admin role
 * router.delete('/users/:id', auth('admin'), UserController.delete);
 *
 * @example
 * // Allow multiple roles
 * router.get('/dashboard', auth('admin', 'user'), DashboardController.get);
 */
const auth = (...requiredRoles: ApiRole[]) => {
  return catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      // Extract token from Authorization header
      const token = extractToken(req.headers.authorization);

      if (!token) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          'Access token is required'
        );
      }

      // Verify token
      const decoded = verifyToken(token);

      // Check if token is close to expiry
      checkTokenExpiry(decoded, res);

      // Check if user exists and is active
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'User not found');
      }

      if (!user.isActive) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          'Your account has been deactivated'
        );
      }

      // Check role authorization
      const apiRole = mapUserRoleToApiRole(decoded.role);

      if (requiredRoles.length > 0 && !requiredRoles.includes(apiRole)) {
        throw new AppError(StatusCodes.FORBIDDEN, 'Insufficient permissions');
      }

      // Attach user to request
      req.user = {
        ...decoded,
        role: apiRole,
      };

      next();
    }
  );
};

/**
 * Optional authentication middleware.
 *
 * Similar to auth() but doesn't require authentication.
 * If a valid token is provided, attaches user info to request.
 * If no token or invalid token, continues without user info.
 *
 * Useful for routes that behave differently for authenticated users
 * but are still accessible to anonymous users.
 *
 * @example
 * // Public route with optional user context
 * router.get('/fundraisers', optionalAuth, FundraiserController.list);
 */
export const optionalAuth = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string
      ) as IJWTPayload;

      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        const apiRole = mapUserRoleToApiRole(decoded.role);
        req.user = {
          ...decoded,
          role: apiRole,
        };
      }
    } catch {
      // Invalid token, continue without user
    }

    next();
  }
);

export default auth;
