// src/types/payment.types.ts
export type PaymentGateway = 'STRIPE' | 'MERCADOPAGO' | 'PAYPAL' | 'PAGSEGURO';

export type PaymentMethod = 
    | 'CREDIT_CARD' 
    | 'DEBIT_CARD' 
    | 'PIX' 
    | 'CASH'
    | 'BOLETO';

export interface CardDetails {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
    saveCard: boolean;
    cardBrand?: CardBrand;
}

export type CardBrand = 'VISA' | 'MASTERCARD' | 'ELO' | 'AMEX' | 'HIPERCARD' | 'UNKNOWN';

export interface PixPaymentDetails {
    qrCode: string;
    pixKey: string;
    expiresAt: string;
    amount: number;
    transactionId: string;
}

export interface BoletoPaymentDetails {
    id: string;
    barcode: string;
    digitableLine: string;
    url: string;
    expiresAt: string;
    amount: number;
}

export interface SavedCard {
    id: string;
    brand: CardBrand;
    last4: string;
    expMonth: number;
    expYear: number;
    isDefault: boolean;
    gateway: PaymentGateway;
    token?: string;
}

export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    gateway: PaymentGateway;
}

export interface PaymentState {
    method: PaymentMethod | null;
    gateway: PaymentGateway | null;
    cardDetails: CardDetails | null;
    selectedCardId: string | null;
    pixDetails: PixPaymentDetails | null;
    boletoDetails: BoletoPaymentDetails | null;
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

export interface MercadoPagoPaymentRequest {
    transaction_amount: number;
    description: string;
    payment_method_id: 'pix' | 'credit_card' | 'debit_card' | 'bolbradesco';
    payer: {
        email: string;
        first_name?: string;
        last_name?: string;
        identification?: {
            type: 'CPF' | 'CNPJ';
            number: string;
        };
    };
    external_reference: string;
}

export interface MercadoPagoResponse {
    id: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    status_detail: string;
    payment_method_id: string;
    transaction_details: {
        financial_institution?: string;
        net_received_amount: number;
        total_paid_amount: number;
    };
    point_of_interaction?: {
        transaction_data?: {
            qr_code?: string;
            qr_code_base64?: string;
            ticket_url?: string;
        };
    };
}

export interface PayPalPaymentRequest {
    intent: 'CAPTURE';
    purchase_units: {
        reference_id: string;
        description: string;
        amount: {
            currency_code: string;
            value: string;
        };
    }[];
    application_context?: {
        brand_name?: string;
        landing_page?: 'BILLING' | 'LOGIN';
        user_action?: 'PAY_NOW' | 'CONTINUE';
    };
}

export interface PayPalPaymentResponse {
    id: string;
    status: string;
    links: {
        href: string;
        rel: string;
        method: string;
    }[];
}

export interface ReceiptData {
    id: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
    items: ReceiptItem[];
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod;
    paymentGateway?: PaymentGateway;
    transactionId?: string;
    address: ReceiptAddress;
    restaurantName: string;
    restaurantCNPJ?: string;
    issuedAt: string;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
}

export interface ReceiptItem {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    observation?: string;
}

export interface ReceiptAddress {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface GatewayConfig {
    stripe: {
        publishableKey: string;
        secretKey: string;
    };
    mercadopago: {
        accessToken: string;
        publicKey: string;
    };
    paypal: {
        clientId: string;
        clientSecret: string;
        mode: 'sandbox' | 'live';
    };
    pagseguro: {
        email: string;
        token: string;
        mode: 'sandbox' | 'live';
    };
}

export interface PaymentProcessingResult {
    success: boolean;
    transactionId?: string;
    receipt?: ReceiptData;
    error?: string;
    redirectUrl?: string;
}
