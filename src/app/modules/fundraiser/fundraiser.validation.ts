import { z } from 'zod';

const imageUrlSchema = z
  .string()
  .refine(
    (v) => /^https?:\/\//.test(v) || v.startsWith('data:'),
    'Invalid image URL'
  );

export const createFundraiserValidation = z.object({
  body: z.object({
    title: z.string().min(3).max(120).optional(),
    coverImage: imageUrlSchema.optional(),
    gallery: z.array(imageUrlSchema).optional(),
    goalAmount: z.number().min(0).optional(),
    currency: z.string().min(1).max(10).optional(),
    category: z.string().min(1).max(100).optional(),
    story: z.string().max(10000).optional(),
  }),
});

export const updateFundraiserValidation = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    title: z.string().min(3).max(120).optional(),
    coverImage: imageUrlSchema.optional(),
    gallery: z.array(imageUrlSchema).optional(),
    goalAmount: z.number().min(0).optional(),
    currency: z.string().min(1).max(10).optional(),
    category: z.string().min(1).max(100).optional(),
    story: z.string().max(10000).optional(),
  }),
});

export const publishFundraiserValidation = z.object({
  params: z.object({ id: z.string() }),
});

export const getMineQueryValidation = z.object({
  query: z.object({ status: z.enum(['draft', 'published']).optional() }),
});

export const getBySlugParamValidation = z.object({
  params: z.object({ slug: z.string().min(1) }),
});

export const getByIdParamValidation = z.object({
  params: z.object({ id: z.string().min(1) }),
});
