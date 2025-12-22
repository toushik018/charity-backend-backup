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

export const AwardController = {
  announceAward,
  getAdminAwards,
  getAwardById,
};
