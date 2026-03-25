// src/types/checkout.types.ts
import { PaymentMethod, Address, CartItem } from './index';

export interface CheckoutState {
    address: Address | null;
    paymentMethod: PaymentMethod | null;
    changeFor?: number;
}

export interface CheckoutOrderData {
    id: string;
    items: CartItem[];
    address: Address;
    paymentMethod: PaymentMethod;
    changeFor?: number;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    restaurantId: string;
    restaurantName: string;
    status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERING' | 'DELIVERED';
    createdAt: string;
    estimatedDelivery: string;
}

/** @deprecated Use CheckoutOrderData instead */
export type OrderData = CheckoutOrderData;