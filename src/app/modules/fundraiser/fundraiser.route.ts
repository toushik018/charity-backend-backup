import { Router } from 'express';
import auth from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { FundraiserController } from './fundraiser.controller';
import {
  adminCreateFundraiserValidation,
  createFundraiserValidation,
  getByIdParamValidation,
  getBySlugParamValidation,
  getFundraisersQueryValidation,
  getMineQueryValidation,
  getPublicFundraisersQueryValidation,
  publishFundraiserValidation,
  updateFundraiserValidation,
} from './fundraiser.validation';

const router = Router();

router.get(
  '/',
  auth('admin'),
  validateRequest(getFundraisersQueryValidation),
  FundraiserController.getAll
);

router.post(
  '/owner/:ownerId',
  auth('admin'),
  validateRequest(adminCreateFundraiserValidation),
  FundraiserController.adminCreate
);

router.get(
  '/public',
  validateRequest(getPublicFundraisersQueryValidation),
  FundraiserController.getPublic
);

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

router.get(
  '/:id',
  auth('admin'),
  validateRequest(getByIdParamValidation),
  FundraiserController.adminGetById
);

router.patch(
  '/admin/:id',
  auth('admin'),
  validateRequest(updateFundraiserValidation),
  FundraiserController.adminUpdate
);

router.delete(
  '/admin/:id',
  auth('admin'),
  validateRequest(getByIdParamValidation),
  FundraiserController.adminDelete
);

export const FundraiserRoute = router;
