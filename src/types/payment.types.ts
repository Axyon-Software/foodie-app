// src/types/payment.types.ts
export type DigitalPaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX';

export interface CardDetails {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
    saveCard: boolean;
}

export interface PixPaymentDetails {
    qrCode: string;
    pixKey: string;
    expiresAt: string;
    amount: number;
}

export interface SavedCard {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    isDefault: boolean;
}

export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
}

export interface PaymentState {
    method: DigitalPaymentMethod | null;
    cardDetails: CardDetails | null;
    selectedCardId: string | null;
    pixDetails: PixPaymentDetails | null;
    isProcessing: boolean;
    error: string | null;
}

export interface StripePaymentRequest {
    amount: number;
    currency: string;
    customerId?: string;
    email?: string;
    metadata?: Record<string, string>;
}
