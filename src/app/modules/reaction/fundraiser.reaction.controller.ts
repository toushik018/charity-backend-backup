import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../error/AppError';
import { catchAsync } from '../../utils/catchAsync';
import { parseOptionalPaginationOptions } from '../../utils/request';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../auth/auth.interface';
import { TReactionType } from './fundraiser.reaction.interface';
import {
  addOrUpdateReaction,
  getMyReactions,
  getReactionsSummary,
  removeReaction,
} from './fundraiser.reaction.service';

const reactToFundraiser = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const requester = req.user;
    if (!requester) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        'Authenticated user is required'
      );
    }
    const { id } = req.params as { id: string };
    const { type } = req.body as { type: TReactionType };
    const doc = await addOrUpdateReaction(requester.userId, id, type);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Reaction saved',
      data: doc,
    });
  }
);

const removeMyReaction = catchAsync(async (req: AuthRequest, res: Response) => {
  const requester = req.user;
  if (!requester) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Authenticated user is required'
    );
  }
  const { id } = req.params as { id: string };
  await removeReaction(requester.userId, id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reaction removed',
    data: {},
  });
});

const getFundraiserReactions = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const summary = await getReactionsSummary(id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Reactions summary retrieved',
      data: summary,
    });
  }
);

const getMyReactionsController = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const requester = req.user;
    if (!requester) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        'Authenticated user is required'
      );
    }
    const options = parseOptionalPaginationOptions(
      req.query as Record<string, unknown>
    );
    const result = await getMyReactions(requester.userId, options);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Your reactions retrieved',
      meta: result.meta,
      data: result.data,
    });
  }
);

export const FundraiserReactionController = {
  reactToFundraiser,
  removeMyReaction,
  getFundraiserReactions,
  getMyReactions: getMyReactionsController,
};
