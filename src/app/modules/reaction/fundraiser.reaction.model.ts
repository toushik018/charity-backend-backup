import { Schema, model } from 'mongoose';
import { IFundraiserReaction } from './fundraiser.reaction.interface';

const fundraiserReactionSchema = new Schema<IFundraiserReaction>(
  {
    fundraiser: {
      type: Schema.Types.ObjectId,
      ref: 'Fundraiser',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'SENDING_LOVE',
        'SYMPATHIES',
        'HOPE',
        'CARE',
        'SUPPORTING_YOU',
        'INSPIRING',
      ],
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// One reaction per user per fundraiser
fundraiserReactionSchema.index({ fundraiser: 1, user: 1 }, { unique: true });

// Useful indexes for feeds and summaries
fundraiserReactionSchema.index({ user: 1, createdAt: -1 });
fundraiserReactionSchema.index({ fundraiser: 1, type: 1 });

export const FundraiserReaction = model<IFundraiserReaction>(
  'Reaction',
  fundraiserReactionSchema
);
