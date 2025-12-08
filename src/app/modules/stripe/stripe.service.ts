import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import config from '../../config';
import AppError from '../../error/AppError';

// Initialize Stripe with secret key
const stripe = new Stripe(config.stripe.secret_key || '');

export interface CreatePaymentIntentPayload {
  amount: number; // in dollars
  tipAmount?: number;
  currency?: string;
  fundraiserId: string;
  fundraiserTitle: string;
  donorEmail: string;
  donorName: string;
  isAnonymous?: boolean;
  donorId?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  tipAmount: number;
  totalAmount: number;
}

/**
 * Create a Stripe Payment Intent for a donation
 */
const createPaymentIntent = async (
  payload: CreatePaymentIntentPayload
): Promise<PaymentIntentResponse> => {
  const {
    amount,
    tipAmount = 0,
    currency = 'usd',
    fundraiserId,
    fundraiserTitle,
    donorEmail,
    donorName,
    isAnonymous = false,
    donorId,
  } = payload;

  if (!config.stripe.secret_key) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Stripe is not configured'
    );
  }

  const totalAmount = amount + tipAmount;
  // Stripe expects amount in cents
  const amountInCents = Math.round(totalAmount * 100);

  if (amountInCents < 50) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Minimum donation amount is $0.50'
    );
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        fundraiserId,
        fundraiserTitle,
        donorEmail,
        donorName,
        isAnonymous: String(isAnonymous),
        donorId: donorId || '',
        donationAmount: String(amount),
        tipAmount: String(tipAmount),
      },
      receipt_email: donorEmail,
      description: `Donation to "${fundraiserTitle}"`,
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      amount,
      tipAmount,
      totalAmount,
    };
  } catch (error) {
    const stripeError = error as Stripe.errors.StripeError;
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      stripeError.message || 'Failed to create payment intent'
    );
  }
};

/**
 * Retrieve a Payment Intent by ID
 */
const getPaymentIntent = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch {
    throw new AppError(StatusCodes.NOT_FOUND, 'Payment intent not found');
  }
};

/**
 * Construct and verify Stripe webhook event
 */
const constructWebhookEvent = (
  payload: Buffer,
  signature: string
): Stripe.Event => {
  if (!config.stripe.webhook_secret) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Stripe webhook secret is not configured'
    );
  }

  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe.webhook_secret
    );
  } catch (error) {
    const stripeError = error as Stripe.errors.StripeError;
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Webhook signature verification failed: ${stripeError.message}`
    );
  }
};

export const StripeService = {
  createPaymentIntent,
  getPaymentIntent,
  constructWebhookEvent,
  stripe, // Export stripe instance for webhook handling
};
