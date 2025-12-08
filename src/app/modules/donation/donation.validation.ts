import { z } from 'zod';

export const createDonationValidation = z.object({
  body: z.object({
    fundraiserId: z.string({ required_error: 'Fundraiser ID is required' }),
    amount: z
      .number({ required_error: 'Amount is required' })
      .min(1, 'Minimum donation is $1'),
    tipAmount: z.number().min(0).optional().default(0),
    currency: z.string().optional().default('USD'),
    paymentMethod: z.enum(['card', 'bank', 'mobile'], {
      required_error: 'Payment method is required',
    }),
    isAnonymous: z.boolean().optional().default(false),
    donorName: z.string({ required_error: 'Donor name is required' }).min(1),
    donorEmail: z.string({ required_error: 'Donor email is required' }).email(),
    message: z.string().max(500).optional(),
  }),
});

export const getDonationsQueryValidation = z.object({
  params: z.object({
    fundraiserId: z.string(),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const getTopDonationsQueryValidation = z.object({
  params: z.object({
    fundraiserId: z.string(),
  }),
  query: z.object({
    limit: z.string().optional(),
  }),
});

export const getMyDonationsQueryValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
