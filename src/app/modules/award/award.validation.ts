import { z } from 'zod';

import { zObjectId, zOptionalLimit, zOptionalPage } from '../../utils/zod';

export const announceAwardValidation = z.object({
  body: z.object({
    couponId: zObjectId({
      requiredError: 'couponId is required',
      invalidMessage: 'couponId must be a valid ObjectId',
    }),
    selectedAt: z
      .string()
      .datetime({ message: 'selectedAt must be a valid ISO date string' })
      .optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const getAdminAwardsQueryValidation = z.object({
  query: z.object({
    page: zOptionalPage(),
    limit: zOptionalLimit(),
    fundraiserId: zObjectId().optional(),
    fromDate: z
      .string()
      .datetime({ message: 'fromDate must be a valid ISO date string' })
      .optional(),
    toDate: z
      .string()
      .datetime({ message: 'toDate must be a valid ISO date string' })
      .optional(),
  }),
});

export const getAwardByIdValidation = z.object({
  params: z.object({
    awardId: zObjectId({
      requiredError: 'awardId is required',
      invalidMessage: 'awardId must be a valid ObjectId',
    }),
  }),
});
