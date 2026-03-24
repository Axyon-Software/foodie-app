// src/app/api/payments/pix/route.ts
import { NextRequest, NextResponse } from 'next/server';

const FEATURE_ENABLED = process.env.ENABLE_PIX_AUTO === 'true';
const PIX_KEY = process.env.PIX_KEY || 'foodie@email.com';
const PIX_KEY_TYPE = process.env.PIX_KEY_TYPE || 'email';

// ✅ NÃO INICIALIZAR STRIPE NO TOPO DO ARQUIVO
// Só importar quando realmente necessário

interface PixPayload {
    key: string;
    keyType: string;
    amount: number;
    description?: string;
}

function generatePixCode(payload: PixPayload): string {
    const { key, keyType, amount, description } = payload;

    const formatValue = (id: string, value: string | number): string => {
        const valueStr = String(value);
        const len = valueStr.length;
        const lenStr = len.toString().padStart(2, '0');
        return `${id}${lenStr}${valueStr}`;
    };

    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0];

    const merchantAccount = formatValue('00', '01') + formatValue('11', PIX_KEY_TYPE === 'email' ? '02' : '01') + formatValue('12', PIX_KEY);
    const merchantCategory = formatValue('26', '0000');
    const currency = formatValue('44', '986');
    const amountField = formatValue('54', amount.toFixed(2));
    const countryCode = formatValue('58', 'BR');
    const txId = formatValue('62', '***') + formatValue('05', timestamp);

    const descriptionField = description
        ? formatValue('69', description.substring(0, 99))
        : formatValue('69', 'Foodie App Pedido');

    const gui = formatValue('00', 'BR.GOV.BCB.PIX');
    const payloadFormat = formatValue('01', '01');
    const merchantName = formatValue('59', 'Foodie App');
    const merchantCity = formatValue('60', 'SAO PAULO');

    const payloadString =
        gui +
        payloadFormat +
        merchantAccount +
        merchantCategory +
        merchantName +
        merchantCity +
        currency +
        amountField +
        countryCode +
        txId +
        descriptionField;

    const crc16 = (data: string): string => {
        let crc = 0xFFFF;
        for (let i = 0; i < data.length; i++) {
            crc ^= data.charCodeAt(i);
            for (let j = 0; j < 8; j++) {
                crc = (crc >>> 1) ^ (crc & 1 ? 0xA001 : 0);
            }
        }
        return (crc ^ 0x0000).toString(16).toUpperCase().padStart(4, '0');
    };

    return payloadString + '6304' + crc16(payloadString + '6304');
}

export async function POST(request: NextRequest) {
    if (!FEATURE_ENABLED) {
        return NextResponse.json(
            {
                error: 'Automatic PIX is not enabled yet',
                message: 'Please use manual PIX payment for now. Automatic PIX will be available in v5.0.'
            },
            { status: 503 }
        );
    }

    try {
        const body = await request.json();
        const { amount, orderId, customerEmail } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Amount is required and must be greater than 0' },
                { status: 400 }
            );
        }

        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        const pixPayload: PixPayload = {
            key: PIX_KEY,
            keyType: PIX_KEY_TYPE,
            amount,
            description: `Pedido Foodie #${orderId}`,
        };

        const qrCode = generatePixCode(pixPayload);

        // ✅ SÓ IMPORTAR STRIPE SE REALMENTE FOR USAR
        if (process.env.STRIPE_SECRET_KEY) {
            try {
                const Stripe = (await import('stripe')).default;
                const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
                    apiVersion: '2026-02-25.clover',
                });

                await stripe.paymentIntents.create({
                    amount: Math.round(amount * 100),
                    currency: 'brl',
                    payment_method_types: ['card'],
                    receipt_email: customerEmail,
                    metadata: {
                        orderId,
                        paymentType: 'pix',
                    },
                    description: `Pedido Foodie #${orderId}`,
                });
            } catch (stripeError) {
                console.log('Stripe Pix not configured, using fallback');
            }
        }

        return NextResponse.json({
            qrCode,
            pixKey: PIX_KEY,
            keyType: PIX_KEY_TYPE,
            amount,
            expiresAt: expiresAt.toISOString(),
            instructions: [
                'Abra o app do seu banco',
                'Escolha pagar via Pix',
                'Escaneie o QR Code ou copie a chave',
                'O pagamento será confirmado automaticamente',
            ],
        });
    } catch (error) {
        console.error('Error generating Pix payment:', error);
        return NextResponse.json(
            { error: 'Failed to generate Pix payment' },
            { status: 500 }
        );
    }
}