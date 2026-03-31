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

export interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
      PREPARING: { label: 'Preparando', color: 'bg-orange-100 text-orange-800' },
      READY: { label: 'Pronto', color: 'bg-green-100 text-green-800' },
      DELIVERED: { label: 'Entregue', color: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case 'DINE_IN':
        return { label: 'Mesa', value: order.tableNumber || '-' };
      case 'DELIVERY':
        return { label: 'Delivery', value: '-' };
      case 'TAKEOUT':
        return { label: 'Retirada', value: '-' };
      default:
        return { label: type, value: '-' };
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const orderTypeInfo = getOrderTypeLabel(order.orderType);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-800">
                  Pedido #{String(order.id).slice(-4).toUpperCase()}
                </h2>
                {getStatusBadge(order.status)}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cliente</p>
                <p className="font-semibold text-gray-800">{order.customerName}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tipo</p>
                <p className="font-semibold text-gray-800">{orderTypeInfo.label}</p>
                {orderTypeInfo.value !== '-' && (
                  <p className="text-sm text-gray-600">{orderTypeInfo.value}</p>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Horário</p>
                <p className="font-semibold text-gray-800">{formatDateTime(order.createdAt)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tempo</p>
                <OrderTimer startTime={order.createdAt} />
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Itens do Pedido
              </h3>
              <div className="space-y-2">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: OrderItem, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                          {item.quantity || 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-800">{item.name || item.productName || 'Item'}</p>
                          {item.observations && (
                            <p className="text-xs text-gray-500">{item.observations}</p>
                          )}
                          {item.addons && item.addons.length > 0 && (
                            <p className="text-xs text-gray-400">
                              Adicionais: {item.addons.map((addon) => addon.name).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      {item.price && (
                        <p className="font-medium text-gray-700">
                          {formatCurrency(item.price * (item.quantity || 1))}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhum item encontrado</p>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
