// src/app/(admin)/admin/orders/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
    ShoppingBag, ChevronLeft, Clock, Printer, CheckCircle,
    AlertCircle, XCircle, Truck, ChefHat, Package,
    Bell, Filter, Calendar, DollarSign, User, MapPin,
    CreditCard, Banknote, Smartphone, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getRestaurantOrders, updateOrderStatus, getOrderStats } from '@/actions/order-management';
import { Order, OrderStatus, STATUS_CONFIG, ORDER_STATUS_PROGRESS, OrderFilters, OrderStats, CANCELLATION_REASONS } from '@/types/order-management.types';
import { formatPrice } from '@/lib/utils/format.utils';

type TabType = 'all' | 'pending' | 'preparing' | 'ready' | 'delivering' | 'completed';

export default function AdminOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<OrderStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [filters, setFilters] = useState<OrderFilters>({});
    const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');

    const loadOrders = useCallback(async () => {
        const result = await getRestaurantOrders(filters);
        if (result.data) {
            setOrders(result.data);
        }
        const statsResult = await getOrderStats();
        if (statsResult.data) {
            setStats(statsResult.data);
        }
        setIsLoading(false);
    }, [filters]);

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 15000);
        return () => clearInterval(interval);
    }, [loadOrders]);

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        if (activeTab === 'pending') return order.status === 'PENDING';
        if (activeTab === 'preparing') return order.status === 'PREPARING';
        if (activeTab === 'ready') return ['READY', 'PICKED_UP'].includes(order.status);
        if (activeTab === 'delivering') return order.status === 'DELIVERING';
        if (activeTab === 'completed') return ['DELIVERED', 'CANCELLED'].includes(order.status);
        return true;
    });

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        const result = await updateOrderStatus(orderId, { status: newStatus });
        if (result.success) {
            toast.success(`Status atualizado: ${STATUS_CONFIG[newStatus].label}`);
            loadOrders();
        } else {
            toast.error(result.error || 'Erro ao atualizar');
        }
    };

    const handleCancel = async (orderId: string) => {
        if (!cancelReason) {
            toast.error('Selecione um motivo');
            return;
        }
        const result = await updateOrderStatus(orderId, { status: 'CANCELLED', note: cancelReason });
        if (result.success) {
            toast.success('Pedido cancelado');
            setShowCancelModal(null);
            setCancelReason('');
            loadOrders();
        } else {
            toast.error(result.error || 'Erro ao cancelar');
        }
    };

    const handlePrint = (order: Order) => {
        const printContent = `
========================================
         ${order.restaurantName}
========================================
Nº PEDIDO: #${order.id.substring(0, 8)}
Data: ${new Date(order.createdAt).toLocaleString('pt-BR')}

----------------------------------------
ITENS
${order.items.map(item => `${item.quantity}x ${item.menuItemName}\n   R$ ${(item.menuItemPrice * item.quantity).toFixed(2)}${item.observation ? `\n   Obs: ${item.observation}` : ''}`).join('\n')}
----------------------------------------
SUBTOTAL:   R$ ${order.subtotal.toFixed(2)}
FRETE:      R$ ${order.deliveryFee.toFixed(2)}
TOTAL:      R$ ${order.total.toFixed(2)}

FORMA DE PAGAMENTO: ${order.paymentMethod}
${order.changeFor ? `TROCO PARA: R$ ${order.changeFor.toFixed(2)}` : ''}

----------------------------------------
ENDEREÇO DE ENTREGA
${order.address.street}, ${order.address.number}
${order.address.complement || ''}
${order.address.neighborhood} - ${order.address.city}/${order.address.state}
========================================
        `.trim();

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html><head><title>Pedido #${order.id.substring(0, 8)}</title></head>
                <body style="font-family: monospace; white-space: pre-wrap; padding: 20px; font-size: 14px;">${printContent}</body></html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const getPaymentIcon = (method: string) => {
        switch (method) {
            case 'CREDIT_CARD': case 'DEBIT_CARD': return <CreditCard size={14} />;
            case 'PIX': return <Smartphone size={14} />;
            case 'CASH': return <Banknote size={14} />;
            default: return <CreditCard size={14} />;
        }
    };

    const getStatusBadge = (status: OrderStatus) => {
        const config = STATUS_CONFIG[status];
        return (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1" style={{ backgroundColor: config.bgColor, color: config.color }}>
                {config.icon} {config.label}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A082]"></div>
            </div>
        );
    }

    const pendingCount = orders.filter(o => o.status === 'PENDING').length;

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg)' }}>
            {/* Header */}
            <div className="p-4 border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 -ml-2">
                            <ChevronLeft size={20} style={{ color: 'var(--color-text)' }} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-[#00A082]/10 flex items-center justify-center relative">
                            <ShoppingBag size={20} className="text-[#00A082]" />
                            {pendingCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                    {pendingCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Pedidos</h1>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{orders.length} pedidos</p>
                        </div>
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        <Filter size={18} style={{ color: 'var(--color-text-secondary)' }} />
                    </button>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="p-2 rounded-xl text-center" style={{ backgroundColor: '#FEF3C7' }}>
                            <span className="text-lg font-bold" style={{ color: '#D97706' }}>{stats.pendingOrders}</span>
                            <p className="text-[10px]" style={{ color: '#D97706' }}>Pendentes</p>
                        </div>
                        <div className="p-2 rounded-xl text-center" style={{ backgroundColor: '#FFEDD5' }}>
                            <span className="text-lg font-bold" style={{ color: '#EA580C' }}>{stats.preparingOrders}</span>
                            <p className="text-[10px]" style={{ color: '#EA580C' }}>Preparando</p>
                        </div>
                        <div className="p-2 rounded-xl text-center" style={{ backgroundColor: '#D1FAE5' }}>
                            <span className="text-lg font-bold" style={{ color: '#059669' }}>{stats.completedOrders}</span>
                            <p className="text-[10px]" style={{ color: '#059669' }}>Concluídos</p>
                        </div>
                        <div className="p-2 rounded-xl text-center" style={{ backgroundColor: '#E0E7FF' }}>
                            <span className="text-lg font-bold" style={{ color: '#4F46E5' }}>{formatPrice(stats.totalRevenue)}</span>
                            <p className="text-[10px]" style={{ color: '#4F46E5' }}>Receita</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {(['all', 'pending', 'preparing', 'ready', 'delivering', 'completed'] as TabType[]).map(tab => {
                        const tabLabels: Record<TabType, string> = { all: 'Todos', pending: 'Novos', preparing: 'Preparando', ready: 'Prontos', delivering: 'Entregando', completed: 'Finalizados' };
                        const count = tab === 'all' ? orders.length : filteredOrders.filter(o => {
                            if (tab === 'pending') return o.status === 'PENDING';
                            if (tab === 'preparing') return o.status === 'PREPARING';
                            if (tab === 'ready') return ['READY', 'PICKED_UP'].includes(o.status);
                            if (tab === 'delivering') return o.status === 'DELIVERING';
                            if (tab === 'completed') return ['DELIVERED', 'CANCELLED'].includes(o.status);
                            return false;
                        }).length;

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === tab ? 'bg-[#00A082] text-white' : ''}`}
                                style={{ backgroundColor: activeTab === tab ? '#00A082' : 'var(--color-bg-secondary)', color: activeTab === tab ? 'white' : 'var(--color-text-secondary)' }}
                            >
                                {tabLabels[tab]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Orders List */}
            <div className="p-4 space-y-3">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
                        <p style={{ color: 'var(--color-text-secondary)' }}>Nenhum pedido encontrado</p>
                    </div>
                ) : (
                    filteredOrders.map((order, index) => {
                        const statusConfig = STATUS_CONFIG[order.status];
                        const isExpanded = expandedOrder === order.id;
                        const nextStatus = statusConfig.nextStatus;

                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="rounded-2xl overflow-hidden"
                                style={{ backgroundColor: 'var(--color-bg-card)', borderLeft: `4px solid ${statusConfig.color}` }}
                            >
                                {/* Header */}
                                <div className="p-4 cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold" style={{ color: 'var(--color-text)' }}>#{order.id.substring(0, 8)}</span>
                                            {getStatusBadge(order.status)}
                                            {order.status === 'PENDING' && <span className="animate-pulse w-2 h-2 rounded-full bg-red-500" />}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{formatPrice(order.total)}</span>
                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                        <span className="flex items-center gap-1"><Clock size={14} />{new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className="flex items-center gap-1"><User size={14} />{order.items.reduce((sum, i) => sum + i.quantity, 0)} itens</span>
                                        <span className="flex items-center gap-1">{getPaymentIcon(order.paymentMethod)}{order.paymentMethod}</span>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="p-4 pt-0 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                        {/* Items */}
                                        <div className="py-3">
                                            <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>ITENS</h4>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between py-1">
                                                    <span style={{ color: 'var(--color-text)' }}>{item.quantity}x {item.menuItemName}</span>
                                                    <span style={{ color: 'var(--color-text)' }}>{formatPrice(item.menuItemPrice * item.quantity)}</span>
                                                </div>
                                            ))}
                                            {order.observation && (
                                                <p className="text-xs mt-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>Obs: {order.observation}</p>
                                            )}
                                        </div>

                                        {/* Address */}
                                        <div className="py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                            <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>ENTREGA</h4>
                                            <div className="flex items-start gap-2">
                                                <MapPin size={14} className="text-[#00A082] mt-0.5" />
                                                <div>
                                                    <p className="text-sm" style={{ color: 'var(--color-text)' }}>{order.address.street}, {order.address.number}</p>
                                                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{order.address.neighborhood} - {order.address.city}/{order.address.state}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                            {nextStatus && order.status !== 'CANCELLED' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, nextStatus)}
                                                    className="flex-1 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 text-white"
                                                    style={{ backgroundColor: '#00A082' }}
                                                >
                                                    <CheckCircle size={16} />
                                                    {statusConfig.actionLabel}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handlePrint(order)}
                                                className="px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2"
                                                style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                                            >
                                                <Printer size={16} />
                                            </button>
                                            {!['DELIVERED', 'CANCELLED'].includes(order.status) && (
                                                <button
                                                    onClick={() => setShowCancelModal(order.id)}
                                                    className="px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2"
                                                    style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-4"
                        style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                        <h3 className="font-bold mb-4" style={{ color: 'var(--color-text)' }}>Cancelar Pedido</h3>
                        <div className="space-y-2 mb-4">
                            {CANCELLATION_REASONS.map(reason => (
                                <button
                                    key={reason}
                                    onClick={() => setCancelReason(reason)}
                                    className={`w-full text-left p-3 rounded-xl border-2 ${cancelReason === reason ? 'border-red-500' : ''}`}
                                    style={{ borderColor: cancelReason === reason ? '#DC2626' : 'var(--color-border)' }}
                                >
                                    <span style={{ color: 'var(--color-text)' }}>{reason}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setShowCancelModal(null); setCancelReason(''); }} className="flex-1 py-3 rounded-xl font-medium" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>Voltar</button>
                            <button onClick={() => handleCancel(showCancelModal)} className="flex-1 py-3 rounded-xl font-medium bg-red-500 text-white">Confirmar</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}