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
    searchTerm: z.string().trim().max(200).optional(),
    emailStatus: z.enum(['sent', 'pending']).optional(),
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

/**
 * Validation for fundraiser donors endpoint.
 * Requires a valid fundraiserId in params.
 */
export const getFundraiserDonorsValidation = z.object({
  params: z.object({
    fundraiserId: zObjectId({
      requiredError: 'fundraiserId is required',
      invalidMessage: 'fundraiserId must be a valid ObjectId',
    }),
  }),
});

/**
 * Validation for weighted winner selection endpoint.
 * Requires a valid fundraiserId in params.
 */
export const selectWeightedWinnerValidation = z.object({
  params: z.object({
    fundraiserId: zObjectId({
      requiredError: 'fundraiserId is required',
      invalidMessage: 'fundraiserId must be a valid ObjectId',
    }),
  }),
});

export const deleteAwardValidation = z.object({
  params: z.object({
    awardId: zObjectId({
      requiredError: 'awardId is required',
      invalidMessage: 'awardId must be a valid ObjectId',
    }),
  }),
});

export const bulkDeleteAwardsValidation = z.object({
  body: z
    .object({
      awardIds: z.array(zObjectId()).min(1).optional(),
      deleteAll: z.boolean().optional(),
      filters: z
        .object({
          fundraiserId: zObjectId().optional(),
          emailStatus: z.enum(['sent', 'pending']).optional(),
          searchTerm: z.string().trim().max(200).optional(),
          fromDate: z
            .string()
            .datetime({ message: 'fromDate must be a valid ISO date string' })
            .optional(),
          toDate: z
            .string()
            .datetime({ message: 'toDate must be a valid ISO date string' })
            .optional(),
        })
        .optional(),
    })
    .refine(
      (data) => (data.awardIds && data.awardIds.length > 0) || data.deleteAll,
      {
        message: 'Provide awardIds to delete or set deleteAll to true.',
        path: ['awardIds'],
      }
    ),
});
