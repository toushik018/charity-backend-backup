/**
 * @fileoverview Coupon validation schemas using Zod.
 *
 * Provides request validation for all coupon-related API endpoints,
 * ensuring data integrity and type safety.
 *
 * @module modules/coupon/validation
 */

import { z } from 'zod';

/**
 * Validation schema for selecting a random winner.
 *
 * All fields are optional to allow flexible filtering:
 * - fundraiserId: Filter by specific fundraiser
 * - fromDate: Filter coupons created after this date
 * - toDate: Filter coupons created before this date
 */
export const selectWinnerSchema = z.object({
  body: z.object({
    fundraiserId: z
      .string()
      .regex(/^[a-fA-F0-9]{24}$/, 'Invalid fundraiser ID format')
      .optional(),
    fromDate: z
      .string()
      .datetime({ message: 'Invalid date format' })
      .optional(),
    toDate: z.string().datetime({ message: 'Invalid date format' }).optional(),
  }),
});

/**
 * Validation schema for fetching coupons by user.
 *
 * Supports pagination with page and limit query parameters.
 */
export const getUserCouponsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a positive integer')
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20)),
  }),
});

/**
 * Validation schema for fetching a single coupon by code.
 */
export const getCouponByCodeSchema = z.object({
  params: z.object({
    code: z
      .string()
      .min(1, 'Coupon code is required')
      .transform((val) => val.toUpperCase()),
  }),
});

/**
 * Validation schema for admin coupon statistics.
 *
 * Supports optional fundraiser filtering.
 */
export const getCouponStatsSchema = z.object({
  query: z.object({
    fundraiserId: z
      .string()
      .regex(/^[a-fA-F0-9]{24}$/, 'Invalid fundraiser ID format')
      .optional(),
  }),
});

export const CouponValidation = {
  selectWinnerSchema,
  getUserCouponsSchema,
  getCouponByCodeSchema,
  getCouponStatsSchema,
};
