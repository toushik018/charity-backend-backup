import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import AppError from '../../error/AppError';
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
    currency = 'USD',
    paymentMethod,
    isAnonymous = false,
    donorName,
    donorEmail,
    message,
  } = payload;

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
          currency,
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

export const DonationService = {
  createDonation,
  getDonationsByFundraiser,
  getTopDonations,
  getMyDonations,
};
