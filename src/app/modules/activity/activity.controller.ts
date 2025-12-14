import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../error/AppError';
import { catchAsync } from '../../utils/catchAsync';
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

const create = catchAsync(async (req: AuthRequest, res: Response) => {
  const requester = req.user;
  if (!requester) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Authenticated user is required'
    );
  }

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
    userId: requester.userId,
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

const getMyActivities = catchAsync(async (req: AuthRequest, res: Response) => {
  const requester = req.user;
  if (!requester) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Authenticated user is required'
    );
  }

  const { page, limit } = req.query as Record<string, string>;
  const options = {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  };

  const result = await getUserActivities(requester.userId, options);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Your activities retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getUserActivitiesController = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { userId } = req.params as { userId: string };
    const { page, limit } = req.query as Record<string, string>;
    const options = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

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

const getFundraiserActivitiesController = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { fundraiserId } = req.params as { fundraiserId: string };
    const { page, limit } = req.query as Record<string, string>;
    const options = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

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

// Admin: Get all activities
const getAllActivitiesController = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const {
      page,
      limit,
      searchTerm,
      type,
      isPublic,
      userId,
      fundraiserId,
      reactionType,
      fromDate,
      toDate,
    } = req.query as Record<string, string | undefined>;

    const options = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      filters: {
        searchTerm: searchTerm ? String(searchTerm) : undefined,
        type: type ? (String(type) as TActivityType) : undefined,
        isPublic:
          typeof isPublic === 'string'
            ? String(isPublic) === 'true'
              ? true
              : false
            : undefined,
        userId: userId ? String(userId) : undefined,
        fundraiserId: fundraiserId ? String(fundraiserId) : undefined,
        reactionType: reactionType ? String(reactionType) : undefined,
        fromDate: fromDate ? String(fromDate) : undefined,
        toDate: toDate ? String(toDate) : undefined,
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

// Admin: Delete activity
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

export const ActivityController = {
  create,
  getMyActivities,
  getUserActivities: getUserActivitiesController,
  getFundraiserActivities: getFundraiserActivitiesController,
  getAllActivities: getAllActivitiesController,
  deleteActivity: deleteActivityController,
};
