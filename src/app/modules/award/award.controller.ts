import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { catchAsync } from '../../utils/catchAsync';
import { parsePaginationQuery } from '../../utils/request';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../auth/auth.interface';
import { AwardService } from './award.service';

const announceAward = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return sendResponse(res, {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: 'Authentication required',
      data: null,
    });
  }

  const { couponId, selectedAt, notes } = req.body as {
    couponId: string;
    selectedAt?: string;
    notes?: string;
  };

  const award = await AwardService.announceAward({
    couponId,
    notes,
    announcedBy: userId,
    selectedAt: selectedAt ? new Date(selectedAt) : undefined,
  });

  return sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Award announced successfully',
    data: award,
  });
});

const getAdminAwards = catchAsync(async (req: Request, res: Response) => {
  const { page, limit } = parsePaginationQuery(
    req.query as Record<string, unknown>,
    { page: 1, limit: 20 }
  );

  const { fundraiserId, fromDate, toDate } = req.query as {
    fundraiserId?: string;
    fromDate?: string;
    toDate?: string;
  };

  const result = await AwardService.getAdminAwards({
    page,
    limit,
    fundraiserId,
    fromDate: fromDate ? new Date(fromDate) : undefined,
    toDate: toDate ? new Date(toDate) : undefined,
  });

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Awards history retrieved successfully',
    data: result.awards,
    meta: result.pagination,
  });
});

const getAwardById = catchAsync(async (req: Request, res: Response) => {
  const { awardId } = req.params as { awardId: string };
  const award = await AwardService.getAwardById(awardId);

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Award retrieved successfully',
    data: award,
  });
});

/**
 * Gets donors for a specific fundraiser with weighted probability data.
 *
 * Returns all active coupons for the fundraiser with calculated
 * win probability based on donation amount.
 *
 * @route GET /api/awards/admin/fundraiser/:fundraiserId/donors
 */
const getFundraiserDonors = catchAsync(async (req: Request, res: Response) => {
  const { fundraiserId } = req.params as { fundraiserId: string };

  const result = await AwardService.getFundraiserDonorsForAward(fundraiserId);

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Fundraiser donors retrieved successfully',
    data: result,
  });
});

/**
 * Selects a weighted random winner from a fundraiser's donors.
 *
 * Uses weighted probability based on donation amount.
 * Higher donations have proportionally higher chance of winning.
 *
 * @route POST /api/awards/admin/fundraiser/:fundraiserId/select-winner
 */
const selectWeightedWinner = catchAsync(async (req: Request, res: Response) => {
  const { fundraiserId } = req.params as { fundraiserId: string };

  const result = await AwardService.selectWeightedWinner(fundraiserId);

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Winner selected successfully',
    data: result,
  });
});

export const AwardController = {
  announceAward,
  getAdminAwards,
  getAwardById,
  getFundraiserDonors,
  selectWeightedWinner,
};
