/**
 * @fileoverview Award routes for admin dashboard.
 *
 * Provides endpoints for:
 * - Announcing award winners
 * - Viewing award history
 * - Getting fundraiser donors with weighted probability
 * - Selecting weighted random winners
 *
 * All routes require admin authentication.
 *
 * @module modules/award/route
 */

import { Router } from 'express';

import auth from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { AwardController } from './award.controller';
import {
  announceAwardValidation,
  getAdminAwardsQueryValidation,
  getAwardByIdValidation,
  getFundraiserDonorsValidation,
  selectWeightedWinnerValidation,
} from './award.validation';

const router = Router();

/**
 * @route POST /api/awards/admin/announce
 * @desc Announce a coupon as award winner
 * @access Admin only
 */
router.post(
  '/admin/announce',
  auth('admin'),
  validateRequest(announceAwardValidation),
  AwardController.announceAward
);

/**
 * @route GET /api/awards/admin/history
 * @desc Get paginated award history
 * @access Admin only
 */
router.get(
  '/admin/history',
  auth('admin'),
  validateRequest(getAdminAwardsQueryValidation),
  AwardController.getAdminAwards
);

/**
 * @route GET /api/awards/admin/fundraiser/:fundraiserId/donors
 * @desc Get donors for a fundraiser with weighted probability
 * @access Admin only
 */
router.get(
  '/admin/fundraiser/:fundraiserId/donors',
  auth('admin'),
  validateRequest(getFundraiserDonorsValidation),
  AwardController.getFundraiserDonors
);

/**
 * @route POST /api/awards/admin/fundraiser/:fundraiserId/select-winner
 * @desc Select a weighted random winner from fundraiser donors
 * @access Admin only
 */
router.post(
  '/admin/fundraiser/:fundraiserId/select-winner',
  auth('admin'),
  validateRequest(selectWeightedWinnerValidation),
  AwardController.selectWeightedWinner
);

/**
 * @route GET /api/awards/admin/:awardId
 * @desc Get a specific award by ID
 * @access Admin only
 */
router.get(
  '/admin/:awardId',
  auth('admin'),
  validateRequest(getAwardByIdValidation),
  AwardController.getAwardById
);

export const AwardRoute = router;
