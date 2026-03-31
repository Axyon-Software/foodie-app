'use client';

import { Order } from '@/hooks/useKitchenOrders';
import { OrderCard } from './OrderCard';

export interface KanbanColumnProps {
  title: string;
  status: string;
  orders: Order[];
  color: string;
  count: number;
  onAction: (action: string, orderId: string) => void;
  onOrderClick: (order: Order) => void;
}

export function KanbanColumn({
  title,
  status,
  orders,
  color,
  count,
  onAction,
  onOrderClick,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full min-w-[320px] max-w-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white rounded-t-lg border-b-2 shadow-sm" style={{ borderBottomColor: color }}>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <span
          className="px-2.5 py-0.5 text-sm font-medium rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          {count}
        </span>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 rounded-b-lg">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <svg
              className="w-12 h-12 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm">Nenhum pedido</p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAction={(action, orderId) => onAction(action, orderId)}
              onClick={() => onOrderClick(order)}
            />
          ))
        )}
      </div>
    </div>
  );
}
