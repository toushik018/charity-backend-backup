/**
 * @fileoverview Coupon API routes.
 *
 * Defines all HTTP endpoints for coupon-related operations:
 * - User routes: Get my coupons, lookup by code
 * - Admin routes: Statistics, winner selection, cleanup
 *
 * @module modules/coupon/route
 */

import express from 'express';
import auth from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { CouponController } from './coupon.controller';
import { CouponValidation } from './coupon.validation';

const router = express.Router();

/**
 * @route GET /api/coupons/mine
 * @description Get authenticated user's coupons
 * @access Private
 */
router.get('/mine', auth('user', 'admin'), CouponController.getMyCoupons);

/**
 * @route GET /api/coupons/code/:code
 * @description Get coupon details by code
 * @access Public
 */
router.get(
  '/code/:code',
  validateRequest(CouponValidation.getCouponByCodeSchema),
  CouponController.getCouponByCode
);

/**
 * @route GET /api/coupons/admin/stats
 * @description Get coupon statistics (admin only)
 * @access Private (admin)
 */
router.get(
  '/admin/stats',
  auth('admin'),
  validateRequest(CouponValidation.getCouponStatsSchema),
  CouponController.getCouponStats
);

/**
 * @route GET /api/coupons/admin/all
 * @description Get all coupons with populated donation + fundraiser (admin only)
 * @access Private (admin)
 */
router.get(
  '/admin/all',
  auth('admin'),
  validateRequest(CouponValidation.getAllCouponsSchema),
  CouponController.getAllCoupons
);

/**
 * @route POST /api/coupons/admin/select-winner
 * @description Select a random winner from active coupons (admin only)
 * @access Private (admin)
 */
router.post(
  '/admin/select-winner',
  auth('admin'),
  validateRequest(CouponValidation.selectWinnerSchema),
  CouponController.selectWinner
);

/**
 * @route POST /api/coupons/admin/cleanup
 * @description Mark expired coupons (admin only)
 * @access Private (admin)
 */
router.post(
  '/admin/cleanup',
  auth('admin'),
  CouponController.cleanupExpiredCoupons
);

export const CouponRoutes = router;
