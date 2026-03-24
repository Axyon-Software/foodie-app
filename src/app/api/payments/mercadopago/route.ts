// src/app/api/payments/mercadopago/route.ts
import { NextRequest, NextResponse } from 'next/server';

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
const MERCADOPAGO_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.mercadopago.com' 
    : 'https://api.mercadopago.com';

interface PaymentRequest {
    amount: number;
    email: string;
    name: string;
    document?: string;
    orderId: string;
    items: { name: string; quantity: number; price: number }[];
    paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'bolbradesco';
    cardToken?: string;
    installments?: number;
}

export async function POST(request: NextRequest) {
    try {
        const body: PaymentRequest = await request.json();
        const { amount, email, name, document, orderId, items, paymentMethod, cardToken, installments } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Amount is required and must be greater than 0' },
                { status: 400 }
            );
        }

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const payerFirstName = name?.split(' ')[0] || 'Cliente';
        const payerLastName = name?.split(' ').slice(1).join(' ') || '';

        const paymentData: any = {
            transaction_amount: amount,
            description: `Pedido Foodie #${orderId}`,
            payment_method_id: paymentMethod,
            payer: {
                email,
                first_name: payerFirstName,
                last_name: payerLastName,
            },
            external_reference: orderId,
        };

        if (paymentMethod === 'pix') {
            paymentData.payment_method_id = 'pix';
            paymentData.date_of_expiration = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        }

        if ((paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && cardToken) {
            paymentData.token = cardToken;
            paymentData.installments = installments || 1;
            paymentDataissuer_id = undefined;
        }

        const response = await fetch(`${MERCADOPAGO_BASE_URL}/v1/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
            },
            body: JSON.stringify(paymentData),
        });

        const paymentResult = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { 
                    error: paymentResult.message || 'Payment failed',
                    details: paymentResult
                },
                { status: 400 }
            );
        }

        let pixData = null;
        if (paymentMethod === 'pix' && paymentResult.point_of_interaction?.transaction_data) {
            pixData = {
                qrCode: paymentResult.point_of_interaction.transaction_data.qr_code,
                qrCodeBase64: paymentResult.point_of_interaction.transaction_data.qr_code_base64,
            };
        }

        let boletoData = null;
        if (paymentMethod === 'bolbradesco' && paymentResult.barcode) {
            boletoData = {
                barcode: paymentResult.barcode,
                digitableLine: paymentResult.digitable_line,
                url: paymentResult.transaction_details?.external_resource_url,
            };
        }

        return NextResponse.json({
            id: paymentResult.id,
            status: paymentResult.status,
            statusDetail: paymentResult.status_detail,
            transactionAmount: paymentResult.transaction_amount,
            paymentMethodId: paymentResult.payment_method_id,
            dateApproved: paymentResult.date_approved,
            externalReference: paymentResult.external_reference,
            pix: pixData,
            boleto: boletoData,
        });
    } catch (error) {
        console.error('Mercado Pago error:', error);
        return NextResponse.json(
            { error: 'Failed to process payment' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('id');

    if (!paymentId) {
        return NextResponse.json(
            { error: 'Payment ID is required' },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(`${MERCADOPAGO_BASE_URL}/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
            },
        });

        const paymentResult = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: paymentResult.message || 'Failed to get payment' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            id: paymentResult.id,
            status: paymentResult.status,
            statusDetail: paymentResult.status_detail,
            transactionAmount: paymentResult.transaction_amount,
            dateApproved: paymentResult.date_approved,
        });
    } catch (error) {
        console.error('Mercado Pago error:', error);
        return NextResponse.json(
            { error: 'Failed to get payment status' },
            { status: 500 }
        );
    }
}
