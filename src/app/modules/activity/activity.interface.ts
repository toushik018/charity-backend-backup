import { Document, Types } from 'mongoose';

export type TActivityType =
  | 'DONATION'
  | 'REACTION'
  | 'FUNDRAISER_CREATED'
  | 'SHARE';

export interface IActivity extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: TActivityType;
  fundraiser: Types.ObjectId;
  // For donations
  donationAmount?: number;
  donationCurrency?: string;
  // For reactions
  reactionType?: string;
  // Metadata
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityPopulated
  extends Omit<IActivity, 'user' | 'fundraiser'> {
  user: {
    _id: Types.ObjectId;
    name: string;
    profilePicture?: string;
  };
  fundraiser: {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    coverImage?: string;
  };
}
