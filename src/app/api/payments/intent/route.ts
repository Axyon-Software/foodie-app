// src/app/api/payments/intent/route.ts
import { NextRequest, NextResponse } from 'next/server';

const FEATURE_ENABLED = process.env.ENABLE_STRIPE_PAYMENTS === 'true';

export async function POST(request: NextRequest) {
    if (!FEATURE_ENABLED) {
        return NextResponse.json(
            {
                error: 'Stripe payments are not enabled yet',
                message: 'This feature will be available in v5.0'
            },
            { status: 503 }
        );
    }

    // ✅ SÓ IMPORTAR STRIPE SE HABILITADO
    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json(
            { error: 'Stripe not configured' },
            { status: 500 }
        );
    }

    try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2026-02-25.clover',
        });

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