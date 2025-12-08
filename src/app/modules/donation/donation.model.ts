import { Schema, model } from 'mongoose';
import { IDonation } from './donation.interface';

const donationSchema = new Schema<IDonation>(
  {
    fundraiser: {
      type: Schema.Types.ObjectId,
      ref: 'Fundraiser',
      required: true,
      index: true,
    },
    donor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    tipAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank', 'mobile'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    donorName: {
      type: String,
      required: true,
      trim: true,
    },
    donorEmail: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

donationSchema.index({ fundraiser: 1, createdAt: -1 });
donationSchema.index({ donor: 1, createdAt: -1 });

export const Donation = model<IDonation>('Donation', donationSchema);
