import { Schema, model } from 'mongoose';
import { IFundraiser } from './fundraiser.interface';

const fundraiserSchema = new Schema<IFundraiser>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    coverImage: { type: String, trim: true },
    gallery: { type: [String], default: [] },
    goalAmount: { type: Number, min: 0 },
    currentAmount: { type: Number, default: 0, min: 0 },
    currency: { type: String, trim: true, default: 'EUR' },
    category: { type: String, trim: true },
    story: { type: String, trim: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true },
    country: { type: String, trim: true },
    donationCount: { type: Number, default: 0, min: 0 },
    zipCode: { type: String, trim: true },
    beneficiaryType: {
      type: String,
      enum: ['yourself', 'someone_else', 'charity'],
    },
    nonprofit: {
      type: {
        id: { type: String, trim: true },
        name: { type: String, trim: true },
        logo: { type: String, trim: true },
        category: { type: String, trim: true },
        location: { type: String, trim: true },
        ein: { type: String, trim: true },
        verified: { type: Boolean, default: false },
      },
      default: null,
    },
    automatedGoal: { type: Boolean, default: true },
    longTermNeed: { type: String, enum: ['YES', 'NO'] },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

fundraiserSchema.index({ owner: 1, status: 1, updatedAt: -1 });

export const Fundraiser = model<IFundraiser>('Fundraiser', fundraiserSchema);
