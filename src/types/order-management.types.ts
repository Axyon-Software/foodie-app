// src/types/order-management.types.ts
export type OrderStatus = 
    | 'PENDING'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY'
    | 'PICKED_UP'
    | 'DELIVERING'
    | 'DELIVERED'
    | 'CANCELLED';

export interface OrderItem {
    id: string;
    menuItemId: string;
    menuItemName: string;
    menuItemImage?: string;
    menuItemPrice: number;
    quantity: number;
    observation?: string;
    variations?: OrderItemVariation[];
    addons?: OrderItemAddon[];
}

export interface OrderItemVariation {
    name: string;
    option: string;
    price: number;
}

export interface OrderItemAddon {
    name: string;
    price: number;
}

export interface OrderAddress {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    instructions?: string;
}

export type PaymentMethod = 
    | 'CREDIT_CARD'
    | 'DEBIT_CARD'
    | 'PIX'
    | 'CASH'
    | 'BOLETO';

export type PaymentGateway = 
    | 'STRIPE'
    | 'MERCADOPAGO'
    | 'PAYPAL'
    | 'PAGSEGURO';

export interface Order {
    id: string;
    userId: string;
    restaurantId: string;
    restaurantName: string;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod;
    paymentGateway?: PaymentGateway;
    transactionId?: string;
    changeFor?: number;
    address: OrderAddress;
    couponCode?: string;
    observation?: string;
    estimatedDelivery?: string;
    preparedAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderTimeline {
    status: OrderStatus;
    timestamp: string;
    note?: string;
}

export interface OrderReview {
    id: string;
    orderId: string;
    rating: number;
    comment?: string;
    photos?: string[];
    response?: string;
    respondedAt?: string;
    createdAt: string;
}

export interface CreateOrderRequest {
    restaurantId: string;
    restaurantName: string;
    items: {
        menuItemId: string;
        menuItemName: string;
        menuItemImage?: string;
        menuItemPrice: number;
        quantity: number;
        observation?: string;
        variations?: { name: string; option: string; price: number }[];
        addons?: { name: string; price: number }[];
    }[];
    address: OrderAddress;
    paymentMethod: PaymentMethod;
    changeFor?: number;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    couponCode?: string;
    observation?: string;
}

export interface UpdateOrderStatusRequest {
    status: OrderStatus;
    note?: string;
}

export interface OrderFilters {
    status?: OrderStatus[];
    dateFrom?: string;
    dateTo?: string;
    minValue?: number;
    maxValue?: number;
    search?: string;
}

export interface OrderStats {
    totalOrders: number;
    pendingOrders: number;
    preparingOrders: number;
    readyOrders: number;
    deliveringOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    averagePreparationTime: number;
}

export const ORDER_STATUS_PROGRESS: OrderStatus[] = [
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'PICKED_UP',
    'DELIVERING',
    'DELIVERED',
];

export const STATUS_CONFIG: Record<OrderStatus, {
    label: string;
    color: string;
    bgColor: string;
    icon: string;
    description: string;
    nextStatus?: OrderStatus;
    actionLabel?: string;
}> = {
    PENDING: {
        label: 'Pendente',
        color: '#FFAA00',
        bgColor: 'rgba(255, 170, 0, 0.15)',
        icon: '⏳',
        description: 'Aguardando confirmação do restaurante',
        nextStatus: 'CONFIRMED',
        actionLabel: 'Confirmar',
    },
    CONFIRMED: {
        label: 'Confirmado',
        color: '#00A082',
        bgColor: 'rgba(0, 160, 130, 0.15)',
        icon: '✅',
        description: 'Pedido confirmado, entrando em preparação',
        nextStatus: 'PREPARING',
        actionLabel: 'Iniciar Preparo',
    },
    PREPARING: {
        label: 'Preparando',
        color: '#FF6B35',
        bgColor: 'rgba(255, 107, 53, 0.15)',
        icon: '👨‍🍳',
        description: 'Seu pedido está sendo preparado',
        nextStatus: 'READY',
        actionLabel: 'Marcar Pronto',
    },
    READY: {
        label: 'Pronto',
        color: '#00A082',
        bgColor: 'rgba(0, 160, 130, 0.15)',
        icon: '📦',
        description: 'Pedido pronto para retirada/entrega',
        nextStatus: 'PICKED_UP',
        actionLabel: 'Saiu para Entrega',
    },
    PICKED_UP: {
        label: 'Saiu para Entrega',
        color: '#4A90D9',
        bgColor: 'rgba(74, 144, 217, 0.15)',
        icon: '🏍️',
        description: 'Entregador a caminho',
        nextStatus: 'DELIVERING',
    },
    DELIVERING: {
        label: 'A caminho',
        color: '#4A90D9',
        bgColor: 'rgba(74, 144, 217, 0.15)',
        icon: '🛵',
        description: 'Entregador a caminho',
        nextStatus: 'DELIVERED',
        actionLabel: 'Confirmar Entrega',
    },
    DELIVERED: {
        label: 'Entregue',
        color: '#00A082',
        bgColor: 'rgba(0, 160, 130, 0.15)',
        icon: '✅',
        description: 'Pedido entregue com sucesso',
    },
    CANCELLED: {
        label: 'Cancelado',
        color: '#FF4444',
        bgColor: 'rgba(255, 68, 68, 0.15)',
        icon: '❌',
        description: 'Pedido cancelado',
    },
};

export const CANCELLATION_REASONS = [
    'Cliente solicitou cancelamento',
    'Restaurante fechado',
    'Produto indisponível',
    'Tempo de entrega muito longo',
    'Erro no pagamento',
    'Endereço inválido',
    'Outro motivo',
];
