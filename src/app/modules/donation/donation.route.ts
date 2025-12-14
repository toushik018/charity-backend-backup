import { Router } from 'express';
import auth, { optionalAuth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { DonationController } from './donation.controller';
import {
  createDonationValidation,
  getDonationsQueryValidation,
  getMyDonationsQueryValidation,
  getTopDonationsQueryValidation,
} from './donation.validation';

const router = Router();

// Create a donation (optional auth - guests can donate)
router.post(
  '/',
  optionalAuth,
  validateRequest(createDonationValidation),
  DonationController.createDonation
);

// Get donations for a fundraiser (public)
router.get(
  '/fundraiser/:fundraiserId',
  validateRequest(getDonationsQueryValidation),
  DonationController.getDonationsByFundraiser
);

// Get top donations for a fundraiser (public)
router.get(
  '/fundraiser/:fundraiserId/top',
  validateRequest(getTopDonationsQueryValidation),
  DonationController.getTopDonations
);

// Get my donations (authenticated)
router.get(
  '/mine',
  auth('admin', 'user'),
  validateRequest(getMyDonationsQueryValidation),
  DonationController.getMyDonations
);

// Get my impact stats (authenticated)
router.get(
  '/impact',
  auth('admin', 'user'),
  DonationController.getMyImpactStats
);

// Admin: Get all donations
router.get('/admin/all', auth('admin'), DonationController.getAllDonations);

// Admin: Get donation stats
router.get('/admin/stats', auth('admin'), DonationController.getDonationStats);

// Admin: Get donation by id
router.get(
  '/admin/:donationId',
  auth('admin'),
  DonationController.getDonationById
);

// Admin: Delete donation
router.delete(
  '/admin/:donationId',
  auth('admin'),
  DonationController.deleteDonation
);

export const DonationRoute = router;
