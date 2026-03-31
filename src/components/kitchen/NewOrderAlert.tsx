'use client';

import { Order } from '@/hooks/useKitchenOrders';

interface OrderItem {
  name?: string;
  productName?: string;
}

export interface NewOrderAlertProps {
  order: Order;
  onDismiss: () => void;
}

export function NewOrderAlert({ order, onDismiss }: NewOrderAlertProps) {
  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case 'DINE_IN':
        return `Mesa ${order.tableNumber || ''}`;
      case 'DELIVERY':
        return 'Delivery';
      case 'TAKEOUT':
        return 'Retirada';
      default:
        return type;
    }
  };

  const getItemsList = (items: OrderItem[]) => {
    if (!items || items.length === 0) return [];
    return items.map((item) => item.name || item.productName || 'Item');
  };

  const itemsList = getItemsList(order.items);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-2xl overflow-hidden max-w-sm">
        {/* Header with bell icon */}
        <div className="px-4 py-3 bg-black/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg
                className="w-5 h-5 animate-bounce"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            </div>
            <span className="font-bold text-sm uppercase tracking-wide">Novo Pedido!</span>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">
                {order.customerName}
              </p>
              <p className="text-sm text-white/80">
                {getOrderTypeLabel(order.orderType)}
              </p>
            </div>
          </div>

          {/* Items Preview */}
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-xs text-white/70 uppercase tracking-wide mb-1">Itens:</p>
            <p className="text-sm text-white font-medium truncate">
              {itemsList.length > 0
                ? itemsList.join(', ')
                : 'Pedido sem itens especificados'}
            </p>
          </div>

          {/* Total */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-white/70">Valor Total</span>
            <span className="font-bold text-lg">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(order.total)}
            </span>
          </div>
        </div>

        {/* Decorative bottom */}
        <div className="h-1 bg-gradient-to-r from-yellow-400 to-orange-400" />
      </div>
    </div>
  );
}
