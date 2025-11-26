import { Router } from 'express';
import auth from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { FundraiserController } from './fundraiser.controller';
import {
  createFundraiserValidation,
  getBySlugParamValidation,
  getMineQueryValidation,
  publishFundraiserValidation,
  updateFundraiserValidation,
} from './fundraiser.validation';

const router = Router();

// Create a draft
router.post(
  '/drafts',
  auth('admin', 'user'),
  validateRequest(createFundraiserValidation),
  FundraiserController.createDraft
);

// Update fundraiser (draft or published fields allowed)
router.patch(
  '/:id',
  auth('admin', 'user'),
  validateRequest(updateFundraiserValidation),
  FundraiserController.updateFundraiser
);

// Publish a draft
router.post(
  '/:id/publish',
  auth('admin', 'user'),
  validateRequest(publishFundraiserValidation),
  FundraiserController.publishFundraiser
);

// Get my fundraisers (optionally filter by status)
router.get(
  '/mine',
  auth('admin', 'user'),
  validateRequest(getMineQueryValidation),
  FundraiserController.getMine
);

// Public: get fundraiser by slug (returns null for private drafts not owned)
router.get(
  '/slug/:slug',
  validateRequest(getBySlugParamValidation),
  FundraiserController.getBySlug
);

export const FundraiserRoute = router;
