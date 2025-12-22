import { Router } from 'express';

import auth from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { AwardController } from './award.controller';
import {
  announceAwardValidation,
  getAdminAwardsQueryValidation,
  getAwardByIdValidation,
} from './award.validation';

const router = Router();

router.post(
  '/admin/announce',
  auth('admin'),
  validateRequest(announceAwardValidation),
  AwardController.announceAward
);

router.get(
  '/admin/history',
  auth('admin'),
  validateRequest(getAdminAwardsQueryValidation),
  AwardController.getAdminAwards
);

router.get(
  '/admin/:awardId',
  auth('admin'),
  validateRequest(getAwardByIdValidation),
  AwardController.getAwardById
);

export const AwardRoute = router;
