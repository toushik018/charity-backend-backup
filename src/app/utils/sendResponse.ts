/**
 * @fileoverview Standardized API response utilities.
 *
 * Provides consistent response formatting for all API endpoints,
 * ensuring uniform response structure across the application.
 *
 * @module app/utils/sendResponse
 */

import { Response } from 'express';

import type { PaginationMeta } from '../interface/common';

/* -------------------------------------------------------------------------- */
/*                              TYPES                                         */
/* -------------------------------------------------------------------------- */

/**
 * Pagination metadata for list responses.
 *
 * This is a shared/canonical type defined in `app/interface/common`.
 */
export type ResponseMeta = PaginationMeta;

/**
 * Standard API response structure.
 *
 * @template T - Type of the response data
 */
export interface IApiResponse<T> {
  /**
   * HTTP status code.
   */
  statusCode: number;

  /**
   * Whether the request was successful.
   */
  success: boolean;

  /**
   * Human-readable message describing the result.
   */
  message?: string | null;

  /**
   * Pagination metadata for list responses.
   */
  meta?: PaginationMeta;

  /**
   * Response payload data.
   */
  data?: T | null;
}

/* -------------------------------------------------------------------------- */
/*                              RESPONSE HELPER                               */
/* -------------------------------------------------------------------------- */

/**
 * Sends a standardized JSON response.
 *
 * This utility ensures all API responses follow a consistent structure,
 * making it easier for clients to parse and handle responses.
 *
 * @template T - Type of the response data
 * @param res - Express response object
 * @param data - Response data including status, message, and payload
 *
 * @example
 * // Success response with data
 * sendResponse(res, {
 *   statusCode: StatusCodes.OK,
 *   success: true,
 *   message: 'User retrieved successfully',
 *   data: user,
 * });
 *
 * @example
 * // Paginated list response
 * sendResponse(res, {
 *   statusCode: StatusCodes.OK,
 *   success: true,
 *   message: 'Users retrieved successfully',
 *   meta: { page: 1, limit: 10, total: 100, totalPages: 10 },
 *   data: users,
 * });
 *
 * @example
 * // Created response
 * sendResponse(res, {
 *   statusCode: StatusCodes.CREATED,
 *   success: true,
 *   message: 'User created successfully',
 *   data: newUser,
 * });
 */
export const sendResponse = <T>(res: Response, data: IApiResponse<T>): void => {
  const responseData: IApiResponse<T> = {
    statusCode: data.statusCode,
    success: data.success,
    message: data.message || '',
    data: data.data,
    meta: data.meta,
  };

  res.status(data.statusCode).json(responseData);
};

/* -------------------------------------------------------------------------- */
/*                              CONVENIENCE HELPERS                           */
/* -------------------------------------------------------------------------- */

/**
 * Sends a success response with data.
 *
 * @template T - Type of the response data
 * @param res - Express response object
 * @param message - Success message
 * @param data - Response payload
 * @param statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = <T>(
  res: Response,
  message: string,
  data: T,
  statusCode = 200
): void => {
  sendResponse(res, {
    statusCode,
    success: true,
    message,
    data,
  });
};

/**
 * Sends a paginated list response.
 *
 * @template T - Type of items in the list
 * @param res - Express response object
 * @param message - Success message
 * @param data - Array of items
 * @param meta - Pagination metadata
 */
export const sendPaginatedResponse = <T>(
  res: Response,
  message: string,
  data: T[],
  meta: PaginationMeta
): void => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message,
    meta,
    data,
  });
};

/**
 * Sends a created response (201).
 *
 * @template T - Type of the created resource
 * @param res - Express response object
 * @param message - Success message
 * @param data - Created resource
 */
export const sendCreated = <T>(
  res: Response,
  message: string,
  data: T
): void => {
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message,
    data,
  });
};

/**
 * Sends a no content response (204).
 *
 * @param res - Express response object
 */
export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};
