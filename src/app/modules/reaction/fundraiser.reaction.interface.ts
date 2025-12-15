/**
 * @fileoverview Fundraiser reaction module type definitions.
 *
 * Defines TypeScript interfaces and types for the reaction module,
 * including reaction types and document schemas.
 *
 * @module modules/reaction/interface
 */

import { Document, Types } from 'mongoose';

/* -------------------------------------------------------------------------- */
/*                              REACTION TYPES                                */
/* -------------------------------------------------------------------------- */

/**
 * Reaction type enum values.
 *
 * Represents the emotional reactions users can give to fundraisers.
 */
export type TReactionType =
  | 'SENDING_LOVE'
  | 'SYMPATHIES'
  | 'HOPE'
  | 'CARE'
  | 'SUPPORTING_YOU'
  | 'INSPIRING';

/**
 * Array of valid reaction types for validation.
 */
export const REACTION_TYPES: TReactionType[] = [
  'SENDING_LOVE',
  'SYMPATHIES',
  'HOPE',
  'CARE',
  'SUPPORTING_YOU',
  'INSPIRING',
];

/* -------------------------------------------------------------------------- */
/*                              DOCUMENT INTERFACE                            */
/* -------------------------------------------------------------------------- */

/**
 * Fundraiser reaction document interface.
 *
 * Represents a user's emotional reaction to a fundraiser.
 * Each user can have only one reaction per fundraiser.
 *
 * @extends Document
 */
export interface IFundraiserReaction extends Document {
  /**
   * Unique identifier.
   */
  _id: Types.ObjectId;

  /**
   * Reference to the fundraiser being reacted to.
   */
  fundraiser: Types.ObjectId;

  /**
   * Reference to the user who reacted.
   */
  user: Types.ObjectId;

  /**
   * Type of reaction.
   */
  type: TReactionType;

  /**
   * Creation timestamp.
   */
  createdAt: Date;

  /**
   * Last update timestamp.
   */
  updatedAt: Date;
}
