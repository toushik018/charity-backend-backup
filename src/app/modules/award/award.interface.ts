import { Document, Types } from 'mongoose';

export interface IAward extends Document {
  coupon: Types.ObjectId;
  donation: Types.ObjectId;
  fundraiser: Types.ObjectId;
  donor?: Types.ObjectId;
  couponCode: string;
  donorName: string;
  donorEmail: string;
  donationAmount: number;
  currency: string;
  selectedAt: Date;
  announcedAt: Date;
  announcedBy: Types.ObjectId;
  notes?: string;
  emailSent: boolean;
  emailSentAt?: Date;
}

export interface IAnnounceAwardPayload {
  couponId: string;
  selectedAt?: Date;
  notes?: string;
  announcedBy: string;
}
