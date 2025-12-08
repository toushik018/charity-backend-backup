import { z } from 'zod';

export const reactToFundraiserValidation = z.object({
  params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) }),
  body: z.object({
    type: z.enum([
      'SENDING_LOVE',
      'SYMPATHIES',
      'HOPE',
      'CARE',
      'SUPPORTING_YOU',
      'INSPIRING',
    ]),
  }),
});

export const getMyReactionsQueryValidation = z.object({
  query: z.object({
    page: z
      .string()
      .transform((v) => Number(v))
      .pipe(z.number().int().min(1))
      .optional(),
    limit: z
      .string()
      .transform((v) => Number(v))
      .pipe(z.number().int().min(1).max(100))
      .optional(),
  }),
});
