// src/app/api/payments/intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-04-30.basil',
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, email, currency = 'brl', metadata = {} } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Amount is required and must be greater than 0' },
                { status: 400 }
            );
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            receipt_email: email,
            metadata: {
                ...metadata,
                platform: 'foodie-app',
            },
            payment_method_options: {
                card: {
                    request_three_d_secure: 'automatic',
                },
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json(
            { error: 'Failed to create payment intent' },
            { status: 500 }
        );
    }
}
