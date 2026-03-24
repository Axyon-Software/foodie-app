// src/actions/payments.ts
'use server';

import { PixPaymentDetails, PaymentIntentResponse } from '@/types/payment.types';

export async function createPaymentIntent(
    amount: number,
    email?: string
): Promise<{ data?: PaymentIntentResponse; error?: string }> {
    try {
        const response = await fetch('/api/payments/intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount,
                email,
                currency: 'brl',
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || 'Failed to create payment intent' };
        }

        return { data };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return { error: 'Erro ao processar pagamento. Tente novamente.' };
    }
}

export async function createPixPayment(
    amount: number,
    orderId: string,
    customerEmail?: string
): Promise<{ data?: PixPaymentDetails; error?: string }> {
    try {
        const response = await fetch('/api/payments/pix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount,
                orderId,
                customerEmail,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || 'Failed to generate Pix payment' };
        }

        return { data };
    } catch (error) {
        console.error('Error generating Pix payment:', error);
        return { error: 'Erro ao gerar pagamento Pix. Tente novamente.' };
    }
}
