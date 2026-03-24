// src/app/api/payments/boleto/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface BoletoRequest {
    amount: number;
    customerName: string;
    customerDocument: string;
    customerEmail: string;
    orderId: string;
    description: string;
    dueDate?: string;
}

function generateBoletoBarcode(
    bankCode: string,
    currency: string,
    amount: number,
    dueDate: Date,
    documentNumber: string
): string {
    const formatDate = (date: Date): string => {
        const baseDate = new Date('1997-10-07');
        const diffTime = date.getTime() - baseDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays.toString().padStart(5, '0');
    };

    const formatAmount = (value: number): string => {
        return Math.round(value * 100).toString().padStart(10, '0');
    };

    const bank = bankCode.padStart(3, '0');
    const currencyCode = currency === 'BRL' ? '9' : '0';
    const dateFactor = formatDate(dueDate);
    const amountStr = formatAmount(amount);
    const document = documentNumber.replace(/\D/g, '').padStart(15, '0');

    const part1 = bank + currencyCode + dateFactor + amountStr;
    const part2 = document.substring(0, 5) + '0'
    const part3 = document.substring(5, 10) + '0'
    const part4 = document.substring(10, 15) + '0'
    
    const calcDv1 = (num: string): number => {
        let sum = 0;
        let weight = 2;
        for (let i = num.length - 1; i >= 0; i--) {
            sum += parseInt(num[i]) * weight;
            weight = weight === 9 ? 2 : weight + 1;
        }
        const dv = 11 - (sum % 11);
        return dv >= 10 ? 1 : dv;
    };

    const dv1 = calcDv1(part1).toString();
    const dv2 = calcDv1(part2).toString();
    const dv3 = calcDv1(part3).toString();
    const dv4 = calcDv1(part4).toString();

    return `${part1}${dv1}${part2}${dv2}${part3}${dv3}${part4}${dv4}`;
}

function generateDigitableLine(barcode: string): string {
    const fields = [
        barcode.substring(0, 4) + barcode.substring(19, 24),
        barcode.substring(24, 34),
        barcode.substring(34, 44),
        barcode.substring(44, 49),
        barcode.substring(49, 54) + barcode.substring(54, 55)
    ];
    
    return fields.join(' ');
}

function generateBoletoId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BOL${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
    try {
        const body: BoletoRequest = await request.json();
        const { amount, customerName, customerDocument, customerEmail, orderId, description, dueDate } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Amount is required and must be greater than 0' },
                { status: 400 }
            );
        }

        if (!customerName || !customerDocument) {
            return NextResponse.json(
                { error: 'Customer name and document are required' },
                { status: 400 }
            );
        }

        const dueDateObj = dueDate ? new Date(dueDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        
        if (dueDateObj <= new Date()) {
            return NextResponse.json(
                { error: 'Due date must be in the future' },
                { status: 400 }
            );
        }

        const formattedDueDate = dueDateObj.toISOString().split('T')[0];
        
        const bankCode = '001';
        const currency = 'BRL';
        const documentNumber = orderId + Date.now().toString().slice(-6);

        const barcode = generateBoletoBarcode(
            bankCode,
            currency,
            amount,
            dueDateObj,
            documentNumber
        );

        const digitableLine = generateDigitableLine(barcode);
        const boletoId = generateBoletoId();

        const boletoUrl = `https://www.boletobancario.com.br/boleto/${boletoId}`;

        const boletoData = {
            id: boletoId,
            bankCode,
            amount: amount.toFixed(2),
            dueDate: formattedDueDate,
            barcode,
            digitableLine,
            url: boletoUrl,
            customer: {
                name: customerName,
                document: customerDocument.replace(/\D/g, ''),
                email: customerEmail,
            },
            description: description || `Pedido Foodie #${orderId}`,
            instructions: [
                'Pagamento sujeito à confirmação após compensação bancária',
                'Após o vencimento, multe de 2% + juros de 1% ao mês',
                'Imprima o boleto ou use a chave PIX para pagamento',
            ],
            createdAt: new Date().toISOString(),
        };

        return NextResponse.json(boletoData);
    } catch (error) {
        console.error('Boleto generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate boleto' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const boletoId = searchParams.get('id');

    if (!boletoId) {
        return NextResponse.json(
            { error: 'Boleto ID is required' },
            { status: 400 }
        );
    }

    return NextResponse.json({
        id: boletoId,
        status: 'PENDING',
        message: 'Consulte o status do boleto na sua área de pedidos',
    });
}
