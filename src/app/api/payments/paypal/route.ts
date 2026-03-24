// src/app/api/payments/paypal/route.ts
import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';

const PAYPAL_BASE_URL = PAYPAL_MODE === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';

async function getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token;
}

interface CreateOrderRequest {
    amount: number;
    orderId: string;
    description: string;
    customerEmail?: string;
}

interface CaptureOrderRequest {
    orderId: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateOrderRequest = await request.json();
        const { amount, orderId, description, customerEmail } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Amount is required and must be greater than 0' },
                { status: 400 }
            );
        }

        const accessToken = await getAccessToken();

        const orderData = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    reference_id: orderId,
                    description: description || `Pedido Foodie #${orderId}`,
                    amount: {
                        currency_code: 'BRL',
                        value: amount.toFixed(2),
                    },
                },
            ],
            application_context: {
                brand_name: 'Foodie App',
                user_action: 'PAY_NOW',
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/${orderId}`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
            },
        };

        const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(orderData),
        });

        const orderResult = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: orderResult.message || 'Failed to create order' },
                { status: 400 }
            );
        }

        const approveLink = orderResult.links?.find(
            (link: any) => link.rel === 'approve'
        );

        return NextResponse.json({
            id: orderResult.id,
            status: orderResult.status,
            approveUrl: approveLink?.href,
            links: orderResult.links,
        });
    } catch (error) {
        console.error('PayPal create order error:', error);
        return NextResponse.json(
            { error: 'Failed to create PayPal order' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body: CaptureOrderRequest = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        const accessToken = await getAccessToken();

        const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const captureResult = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: captureResult.message || 'Failed to capture payment' },
                { status: 400 }
            );
        }

        const purchaseUnit = captureResult.purchase_units?.[0];
        const payments = purchaseUnit?.payments?.captures?.[0];

        return NextResponse.json({
            id: captureResult.id,
            status: captureResult.status,
            transactionId: payments?.id,
            amount: payments?.amount?.value,
            currency: payments?.amount?.currency_code,
            finalCapture: captureResult.final_capture,
            createTime: captureResult.create_time,
            updateTime: captureResult.update_time,
        });
    } catch (error) {
        console.error('PayPal capture error:', error);
        return NextResponse.json(
            { error: 'Failed to capture PayPal payment' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    if (!orderId) {
        return NextResponse.json(
            { error: 'Order ID is required' },
            { status: 400 }
        );
    }

    try {
        const accessToken = await getAccessToken();

        const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const orderResult = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: orderResult.message || 'Failed to get order' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            id: orderResult.id,
            status: orderResult.status,
            intent: orderResult.intent,
            purchaseUnits: orderResult.purchase_units,
        });
    } catch (error) {
        console.error('PayPal get order error:', error);
        return NextResponse.json(
            { error: 'Failed to get PayPal order' },
            { status: 500 }
        );
    }
}
