import { Document, Types } from 'mongoose';

export type TReactionType =
  | 'SENDING_LOVE'
  | 'SYMPATHIES'
  | 'HOPE'
  | 'CARE'
  | 'SUPPORTING_YOU'
  | 'INSPIRING';

export interface IFundraiserReaction extends Document {
  _id: Types.ObjectId;
  fundraiser: Types.ObjectId;
  user: Types.ObjectId;
  type: TReactionType;
  createdAt: Date;
  updatedAt: Date;
}
