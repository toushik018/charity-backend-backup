import { Document, Types } from 'mongoose';

export interface IDonation extends Document {
  _id: Types.ObjectId;
  fundraiser: Types.ObjectId;
  donor?: Types.ObjectId;
  amount: number;
  tipAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: 'card' | 'bank' | 'mobile';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  isAnonymous: boolean;
  donorName: string;
  donorEmail: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TCreateDonationPayload = {
  fundraiserId: string;
  amount: number;
  tipAmount?: number;
  currency?: string;
  paymentMethod: 'card' | 'bank' | 'mobile';
  isAnonymous?: boolean;
  donorName: string;
  donorEmail: string;
  message?: string;
};
