import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../auth/auth.interface';
import { DonationService } from '../donation/donation.service';
import { StripeService } from './stripe.service';

/**
 * Create a payment intent for donation
 */
const createPaymentIntent = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const donorId = req.user?.userId;
    const {
      amount,
      tipAmount,
      currency,
      fundraiserId,
      fundraiserTitle,
      donorEmail,
      donorName,
      isAnonymous,
    } = req.body;

    const result = await StripeService.createPaymentIntent({
      amount,
      tipAmount,
      currency,
      fundraiserId,
      fundraiserTitle,
      donorEmail,
      donorName,
      isAnonymous,
      donorId,
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Payment intent created successfully',
      data: result,
    });
  }
);

/**
 * Handle Stripe webhooks
 */
const handleWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    res.status(400).send('Missing stripe-signature header');
    return;
  }

  try {
    // req.body should be raw buffer for webhook verification
    const event = StripeService.constructWebhookEvent(
      req.body as Buffer,
      signature
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }
      default:
        // Unhandled event type - log for debugging
        break;
    }

    res.json({ received: true });
  } catch {
    res.status(400).send('Webhook error');
  }
};

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata;

  // Create the donation record
  await DonationService.createDonationFromStripe({
    fundraiserId: metadata.fundraiserId,
    amount: parseFloat(metadata.donationAmount),
    tipAmount: parseFloat(metadata.tipAmount),
    currency: paymentIntent.currency.toUpperCase(),
    paymentMethod: 'card',
    isAnonymous: metadata.isAnonymous === 'true',
    donorName: metadata.donorName,
    donorEmail: metadata.donorEmail,
    transactionId: paymentIntent.id,
    paymentStatus: 'completed',
    donorId: metadata.donorId || undefined,
  });
}

/**
 * Handle failed payment - placeholder for future implementation
 */

async function handlePaymentFailure(_paymentIntent: Stripe.PaymentIntent) {
  // Optionally log failed payment attempts or notify user
}

/**
 * Confirm payment and create donation record
 * Called by client after successful Stripe payment
 */
const confirmPaymentAndCreateDonation = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { paymentIntentId } = req.body;
    const donorId = req.user?.userId;

    if (!paymentIntentId) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'Payment intent ID is required',
        data: null,
      });
      return;
    }

    // Retrieve the payment intent from Stripe to verify it succeeded
    const paymentIntent = await StripeService.getPaymentIntent(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: `Payment not completed. Status: ${paymentIntent.status}`,
        data: null,
      });
      return;
    }

    const metadata = paymentIntent.metadata;

    // Create the donation record
    const donation = await DonationService.createDonationFromStripe({
      fundraiserId: metadata.fundraiserId,
      amount: parseFloat(metadata.donationAmount),
      tipAmount: parseFloat(metadata.tipAmount || '0'),
      currency: paymentIntent.currency.toUpperCase(),
      paymentMethod: 'card',
      isAnonymous: metadata.isAnonymous === 'true',
      donorName: metadata.donorName,
      donorEmail: metadata.donorEmail,
      transactionId: paymentIntent.id,
      paymentStatus: 'completed',
      donorId: donorId || metadata.donorId || undefined,
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Donation recorded successfully',
      data: donation,
    });
  }
);

export const StripeController = {
  createPaymentIntent,
  handleWebhook,
  confirmPaymentAndCreateDonation,
};
