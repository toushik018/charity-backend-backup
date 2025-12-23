import { model, Schema } from 'mongoose';
import { IAward } from './award.interface';

const awardSchema = new Schema<IAward>(
  {
    coupon: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
      unique: true,
      index: true,
    },
    donation: {
      type: Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      index: true,
    },
    fundraiser: {
      type: Schema.Types.ObjectId,
      ref: 'Fundraiser',
      required: true,
      index: true,
    },
    donor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    couponCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    donorName: {
      type: String,
      required: true,
      trim: true,
    },
    donorEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    donationAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: 'EUR',
    },
    selectedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    announcedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    announcedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

awardSchema.index({ announcedAt: -1 });
awardSchema.index({ fundraiser: 1, announcedAt: -1 });

export const Award = model<IAward>('Award', awardSchema);
