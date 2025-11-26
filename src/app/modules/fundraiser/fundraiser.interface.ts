import { Document, Types } from 'mongoose';

export type TFundraiserStatus = 'draft' | 'published';

export interface IFundraiser extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  title: string;
  slug: string;
  status: TFundraiserStatus;
  coverImage?: string;
  gallery?: string[];
  goalAmount?: number;
  currentAmount: number;
  currency?: string;
  category?: string;
  story?: string;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFundraiserCreateRequest {
  title: string;
  coverImage?: string;
  gallery?: string[];
  goalAmount?: number;
  currency?: string;
  category?: string;
  story?: string;
}

export interface IFundraiserUpdateRequest {
  title?: string;
  coverImage?: string;
  gallery?: string[];
  goalAmount?: number;
  currency?: string;
  category?: string;
  story?: string;
}
