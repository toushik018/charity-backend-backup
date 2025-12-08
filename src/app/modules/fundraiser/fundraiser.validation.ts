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
    country: z.string().min(1).max(100).optional(),
    zipCode: z.string().min(1).max(20).optional(),
    beneficiaryType: z.enum(['yourself', 'someone_else', 'charity']).optional(),
    automatedGoal: z.boolean().optional(),
    longTermNeed: z.enum(['YES', 'NO']).optional(),
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
    country: z.string().min(1).max(100).optional(),
    zipCode: z.string().min(1).max(20).optional(),
    beneficiaryType: z.enum(['yourself', 'someone_else', 'charity']).optional(),
    automatedGoal: z.boolean().optional(),
    longTermNeed: z.enum(['YES', 'NO']).optional(),
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
  params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) }),
});

export const getFundraisersQueryValidation = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    status: z.enum(['draft', 'published']).optional(),
    owner: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    category: z.string().optional(),
    country: z.string().optional(),
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
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const getPublicFundraisersQueryValidation = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    owner: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    category: z.string().optional(),
    country: z.string().optional(),
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
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const adminCreateFundraiserValidation = z.object({
  params: z.object({
    ownerId: z
      .string({ required_error: 'ownerId is required' })
      .regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    title: z.string().min(3).max(120).optional(),
    coverImage: imageUrlSchema.optional(),
    gallery: z.array(imageUrlSchema).optional(),
    goalAmount: z.number().min(0).optional(),
    currency: z.string().min(1).max(10).optional(),
    category: z.string().min(1).max(100).optional(),
    story: z.string().max(10000).optional(),
    country: z.string().min(1).max(100).optional(),
    zipCode: z.string().min(1).max(20).optional(),
    beneficiaryType: z.enum(['yourself', 'someone_else', 'charity']).optional(),
    automatedGoal: z.boolean().optional(),
    longTermNeed: z.enum(['YES', 'NO']).optional(),
  }),
});
