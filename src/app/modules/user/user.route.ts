import { Router } from 'express';
import auth from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import {
  createUserValidation,
  getUserByIdParamValidation,
  getUsersQueryValidation,
  updateHighlightsValidation,
  updateMeValidation,
  updateUserValidation,
} from './user.validation';

const router = Router();

router.get(
  '/',
  auth('admin'),
  validateRequest(getUsersQueryValidation),
  UserController.getAllUsers
);

router.get(
  '/admin/:userId/details',
  auth('admin'),
  validateRequest(getUserByIdParamValidation),
  UserController.getAdminUserDetails
);
// Admin create user
router.post(
  '/',
  auth('admin'),
  validateRequest(createUserValidation),
  UserController.createUser
);
// Allow authenticated users to update their own basic fields (name, profile)
router.patch(
  '/me',
  auth('admin', 'user'),
  validateRequest(updateMeValidation),
  UserController.updateMe
);
router.patch(
  '/me/highlights',
  auth('admin', 'user'),
  validateRequest(updateHighlightsValidation),
  UserController.updateMyHighlights
);
router.get('/discover', auth('admin', 'user'), UserController.discoverUsers);
router.get('/browse', auth('admin', 'user'), UserController.browseUsers);

// Public profile - no auth required
router.get(
  '/:userId/public',
  validateRequest(getUserByIdParamValidation),
  UserController.getPublicProfile
);

router.get(
  '/:userId',
  auth('admin', 'user'),
  validateRequest(getUserByIdParamValidation),
  UserController.getSingleUser
);
router.patch(
  '/:userId',
  auth('admin'),
  validateRequest(updateUserValidation),
  UserController.updateUser
);
router.delete(
  '/:userId',
  auth('admin'),
  validateRequest(getUserByIdParamValidation),
  UserController.deleteUser
);

router.post(
  '/:userId/follow',
  auth('admin', 'user'),
  validateRequest(getUserByIdParamValidation),
  UserController.followUser
);

router.post(
  '/:userId/unfollow',
  auth('admin', 'user'),
  validateRequest(getUserByIdParamValidation),
  UserController.unfollowUser
);

router.get(
  '/:userId/followers',
  validateRequest(getUserByIdParamValidation),
  UserController.getFollowers
);

router.get(
  '/:userId/following',
  validateRequest(getUserByIdParamValidation),
  UserController.getFollowing
);

export const UserRoutes = router;
