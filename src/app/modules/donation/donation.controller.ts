import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

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
  const limit = parseInt(req.query.limit as string) || 10;

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
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

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
  const {
    page = 1,
    limit = 20,
    paymentStatus,
    searchTerm,
    minAmount,
    maxAmount,
    fromDate,
    toDate,
  } = req.query;

  const min = typeof minAmount === 'string' ? Number(minAmount) : undefined;
  const max = typeof maxAmount === 'string' ? Number(maxAmount) : undefined;

  const result = await DonationService.getAllDonations(
    Number(page),
    Number(limit),
    {
      paymentStatus: paymentStatus ? String(paymentStatus) : undefined,
      searchTerm: searchTerm ? String(searchTerm) : undefined,
      minAmount: Number.isFinite(min as number) ? (min as number) : undefined,
      maxAmount: Number.isFinite(max as number) ? (max as number) : undefined,
      fromDate: fromDate ? String(fromDate) : undefined,
      toDate: toDate ? String(toDate) : undefined,
    }
  );

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
