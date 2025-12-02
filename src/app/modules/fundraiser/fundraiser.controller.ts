import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../error/AppError';
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

const getPublic = catchAsync(async (req: AuthRequest, res: Response) => {
  const {
    searchTerm,
    owner,
    category,
    country,
    page,
    limit,
    sortBy,
    sortOrder,
  } = req.query as Record<string, string>;

  const filters = {
    searchTerm,
    owner,
    category,
    country,
  };

  const options = {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    sortBy,
    sortOrder: sortOrder as 'asc' | 'desc' | undefined,
  };

  const result = await FundraiserService.getPublicFundraisers(filters, options);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Fundraisers retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAll = catchAsync(async (req: AuthRequest, res: Response) => {
  const requester = req.user;
  if (!requester || requester.role !== 'admin') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Only admins can view all fundraisers'
    );
  }

  const {
    searchTerm,
    status,
    owner,
    category,
    country,
    page,
    limit,
    sortBy,
    sortOrder,
  } = req.query as Record<string, string>;

  const filters = {
    searchTerm,
    status: status as 'draft' | 'published' | undefined,
    owner,
    category,
    country,
  };

  const options = {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    sortBy,
    sortOrder: sortOrder as 'asc' | 'desc' | undefined,
  };

  const result = await FundraiserService.getAllFundraisers(filters, options);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Fundraisers retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const adminCreate = catchAsync(async (req: AuthRequest, res: Response) => {
  const requester = req.user;
  if (!requester || requester.role !== 'admin') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Only admins can create fundraisers'
    );
  }

  const { ownerId } = req.params as { ownerId: string };
  const doc = await FundraiserService.adminCreateFundraiser(ownerId, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Fundraiser created successfully',
    data: doc,
  });
});

const adminUpdate = catchAsync(async (req: AuthRequest, res: Response) => {
  const requester = req.user;
  if (!requester || requester.role !== 'admin') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Only admins can update fundraisers'
    );
  }

  const { id } = req.params as { id: string };
  const doc = await FundraiserService.adminUpdateFundraiser(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Fundraiser updated successfully',
    data: doc,
  });
});

const adminDelete = catchAsync(async (req: AuthRequest, res: Response) => {
  const requester = req.user;
  if (!requester || requester.role !== 'admin') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Only admins can delete fundraisers'
    );
  }

  const { id } = req.params as { id: string };
  await FundraiserService.adminDeleteFundraiser(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Fundraiser deleted successfully',
    data: {},
  });
});

const adminGetById = catchAsync(async (req: AuthRequest, res: Response) => {
  const requester = req.user;
  if (!requester || requester.role !== 'admin') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Only admins can view fundraisers'
    );
  }

  const { id } = req.params as { id: string };
  const doc = await FundraiserService.adminGetById(id);
  if (!doc) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Fundraiser not found');
  }
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Fundraiser retrieved successfully',
    data: doc,
  });
});

export const FundraiserController = {
  createDraft,
  updateFundraiser,
  publishFundraiser,
  getMine,
  getBySlug,
  getPublic,
  getAll,
  adminCreate,
  adminUpdate,
  adminDelete,
  adminGetById,
};
