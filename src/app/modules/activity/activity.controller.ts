/**
 * @fileoverview Activity controller layer.
 *
 * Handles HTTP requests for activity-related operations, delegating
 * business logic to the service layer and formatting responses.
 *
 * @module modules/activity/controller
 */

import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import AppError from '../../error/AppError';
import { catchAsync } from '../../utils/catchAsync';
import {
  parseBooleanQuery,
  parseOptionalPaginationOptions,
  parseRawStringQuery,
} from '../../utils/request';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../auth/auth.interface';
import { TActivityType } from './activity.interface';
import {
  createActivity,
  deleteActivity,
  getAllActivities,
  getFundraiserActivities,
  getPublicUserActivities,
  getUserActivities,
} from './activity.service';

/* -------------------------------------------------------------------------- */
/*                              HELPERS                                       */
/* -------------------------------------------------------------------------- */

/**
 * Extracts pagination options from request query.
 *
 * @param query - Request query object
 * @returns Pagination options
 */
const extractPaginationOptions = (query: Record<string, unknown>) =>
  parseOptionalPaginationOptions(query);

/**
 * Parses boolean from string query parameter.
 *
 * @param value - String value ('true' or 'false')
 * @returns Boolean or undefined
 */
const parseBoolean = (value: unknown): boolean | undefined =>
  parseBooleanQuery(value);

/**
 * Ensures the request has an authenticated user.
 *
 * @param req - Auth request object
 * @throws AppError if user is not authenticated
 */
const requireAuth = (req: AuthRequest): void => {
  if (!req.user) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Authenticated user is required'
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                              CREATE                                        */
/* -------------------------------------------------------------------------- */

/**
 * Creates a new activity.
 *
 * @route POST /activities
 * @access Private (user, admin)
 */
const create = catchAsync(async (req: AuthRequest, res: Response) => {
  requireAuth(req);

  const {
    type,
    fundraiserId,
    donationAmount,
    donationCurrency,
    reactionType,
    isPublic,
  } = req.body as {
    type: TActivityType;
    fundraiserId: string;
    donationAmount?: number;
    donationCurrency?: string;
    reactionType?: string;
    isPublic?: boolean;
  };

  const activity = await createActivity({
    userId: req.user!.userId,
    type,
    fundraiserId,
    donationAmount,
    donationCurrency,
    reactionType,
    isPublic,
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Activity created successfully',
    data: activity,
  });
});

/* -------------------------------------------------------------------------- */
/*                              READ - USER                                   */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves current user's activities.
 *
 * @route GET /activities/me
 * @access Private (user, admin)
 */
const getMyActivities = catchAsync(async (req: AuthRequest, res: Response) => {
  requireAuth(req);

  const options = extractPaginationOptions(
    req.query as Record<string, unknown>
  );
  const result = await getUserActivities(req.user!.userId, options);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Your activities retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

/**
 * Retrieves activities for a specific user.
 *
 * @route GET /activities/user/:userId
 * @access Public
 */
const getUserActivitiesController = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { userId } = req.params as { userId: string };
    const options = extractPaginationOptions(
      req.query as Record<string, unknown>
    );

    const result = await getPublicUserActivities(userId, options);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User activities retrieved successfully',
      meta: result.meta,
      data: result.data,
    });
  }
);

/* -------------------------------------------------------------------------- */
/*                              READ - FUNDRAISER                             */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves activities for a specific fundraiser.
 *
 * @route GET /activities/fundraiser/:fundraiserId
 * @access Public
 */
const getFundraiserActivitiesController = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { fundraiserId } = req.params as { fundraiserId: string };
    const options = extractPaginationOptions(
      req.query as Record<string, unknown>
    );

    const result = await getFundraiserActivities(fundraiserId, options);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Fundraiser activities retrieved successfully',
      meta: result.meta,
      data: result.data,
    });
  }
);

/* -------------------------------------------------------------------------- */
/*                              ADMIN                                         */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves all activities with filtering (admin only).
 *
 * @route GET /activities/admin/all
 * @access Private (admin)
 */
const getAllActivitiesController = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const query = req.query as Record<string, unknown>;

    const options = {
      ...extractPaginationOptions(query),
      filters: {
        searchTerm: parseRawStringQuery(query.searchTerm),
        type: parseRawStringQuery(query.type) as TActivityType | undefined,
        isPublic: parseBoolean(query.isPublic),
        userId: parseRawStringQuery(query.userId),
        fundraiserId: parseRawStringQuery(query.fundraiserId),
        reactionType: parseRawStringQuery(query.reactionType),
        fromDate: parseRawStringQuery(query.fromDate),
        toDate: parseRawStringQuery(query.toDate),
      },
    };

    const result = await getAllActivities(options);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'All activities retrieved successfully',
      meta: result.meta,
      data: result.data,
    });
  }
);

/**
 * Deletes an activity (admin only).
 *
 * @route DELETE /activities/admin/:activityId
 * @access Private (admin)
 */
const deleteActivityController = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { activityId } = req.params as { activityId: string };

    await deleteActivity(activityId);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Activity deleted successfully',
      data: null,
    });
  }
);

/* -------------------------------------------------------------------------- */
/*                              EXPORTS                                       */
/* -------------------------------------------------------------------------- */

/**
 * Activity controller methods.
 *
 * Grouped export of all activity-related controller functions.
 */
export const ActivityController = {
  create,
  getMyActivities,
  getUserActivities: getUserActivitiesController,
  getFundraiserActivities: getFundraiserActivitiesController,
  getAllActivities: getAllActivitiesController,
  deleteActivity: deleteActivityController,
};
