'use client';

import { Order } from '@/hooks/useKitchenOrders';
import { OrderTimer } from './OrderTimer';

interface OrderItem {
  name?: string;
  productName?: string;
  quantity?: number;
  price?: number;
  observations?: string;
  addons?: Array<{ name: string }>;
}

export interface OrderCardProps {
  order: Order;
  onAction: (action: string, orderId: string) => void;
  onClick?: () => void;
}

export function OrderCard({ order, onAction, onClick }: OrderCardProps) {
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

  const getItemsSummary = (items: OrderItem[]) => {
    if (!items || items.length === 0) return 'Sem itens';
    if (items.length === 1) return items[0].name || items[0].productName || '1 item';
    const firstItem = items[0].name || items[0].productName || 'item';
    const remaining = items.length - 1;
    return remaining > 0 ? `${firstItem} +${remaining}` : firstItem;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">
              #{String(order.id).slice(-4).toUpperCase()}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">{order.customerName}</span>
          </div>
          <OrderTimer startTime={order.createdAt} />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
            {getOrderTypeLabel(order.orderType)}
          </span>
          <span className="text-sm font-semibold text-gray-700">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>

      {/* Items Summary */}
      <div className="px-4 py-3">
        <p className="text-sm text-gray-600 line-clamp-2">
          {getItemsSummary(order.items)}
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex gap-2">
          {order.status === 'PENDING' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction('CONFIRM', order.id);
              }}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Confirmar
            </button>
          )}
          {order.status === 'CONFIRMED' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction('START_PREPARING', order.id);
              }}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar Preparo
            </button>
          )}
          {order.status === 'PREPARING' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction('MARK_READY', order.id);
              }}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Marcar Pronto
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction('VIEW_DETAILS', order.id);
            }}
            className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Ver Mais
          </button>
        </div>
      </div>
    </div>
  );
}
