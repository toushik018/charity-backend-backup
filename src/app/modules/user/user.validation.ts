import { z } from 'zod';
import {
  zIntFromString,
  zObjectId,
  zOptionalBooleanFromString,
} from '../../utils/zod';

export const updateUserValidation = z.object({
  body: z
    .object({
      name: z.string().min(1).optional(),
      role: z.enum(['user', 'admin']).optional(),
      isActive: z.boolean().optional(),
      profile: z
        .object({
          phone: z.string().optional(),
          address: z.string().optional(),
          avatar: z.string().url().optional(),
          socials: z
            .object({
              facebook: z.string().url().optional(),
              twitter: z.string().url().optional(),
              instagram: z.string().url().optional(),
              linkedin: z.string().url().optional(),
              website: z.string().url().optional(),
            })
            .partial()
            .optional(),
        })
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update.',
      path: [],
    }),
  params: z.object({
    userId: zObjectId({ requiredError: 'userId is required' }),
  }),
});

export const getUsersQueryValidation = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    role: z
      .string()
      .transform((val) => (val === '' ? undefined : val))
      .pipe(z.enum(['user', 'admin']).optional())
      .optional(),
    isActive: zOptionalBooleanFromString(),
    page: zIntFromString({ min: 1 }).optional(),
    limit: zIntFromString({ min: 1, max: 100 }).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const getUserByIdParamValidation = z.object({
  params: z.object({
    userId: zObjectId({ requiredError: 'userId is required' }),
  }),
});

// Validation for authenticated user updating own basic fields (no params)
export const updateMeValidation = z.object({
  body: z
    .object({
      name: z.string().min(1).optional(),
      profile: z
        .object({
          phone: z.string().optional(),
          address: z.string().optional(),
          avatar: z.string().url().optional(),
          socials: z
            .object({
              facebook: z.string().url().optional(),
              twitter: z.string().url().optional(),
              instagram: z.string().url().optional(),
              linkedin: z.string().url().optional(),
              website: z.string().url().optional(),
            })
            .partial()
            .optional(),
        })
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update.',
      path: [],
    }),
});

export const createUserValidation = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['user', 'admin']).optional(),
    isActive: z.boolean().optional(),
    profile: z
      .object({
        phone: z.string().optional(),
        address: z.string().optional(),
        avatar: z.string().url().optional(),
        socials: z
          .object({
            facebook: z.string().url().optional(),
            twitter: z.string().url().optional(),
            instagram: z.string().url().optional(),
            linkedin: z.string().url().optional(),
            website: z.string().url().optional(),
          })
          .partial()
          .optional(),
      })
      .optional(),
  }),
});

export const updateHighlightsValidation = z.object({
  body: z.object({
    fundraiserIds: z
      .array(zObjectId({ invalidMessage: 'Invalid fundraiser id' }))
      .max(10)
      .optional(),
  }),
});
