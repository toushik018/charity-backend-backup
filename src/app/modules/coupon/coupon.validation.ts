/**
 * @fileoverview Coupon validation schemas using Zod.
 *
 * Provides request validation for all coupon-related API endpoints,
 * ensuring data integrity and type safety.
 *
 * @module modules/coupon/validation
 */

import { z } from 'zod';

import {
  zObjectId,
  zOptionalAmountString,
  zOptionalDatetime,
  zPaginationQuery,
} from '../../utils/zod';

/* -------------------------------------------------------------------------- */
/*                              COUPON STATUS                                 */
/* -------------------------------------------------------------------------- */

/**
 * Coupon status enum values.
 */
const couponStatusEnum = z.enum(['active', 'used', 'expired']);

/* -------------------------------------------------------------------------- */
/*                           SELECT WINNER                                    */
/* -------------------------------------------------------------------------- */

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
    fundraiserId: zObjectId({
      invalidMessage: 'Invalid fundraiser ID format',
    }).optional(),
    fromDate: zOptionalDatetime(),
    toDate: zOptionalDatetime(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                          GET USER COUPONS                                  */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for fetching coupons by user.
 *
 * Supports pagination with page and limit query parameters.
 * Defaults: page=1, limit=20
 */
export const getUserCouponsSchema = z.object({
  query: z.object({
    ...zPaginationQuery({ defaultPage: 1, defaultLimit: 20 }),
  }),
});

/* -------------------------------------------------------------------------- */
/*                          GET COUPON BY CODE                                */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for fetching a single coupon by code.
 *
 * Automatically transforms the code to uppercase for case-insensitive lookup.
 */
export const getCouponByCodeSchema = z.object({
  params: z.object({
    code: z
      .string()
      .min(1, 'Coupon code is required')
      .transform((val) => val.toUpperCase()),
  }),
});

/* -------------------------------------------------------------------------- */
/*                          GET COUPON STATS                                  */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for admin coupon statistics.
 *
 * Supports optional fundraiser filtering.
 */
export const getCouponStatsSchema = z.object({
  query: z.object({
    fundraiserId: zObjectId({
      invalidMessage: 'Invalid fundraiser ID format',
    }).optional(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                          GET ALL COUPONS (ADMIN)                           */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for admin coupon list endpoint.
 *
 * Supports:
 * - Pagination (page, limit) with defaults
 * - Search by coupon code
 * - Filtering by status, fundraiser, amount range, date range
 */
export const getAllCouponsSchema = z.object({
  query: z.object({
    ...zPaginationQuery({ defaultPage: 1, defaultLimit: 20 }),
    search: z.string().optional(),
    status: couponStatusEnum.optional(),
    fundraiserId: zObjectId({
      invalidMessage: 'Invalid fundraiser ID format',
    }).optional(),
    minAmount: zOptionalAmountString('minAmount must be a valid number'),
    maxAmount: zOptionalAmountString('maxAmount must be a valid number'),
    fromDate: zOptionalDatetime(),
    toDate: zOptionalDatetime(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                          GET COUPON BY ID                                  */
/* -------------------------------------------------------------------------- */

/**
 * Validation schema for admin: get a single coupon by id.
 */
export const getCouponByIdSchema = z.object({
  params: z.object({
    couponId: zObjectId({ invalidMessage: 'Invalid coupon ID format' }),
  }),
});

/* -------------------------------------------------------------------------- */
/*                          EXPORTS                                           */
/* -------------------------------------------------------------------------- */

/**
 * Grouped export of all coupon validation schemas.
 *
 * Provides a convenient namespace for importing all schemas at once.
 */
export const CouponValidation = {
  selectWinnerSchema,
  getUserCouponsSchema,
  getCouponByCodeSchema,
  getCouponStatsSchema,
  getAllCouponsSchema,
  getCouponByIdSchema,
};
