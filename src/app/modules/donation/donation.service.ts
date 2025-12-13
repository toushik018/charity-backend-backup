import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import AppError from '../../error/AppError';
import { createActivity } from '../activity/activity.service';
import { CouponService } from '../coupon/coupon.service';
import { Fundraiser } from '../fundraiser/fundraiser.model';
import { TCreateDonationPayload } from './donation.interface';
import { Donation } from './donation.model';

const createDonation = async (
  payload: TCreateDonationPayload,
  donorId?: string
) => {
  const {
    fundraiserId,
    amount,
    tipAmount = 0,
    currency = 'EUR',
    paymentMethod,
    isAnonymous = false,
    donorName,
    donorEmail,
    message,
  } = payload;

  const normalizedCurrency = currency.toUpperCase();

  // Verify fundraiser exists and is published
  const fundraiser = await Fundraiser.findById(fundraiserId);
  if (!fundraiser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Fundraiser not found');
  }
  if (fundraiser.status !== 'published') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Cannot donate to unpublished fundraiser'
    );
  }

  const totalAmount = amount + tipAmount;

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create donation record
    const [donation] = await Donation.create(
      [
        {
          fundraiser: fundraiserId,
          donor: donorId || undefined,
          amount,
          tipAmount,
          totalAmount,
          currency: normalizedCurrency,
          paymentMethod,
          paymentStatus: 'completed', // For now, mark as completed (integrate Stripe later)
          isAnonymous,
          donorName,
          donorEmail,
          message,
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        },
      ],
      { session }
    );

    // Update fundraiser's currentAmount and donationCount
    await Fundraiser.findByIdAndUpdate(
      fundraiserId,
      {
        $inc: {
          currentAmount: amount,
          donationCount: 1,
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Create activity for logged-in users (non-anonymous donations)
    if (donorId && !isAnonymous) {
      try {
        await createActivity({
          userId: donorId,
          type: 'DONATION',
          fundraiserId,
          donationAmount: amount,
          donationCurrency: normalizedCurrency,
          isPublic: true,
        });
      } catch (activityError) {
        // Log error but don't fail the donation
        // eslint-disable-next-line no-console
        console.error('Failed to create donation activity:', activityError);
      }
    }

    // Create and send coupon for the donation
    try {
      await CouponService.createCoupon({
        donationId: donation._id.toString(),
        fundraiserId,
        userId: donorId,
        donorEmail,
        donorName,
        donationAmount: amount,
        currency: normalizedCurrency,
        fundraiserTitle: fundraiser.title,
      });
    } catch (couponError) {
      // Log error but don't fail the donation
      // eslint-disable-next-line no-console
      console.error('Failed to create coupon:', couponError);
    }

    // Return donation with populated fundraiser
    const populatedDonation = await Donation.findById(donation._id)
      .populate(
        'fundraiser',
        'title slug currentAmount donationCount goalAmount'
      )
      .populate('donor', 'name profilePicture');

    return populatedDonation;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getDonationsByFundraiser = async (
  fundraiserId: string,
  page = 1,
  limit = 20
) => {
  const skip = (page - 1) * limit;

  const donations = await Donation.find({
    fundraiser: fundraiserId,
    paymentStatus: 'completed',
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('donor', 'name profilePicture');

  const total = await Donation.countDocuments({
    fundraiser: fundraiserId,
    paymentStatus: 'completed',
  });

  return {
    donations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getTopDonations = async (fundraiserId: string, limit = 10) => {
  const donations = await Donation.find({
    fundraiser: fundraiserId,
    paymentStatus: 'completed',
  })
    .sort({ amount: -1 })
    .limit(limit)
    .populate('donor', 'name profilePicture');

  return donations;
};

const getMyDonations = async (donorId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const donations = await Donation.find({
    donor: donorId,
    paymentStatus: 'completed',
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('fundraiser', 'title slug coverImage');

  const total = await Donation.countDocuments({
    donor: donorId,
    paymentStatus: 'completed',
  });

  return {
    donations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Admin: Get all donations
const getAllDonations = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const donations = await Donation.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('fundraiser', 'title slug coverImage')
    .populate('donor', 'name email profilePicture');

  const total = await Donation.countDocuments();

  return {
    donations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Admin: Get donation stats
const getDonationStats = async () => {
  const [totalDonations, completedDonations, totalAmount, recentDonations] =
    await Promise.all([
      Donation.countDocuments(),
      Donation.countDocuments({ paymentStatus: 'completed' }),
      Donation.aggregate([
        { $match: { paymentStatus: 'completed' } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            tips: { $sum: '$tipAmount' },
          },
        },
      ]),
      Donation.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('fundraiser', 'title slug')
        .populate('donor', 'name profilePicture'),
    ]);

  return {
    totalDonations,
    completedDonations,
    totalAmount: totalAmount[0]?.total || 0,
    totalTips: totalAmount[0]?.tips || 0,
    recentDonations,
  };
};

// Admin: Delete donation
const deleteDonation = async (donationId: string) => {
  const donation = await Donation.findByIdAndDelete(donationId);
  if (!donation) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Donation not found');
  }
  return donation;
};

const getMyImpactStats = async (donorId: string) => {
  const donations = await Donation.find({
    donor: donorId,
    paymentStatus: 'completed',
  }).populate('fundraiser', 'title slug coverImage');

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalTips = donations.reduce((sum, d) => sum + d.tipAmount, 0);
  const fundraisersSupported = new Set(
    donations.map((d) => d.fundraiser?._id?.toString()).filter(Boolean)
  ).size;

  return {
    totalDonated,
    totalTips,
    totalImpact: totalDonated + totalTips,
    donationCount: donations.length,
    fundraisersSupported,
    currency: 'EUR',
  };
};

// Create donation from Stripe webhook (after successful payment)
interface CreateDonationFromStripePayload {
  fundraiserId: string;
  amount: number;
  tipAmount: number;
  currency: string;
  paymentMethod: string;
  isAnonymous: boolean;
  donorName: string;
  donorEmail: string;
  transactionId: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  donorId?: string;
}

const createDonationFromStripe = async (
  payload: CreateDonationFromStripePayload
) => {
  const {
    fundraiserId,
    amount,
    tipAmount,
    currency,
    paymentMethod,
    isAnonymous,
    donorName,
    donorEmail,
    transactionId,
    paymentStatus,
    donorId,
  } = payload;

  const normalizedCurrency = currency.toUpperCase();

  // Check if donation already exists (idempotency)
  const existingDonation = await Donation.findOne({ transactionId });
  if (existingDonation) {
    return existingDonation;
  }

  // Verify fundraiser exists
  const fundraiser = await Fundraiser.findById(fundraiserId);
  if (!fundraiser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Fundraiser not found');
  }

  const totalAmount = amount + tipAmount;

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create donation record
    const [donation] = await Donation.create(
      [
        {
          fundraiser: fundraiserId,
          donor: donorId || undefined,
          amount,
          tipAmount,
          totalAmount,
          currency: normalizedCurrency,
          paymentMethod,
          paymentStatus,
          isAnonymous,
          donorName,
          donorEmail,
          transactionId,
        },
      ],
      { session }
    );

    // Update fundraiser's currentAmount and donationCount only if completed
    if (paymentStatus === 'completed') {
      await Fundraiser.findByIdAndUpdate(
        fundraiserId,
        {
          $inc: {
            currentAmount: amount,
            donationCount: 1,
          },
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    // Create activity for logged-in users (non-anonymous donations)
    if (donorId && !isAnonymous && paymentStatus === 'completed') {
      try {
        await createActivity({
          userId: donorId,
          type: 'DONATION',
          fundraiserId,
          donationAmount: amount,
          donationCurrency: normalizedCurrency,
          isPublic: true,
        });
      } catch (activityError) {
        // Log error but don't fail the donation
        // eslint-disable-next-line no-console
        console.error('Failed to create donation activity:', activityError);
      }
    }

    // Create and send coupon for completed donations
    if (paymentStatus === 'completed') {
      try {
        await CouponService.createCoupon({
          donationId: donation._id.toString(),
          fundraiserId,
          userId: donorId,
          donorEmail,
          donorName,
          donationAmount: amount,
          currency: normalizedCurrency,
          fundraiserTitle: fundraiser.title,
        });
      } catch (couponError) {
        // Log error but don't fail the donation
        // eslint-disable-next-line no-console
        console.error('Failed to create coupon:', couponError);
      }
    }

    return donation;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const DonationService = {
  createDonation,
  createDonationFromStripe,
  getDonationsByFundraiser,
  getTopDonations,
  getMyDonations,
  getMyImpactStats,
  getAllDonations,
  getDonationStats,
  deleteDonation,
};
