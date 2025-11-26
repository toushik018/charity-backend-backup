import { Router } from 'express';
import { AuthRoute } from '../app/modules/auth/auth.route';
import { FundraiserRoute } from '../app/modules/fundraiser/fundraiser.route';
import { UploadRoute } from '../app/modules/upload/upload.route';
import { UserRoutes } from '../app/modules/user/user.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoute,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/upload',
    route: UploadRoute,
  },
  {
    path: '/fundraisers',
    route: FundraiserRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
