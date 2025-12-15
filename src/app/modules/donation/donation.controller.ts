import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import {
  parseBooleanQuery,
  parseIntQuery,
  parseNumberQuery,
  parsePaginationQuery,
  parseRawStringQuery,
} from '../../utils/request';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../auth/auth.interface';
import { DonationService } from './donation.service';

const createDonation = catchAsync(async (req: AuthRequest, res: Response) => {
  const donorId = req.user?.userId;
  const result = await DonationService.createDonation(req.body, donorId);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Donation created successfully',
    data: result,
  });
});

// Admin: Get donation by id
const getDonationById = catchAsync(async (req: Request, res: Response) => {
  const { donationId } = req.params;
  const result = await DonationService.getDonationById(donationId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Donation retrieved successfully',
    data: result,
  });
});

const getDonationsByFundraiser = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { fundraiserId } = req.params;
    const { page, limit } = parsePaginationQuery(
      req.query as Record<string, unknown>,
      { page: 1, limit: 20 }
    );

    const result = await DonationService.getDonationsByFundraiser(
      fundraiserId,
      page,
      limit
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Donations retrieved successfully',
      data: result.donations,
      meta: result.pagination,
    });
  }
);

const getTopDonations = catchAsync(async (req: AuthRequest, res: Response) => {
  const { fundraiserId } = req.params;
  const limit =
    parseIntQuery((req.query as Record<string, unknown>).limit) || 10;

  const result = await DonationService.getTopDonations(fundraiserId, limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Top donations retrieved successfully',
    data: result,
  });
});

const getMyDonations = catchAsync(async (req: AuthRequest, res: Response) => {
  const donorId = req.user!.userId;
  const { page, limit } = parsePaginationQuery(
    req.query as Record<string, unknown>,
    { page: 1, limit: 20 }
  );

  const result = await DonationService.getMyDonations(donorId, page, limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'My donations retrieved successfully',
    data: result.donations,
    meta: result.pagination,
  });
});

const getMyImpactStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const donorId = req.user!.userId;
  const result = await DonationService.getMyImpactStats(donorId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Impact stats retrieved successfully',
    data: result,
  });
});

// Admin: Get all donations
const getAllDonations = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, unknown>;

  const { page, limit } = parsePaginationQuery(query, { page: 1, limit: 20 });

  const min = parseNumberQuery(query.minAmount);
  const max = parseNumberQuery(query.maxAmount);

  const isAnonymousBool = parseBooleanQuery(query.isAnonymous);

  const result = await DonationService.getAllDonations(page, limit, {
    paymentStatus: parseRawStringQuery(query.paymentStatus) || undefined,
    searchTerm: parseRawStringQuery(query.searchTerm) || undefined,
    fundraiserId: parseRawStringQuery(query.fundraiserId) || undefined,
    donorId: parseRawStringQuery(query.donorId) || undefined,
    currency: parseRawStringQuery(query.currency) || undefined,
    paymentMethod: parseRawStringQuery(query.paymentMethod) || undefined,
    isAnonymous: isAnonymousBool,
    minAmount: min,
    maxAmount: max,
    fromDate: parseRawStringQuery(query.fromDate) || undefined,
    toDate: parseRawStringQuery(query.toDate) || undefined,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'All donations retrieved successfully',
    data: result.donations,
    meta: result.pagination,
  });
});

// Admin: Get donation stats
const getDonationStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await DonationService.getDonationStats();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Donation stats retrieved successfully',
    data: result,
  });
});

// Admin: Delete donation
const deleteDonation = catchAsync(async (req: Request, res: Response) => {
  const { donationId } = req.params;
  await DonationService.deleteDonation(donationId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Donation deleted successfully',
    data: null,
  });
});

export const DonationController = {
  createDonation,
  getDonationsByFundraiser,
  getTopDonations,
  getMyDonations,
  getMyImpactStats,
  getAllDonations,
  getDonationById,
  getDonationStats,
  deleteDonation,
};
