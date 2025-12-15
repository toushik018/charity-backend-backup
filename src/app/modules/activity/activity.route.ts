/**
 * @fileoverview Activity API routes.
 *
 * Defines all HTTP endpoints for activity-related operations including
 * creating, retrieving, and managing user activities.
 *
 * @module modules/activity/route
 */

import { Router } from 'express';

import auth from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { ActivityController } from './activity.controller';
import {
  createActivityValidation,
  getAdminActivitiesValidation,
  getFundraiserActivitiesValidation,
  getMyActivitiesValidation,
  getUserActivitiesValidation,
} from './activity.validation';

const router = Router();

/* -------------------------------------------------------------------------- */
/*                              PUBLIC ROUTES                                 */
/* -------------------------------------------------------------------------- */

/**
 * @route   GET /activities/user/:userId
 * @desc    Get public activities for a specific user
 * @access  Public
 */
router.get(
  '/user/:userId',
  validateRequest(getUserActivitiesValidation),
  ActivityController.getUserActivities
);

/**
 * @route   GET /activities/fundraiser/:fundraiserId
 * @desc    Get public activities for a specific fundraiser
 * @access  Public
 */
router.get(
  '/fundraiser/:fundraiserId',
  validateRequest(getFundraiserActivitiesValidation),
  ActivityController.getFundraiserActivities
);

/* -------------------------------------------------------------------------- */
/*                              AUTHENTICATED ROUTES                          */
/* -------------------------------------------------------------------------- */

/**
 * @route   POST /activities
 * @desc    Create a new activity
 * @access  Private (user, admin)
 */
router.post(
  '/',
  auth('admin', 'user'),
  validateRequest(createActivityValidation),
  ActivityController.create
);

/**
 * @route   GET /activities/me
 * @desc    Get current user's activities
 * @access  Private (user, admin)
 */
router.get(
  '/me',
  auth('admin', 'user'),
  validateRequest(getMyActivitiesValidation),
  ActivityController.getMyActivities
);

/* -------------------------------------------------------------------------- */
/*                              ADMIN ROUTES                                  */
/* -------------------------------------------------------------------------- */

/**
 * @route   GET /activities/admin/all
 * @desc    Get all activities with filtering (admin dashboard)
 * @access  Private (admin only)
 */
router.get(
  '/admin/all',
  auth('admin'),
  validateRequest(getAdminActivitiesValidation),
  ActivityController.getAllActivities
);

/**
 * @route   DELETE /activities/admin/:activityId
 * @desc    Delete an activity
 * @access  Private (admin only)
 */
router.delete(
  '/admin/:activityId',
  auth('admin'),
  ActivityController.deleteActivity
);

/* -------------------------------------------------------------------------- */
/*                              EXPORTS                                       */
/* -------------------------------------------------------------------------- */

/**
 * Activity router instance.
 *
 * Mount this router at /activities in the main app.
 */
export const ActivityRoute = router;
