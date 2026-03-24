// src/lib/utils/stripe.ts
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
    if (!stripePromise) {
        const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!key) {
            console.warn('Stripe publishable key not configured');
            return Promise.resolve(null);
        }
        stripePromise = loadStripe(key);
    }
    return stripePromise;
};

export const formatAmountForStripe = (amount: number): number => {
    return Math.round(amount * 100);
};

export const formatAmountFromStripe = (amount: number): number => {
    return amount / 100;
};
