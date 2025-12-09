/**
 * @fileoverview Coupon controller for handling HTTP requests.
 *
 * Provides request handlers for:
 * - Fetching user's coupons
 * - Looking up coupon by code
 * - Admin: Getting coupon statistics
 * - Admin: Selecting random winner
 *
 * @module modules/coupon/controller
 */

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../auth/auth.interface';
import { CouponService } from './coupon.service';

/**
 * Get coupons for the authenticated user.
 *
 * @route GET /api/coupons/mine
 * @access Private (requires authentication)
 *
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 *
 * @returns {object} Paginated list of user's coupons
 */
const getMyCoupons = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return sendResponse(res, {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: 'Authentication required',
      data: null,
    });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await CouponService.getUserCoupons(userId, page, limit);

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Coupons retrieved successfully',
    data: result.coupons,
    meta: result.pagination,
  });
});

/**
 * Get a single coupon by its code.
 *
 * @route GET /api/coupons/code/:code
 * @access Public
 *
 * @param {string} code - Coupon code
 *
 * @returns {object} Coupon details
 */
const getCouponByCode = catchAsync(async (req: Request, res: Response) => {
  const { code } = req.params;

  const coupon = await CouponService.getCouponByCode(code);

  if (!coupon) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Coupon not found',
      data: null,
    });
  }

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Coupon retrieved successfully',
    data: coupon,
  });
});

/**
 * Get coupon statistics for admin dashboard.
 *
 * @route GET /api/coupons/admin/stats
 * @access Private (admin only)
 *
 * @query {string} [fundraiserId] - Optional fundraiser filter
 *
 * @returns {object} Coupon statistics
 */
const getCouponStats = catchAsync(async (req: Request, res: Response) => {
  const { fundraiserId } = req.query;

  const stats = await CouponService.getCouponStats(
    fundraiserId as string | undefined
  );

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Coupon statistics retrieved successfully',
    data: stats,
  });
});

/**
 * Select a random winner from active coupons.
 *
 * @route POST /api/coupons/admin/select-winner
 * @access Private (admin only)
 *
 * @body {string} [fundraiserId] - Optional fundraiser filter
 * @body {string} [fromDate] - Optional start date filter (ISO 8601)
 * @body {string} [toDate] - Optional end date filter (ISO 8601)
 *
 * @returns {object} Selected winner coupon or null
 */
const selectWinner = catchAsync(async (req: Request, res: Response) => {
  const { fundraiserId, fromDate, toDate } = req.body;

  const winner = await CouponService.selectRandomWinner({
    fundraiserId,
    fromDate: fromDate ? new Date(fromDate) : undefined,
    toDate: toDate ? new Date(toDate) : undefined,
  });

  if (!winner) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'No eligible coupons found for selection',
      data: null,
    });
  }

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Winner selected successfully',
    data: winner,
  });
});

/**
 * Manually trigger expired coupon cleanup.
 *
 * @route POST /api/coupons/admin/cleanup
 * @access Private (admin only)
 *
 * @returns {object} Number of coupons marked as expired
 */
const cleanupExpiredCoupons = catchAsync(
  async (_req: Request, res: Response) => {
    const count = await CouponService.markExpiredCoupons();

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: `${count} coupons marked as expired`,
      data: { expiredCount: count },
    });
  }
);

export const CouponController = {
  getMyCoupons,
  getCouponByCode,
  getCouponStats,
  selectWinner,
  cleanupExpiredCoupons,
};
