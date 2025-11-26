import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../auth/auth.interface';
import { FundraiserService } from './fundraiser.service';

const createDraft = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const doc = await FundraiserService.createDraft(userId, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Fundraiser draft created',
    data: doc,
  });
});

const updateFundraiser = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params as { id: string };
  const doc = await FundraiserService.updateFundraiser(userId, id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Fundraiser updated',
    data: doc,
  });
});

const publishFundraiser = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };
    const doc = await FundraiserService.publishFundraiser(userId, id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Fundraiser published',
      data: doc,
    });
  }
);

const getMine = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const status =
    (req.query?.status as 'draft' | 'published' | undefined) || undefined;
  const items = await FundraiserService.getMine(userId, status);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Fundraisers retrieved',
    data: items,
  });
});

const getBySlug = catchAsync(async (req: AuthRequest, res: Response) => {
  const slug = (req.params as { slug: string }).slug;
  const viewerId = req.user?.userId;
  const doc = await FundraiserService.getBySlug(slug, viewerId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Fundraiser retrieved',
    data: doc,
  });
});

export const FundraiserController = {
  createDraft,
  updateFundraiser,
  publishFundraiser,
  getMine,
  getBySlug,
};
