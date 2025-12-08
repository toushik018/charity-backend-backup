import { Router } from 'express';
import auth from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { ActivityController } from './activity.controller';
import {
  createActivityValidation,
  getFundraiserActivitiesValidation,
  getMyActivitiesValidation,
  getUserActivitiesValidation,
} from './activity.validation';

const router = Router();

// Create activity (authenticated)
router.post(
  '/',
  auth('admin', 'user'),
  validateRequest(createActivityValidation),
  ActivityController.create
);

// Get my activities (authenticated)
router.get(
  '/me',
  auth('admin', 'user'),
  validateRequest(getMyActivitiesValidation),
  ActivityController.getMyActivities
);

// Get user activities (public)
router.get(
  '/user/:userId',
  validateRequest(getUserActivitiesValidation),
  ActivityController.getUserActivities
);

// Get fundraiser activities (public)
router.get(
  '/fundraiser/:fundraiserId',
  validateRequest(getFundraiserActivitiesValidation),
  ActivityController.getFundraiserActivities
);

export const ActivityRoute = router;
