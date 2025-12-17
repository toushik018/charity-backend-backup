/**
 * @fileoverview Async error handling wrapper for Express route handlers.
 *
 * Provides a utility function to wrap async route handlers and automatically
 * catch and forward errors to the Express error handling middleware.
 *
 * @module app/utils/catchAsync
 */

import { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Wraps an async Express route handler to automatically catch errors.
 *
 * This utility eliminates the need for try-catch blocks in every async
 * route handler by automatically catching rejected promises and forwarding
 * errors to the Express error handling middleware.
 *
 * @param fn - Async route handler function
 * @returns Wrapped route handler with error catching
 *
 * @example
 * // Without catchAsync (verbose)
 * const getUser = async (req, res, next) => {
 *   try {
 *     const user = await UserService.findById(req.params.id);
 *     res.json(user);
 *   } catch (error) {
 *     next(error);
 *   }
 * };
 *
 * @example
 * // With catchAsync (clean)
 * const getUser = catchAsync(async (req, res) => {
 *   const user = await UserService.findById(req.params.id);
 *   res.json(user);
 * });
 */
export const catchAsync = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((error: unknown) => next(error));
  };
};
