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
  description?: string;
  location?: string;
  country?: string;
  zipCode?: string;
  beneficiaryType?: 'yourself' | 'someone_else' | 'charity';
  nonprofit?: {
    id?: string;
    name?: string;
    logo?: string;
    category?: string;
    location?: string;
    ein?: string;
    verified?: boolean;
  } | null;
  automatedGoal?: boolean;
  longTermNeed?: 'YES' | 'NO';
  donationCount?: number;
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
  description?: string;
  location?: string;
  country?: string;
  zipCode?: string;
  beneficiaryType?: 'yourself' | 'someone_else' | 'charity';
  nonprofit?: {
    id?: string;
    name?: string;
    logo?: string;
    category?: string;
    location?: string;
    ein?: string;
    verified?: boolean;
  } | null;
  automatedGoal?: boolean;
  longTermNeed?: 'YES' | 'NO';
  donationCount?: number;
  currentAmount?: number;
}

export interface IFundraiserUpdateRequest {
  title?: string;
  coverImage?: string;
  gallery?: string[];
  goalAmount?: number;
  currency?: string;
  category?: string;
  story?: string;
  country?: string;
  zipCode?: string;
  beneficiaryType?: 'yourself' | 'someone_else' | 'charity';
  nonprofit?: {
    id?: string;
    name?: string;
    logo?: string;
    category?: string;
    location?: string;
    ein?: string;
    verified?: boolean;
  } | null;
  automatedGoal?: boolean;
  longTermNeed?: 'YES' | 'NO';
}
