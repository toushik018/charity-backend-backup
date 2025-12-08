import { z } from 'zod';
import { ACTIVITY_TYPES } from './activity.constant';

export const createActivityValidation = z.object({
  body: z.object({
    type: z.enum([
      ACTIVITY_TYPES.DONATION,
      ACTIVITY_TYPES.REACTION,
      ACTIVITY_TYPES.FUNDRAISER_CREATED,
      ACTIVITY_TYPES.SHARE,
    ]),
    fundraiserId: z.string().min(1, 'Fundraiser ID is required'),
    donationAmount: z.number().positive().optional(),
    donationCurrency: z.string().optional(),
    reactionType: z.string().optional(),
    isPublic: z.boolean().optional(),
  }),
});

export const getUserActivitiesValidation = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const getMyActivitiesValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const getFundraiserActivitiesValidation = z.object({
  params: z.object({
    fundraiserId: z.string().min(1, 'Fundraiser ID is required'),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
