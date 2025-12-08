import { z } from 'zod';

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
    userId: z
      .string({ required_error: 'userId is required' })
      .regex(/^[0-9a-fA-F]{24}$/),
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
    isActive: z
      .string()
      .transform((val) =>
        val === ''
          ? undefined
          : val === 'true'
            ? true
            : val === 'false'
              ? false
              : undefined
      )
      .optional() as unknown as z.ZodOptional<z.ZodBoolean>,
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

export const getUserByIdParamValidation = z.object({
  params: z.object({
    userId: z
      .string({ required_error: 'userId is required' })
      .regex(/^[0-9a-fA-F]{24}$/),
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
      .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid fundraiser id'))
      .max(10)
      .optional(),
  }),
});
