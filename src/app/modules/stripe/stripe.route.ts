import { Router } from 'express';
import { optionalAuth } from '../../middlewares/auth';
import { StripeController } from './stripe.controller';

const router = Router();

// Create payment intent (optional auth - guests can donate)
router.post(
  '/create-payment-intent',
  optionalAuth,
  StripeController.createPaymentIntent
);

// Stripe webhook - NOTE: This route needs raw body parser
// The webhook route is registered separately in app.ts with express.raw()
router.post('/webhook', StripeController.handleWebhook);

export const StripeRoute = router;
