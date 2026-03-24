// src/types/index.ts
// ============================================
// RESTAURANT TYPES
// ============================================

export interface Restaurant {
    id: string;
    name: string;
    image: string;
    rating: number;
    reviewCount?: number;
    deliveryTime: string;
    deliveryFee: number;
    category: string;
    promoted?: boolean;
    isOpen?: boolean;
    address?: string;
    description?: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
}

// ============================================
// MENU TYPES
// ============================================

export interface MenuItem {
    id: string;
    restaurantId: string;
    name: string;
    description: string | null | undefined;
    price: number;
    image: string | null;
    category: string;
    popular?: boolean;
    available?: boolean;
}

export interface MenuCategory {
    name: string;
    items: MenuItem[];
}

// ============================================
// CART TYPES
// ============================================

export interface CartItem {
    menuItem: MenuItem;
    quantity: number;
    observation?: string;
}

export interface CartState {
    items: CartItem[];
    restaurantId: string | null;
}

export interface CartSummary {
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    itemCount: number;
}

// ============================================
// ORDER TYPES (Fase 2)
// ============================================

export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY'
    | 'PICKED_UP'
    | 'DELIVERING'
    | 'DELIVERED'
    | 'CANCELLED';

export interface Order {
    id: string;
    customerId: string;
    restaurantId: string;
    status: OrderStatus;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    deliveryAddress: Address;
    paymentMethod: PaymentMethod;
    createdAt: Date | string;
    updatedAt: Date | string;
    estimatedDelivery?: string;
}

// ============================================
// USER TYPES (Fase 3)
// ============================================

export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatar?: string;
}

export interface Address {
    id: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault?: boolean;
    label?: string; // "Casa", "Trabalho", etc.
}

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CASH';

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ============================================
// FILTER TYPES
// ============================================

export interface RestaurantFilters {
    category?: string;
    search?: string;
    minRating?: number;
    maxDeliveryFee?: number;
    freeDeliveryOnly?: boolean;
    sortBy?: 'relevance' | 'rating' | 'deliveryTime' | 'deliveryFee';
}

// Re-export de tipos específicos
export * from './menu.types';
export * from './cart.types';
export * from './checkout.types';