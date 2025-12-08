import { Schema, model } from 'mongoose';
import { ACTIVITY_TYPES } from './activity.constant';
import { IActivity } from './activity.interface';

const activitySchema = new Schema<IActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(ACTIVITY_TYPES),
      required: true,
      index: true,
    },
    fundraiser: {
      type: Schema.Types.ObjectId,
      ref: 'Fundraiser',
      required: true,
      index: true,
    },
    donationAmount: {
      type: Number,
      min: 0,
    },
    donationCurrency: {
      type: String,
      trim: true,
      default: 'USD',
    },
    reactionType: {
      type: String,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ fundraiser: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ isPublic: 1, createdAt: -1 });

export const Activity = model<IActivity>('Activity', activitySchema);
