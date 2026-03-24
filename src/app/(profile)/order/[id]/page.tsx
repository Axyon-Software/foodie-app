// src/app/(profile)/order/[id]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    Clock, ChevronLeft, MapPin, Phone, Receipt, Star,
    CreditCard, Banknote, Smartphone, CheckCircle, AlertCircle,
    Printer, Share2, MessageCircle, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { getOrderById, getOrderTimeline, cancelOrder, getOrderReview } from '@/actions/order-management';
import { Order, OrderTimeline, STATUS_CONFIG, ORDER_STATUS_PROGRESS, CANCELLATION_REASONS } from '@/types/order-management.types';
import { formatPrice } from '@/lib/utils/format.utils';

export default function OrderTrackingPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [timeline, setTimeline] = useState<OrderTimeline[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [hasReview, setHasReview] = useState(false);

    const loadOrder = useCallback(async () => {
        const result = await getOrderById(orderId);
        if (result.data) {
            setOrder(result.data);
            const timelineResult = await getOrderTimeline(orderId);
            if (timelineResult.data) {
                setTimeline(timelineResult.data);
            }
            const reviewResult = await getOrderReview(orderId);
            setHasReview(!!reviewResult.data);
        }
        setIsLoading(false);
    }, [orderId]);

    useEffect(() => {
        loadOrder();
        const interval = setInterval(loadOrder, 15000);
        return () => clearInterval(interval);
    }, [loadOrder]);

    const handleCancel = async () => {
        if (!cancelReason) {
            toast.error('Selecione um motivo');
            return;
        }
        const result = await cancelOrder(orderId, cancelReason);
        if (result.success) {
            toast.success('Pedido cancelado');
            loadOrder();
            setShowCancelModal(false);
        } else {
            toast.error(result.error || 'Erro ao cancelar');
        }
    };

    const handleShare = async () => {
        const text = `Acompanhe meu pedido: ${window.location.href}`;
        if (navigator.share) {
            await navigator.share({ title: 'Acompanhar Pedido', url: window.location.href });
        } else {
            await navigator.clipboard.writeText(text);
            toast.success('Link copiado!');
        }
    };

    const getPaymentIcon = (method: string) => {
        switch (method) {
            case 'CREDIT_CARD': case 'DEBIT_CARD': return <CreditCard size={16} />;
            case 'PIX': return <Smartphone size={16} />;
            case 'CASH': return <Banknote size={16} />;
            default: return <CreditCard size={16} />;
        }
    };

    const getPaymentLabel = (method: string) => {
        switch (method) {
            case 'CREDIT_CARD': return 'Cartão de Crédito';
            case 'DEBIT_CARD': return 'Cartão de Débito';
            case 'PIX': return 'Pix';
            case 'CASH': return 'Dinheiro';
            case 'BOLETO': return 'Boleto';
            default: return method;
        }
    };

    const isCancellable = order && !['DELIVERED', 'CANCELLED', 'DELIVERING'].includes(order.status);

    const getStatusProgress = () => {
        if (!order) return 0;
        if (order.status === 'CANCELLED') return 0;
        const index = ORDER_STATUS_PROGRESS.indexOf(order.status);
        return ((index + 1) / ORDER_STATUS_PROGRESS.length) * 100;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A082]"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ backgroundColor: 'var(--color-bg)' }}>
                <AlertCircle size={64} className="text-gray-300 mb-4" />
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Pedido não encontrado</h2>
                <button onClick={() => router.push('/orders')} className="text-[#00A082] font-medium">Ver meus pedidos</button>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[order.status];

    return (
        <div className="min-h-screen pb-32" style={{ backgroundColor: 'var(--color-bg)' }}>
            {/* Header */}
            <div className="p-4 border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2">
                        <ChevronLeft size={20} style={{ color: 'var(--color-text)' }} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>#{order.id.substring(0, 8)}</h1>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{order.restaurantName}</p>
                    </div>
                    <button onClick={handleShare} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        <Share2 size={18} style={{ color: 'var(--color-text-secondary)' }} />
                    </button>
                </div>
            </div>

            {/* Status Card */}
            <div className="p-4">
                <div className="p-5 rounded-2xl" style={{ backgroundColor: statusConfig.bgColor }}>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: statusConfig.color }}>
                            {statusConfig.icon}
                        </div>
                        <div className="flex-1">
                            <span className="font-bold text-lg" style={{ color: statusConfig.color }}>{statusConfig.label}</span>
                            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{statusConfig.description}</p>
                        </div>
                    </div>
                    {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                        <div className="mt-4">
                            <div className="h-2 rounded-full bg-white/30">
                                <motion.div
                                    className="h-2 rounded-full"
                                    style={{ backgroundColor: statusConfig.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${getStatusProgress()}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                <span>Confirmado</span>
                                <span>Preparando</span>
                                <span>Entregando</span>
                                <span>Entregue</span>
                            </div>
                        </div>
                    )}
                    {order.estimatedDelivery && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/20">
                            <Clock size={16} style={{ color: statusConfig.color }} />
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                Previsão: {new Date(order.estimatedDelivery).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Steps */}
            <div className="px-4 pb-4">
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>PROGRESSO</h3>
                    <div className="space-y-4">
                        {ORDER_STATUS_PROGRESS.filter(s => s !== 'PICKED_UP').map((status, index) => {
                            const config = STATUS_CONFIG[status];
                            const currentIndex = ORDER_STATUS_PROGRESS.indexOf(order.status);
                            const isPast = index <= currentIndex;
                            const isCurrent = status === order.status;
                            const timelineEntry = timeline.find(t => t.status === status);

                            return (
                                <div key={status} className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPast ? 'bg-[#00A082]' : 'bg-gray-200'}`}>
                                        {isPast ? (
                                            <CheckCircle size={16} className="text-white" />
                                        ) : (
                                            <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>{index + 1}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-medium ${isPast ? 'text-[#00A082]' : ''}`} style={{ color: isPast ? undefined : 'var(--color-text-tertiary)' }}>
                                                {config.label}
                                            </span>
                                            {isCurrent && (
                                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#00A082] text-white">ATUAL</span>
                                            )}
                                        </div>
                                        {timelineEntry && (
                                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                                {new Date(timelineEntry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="px-4 pb-4">
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>ITENS</h3>
                    <div className="space-y-3">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                                <div>
                                    <span style={{ color: 'var(--color-text)' }}>{item.quantity}x {item.menuItemName}</span>
                                    {item.observation && <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Obs: {item.observation}</p>}
                                </div>
                                <span className="font-medium" style={{ color: 'var(--color-text)' }}>{formatPrice(item.menuItemPrice * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="flex justify-between text-sm">
                            <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                            <span style={{ color: 'var(--color-text)' }}>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span style={{ color: 'var(--color-text-secondary)' }}>Frete</span>
                            <span style={{ color: 'var(--color-text)' }}>{formatPrice(order.deliveryFee)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Desconto</span>
                                <span>-{formatPrice(order.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                            <span>Total</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment & Address */}
            <div className="px-4 pb-4 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <h3 className="font-semibold mb-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>PAGAMENTO</h3>
                    <div className="flex items-center gap-2">
                        {getPaymentIcon(order.paymentMethod)}
                        <span className="text-sm" style={{ color: 'var(--color-text)' }}>{getPaymentLabel(order.paymentMethod)}</span>
                    </div>
                    {order.changeFor && (
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Troco: {formatPrice(order.changeFor)}</p>
                    )}
                </div>
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <h3 className="font-semibold mb-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>ENTREGA</h3>
                    <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-[#00A082] mt-0.5" />
                        <div>
                            <p className="text-sm" style={{ color: 'var(--color-text)' }}>{order.address.street}, {order.address.number}</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{order.address.neighborhood}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4">
                <div className="flex gap-3">
                    {order.status === 'DELIVERED' && !hasReview && (
                        <button
                            onClick={() => router.push(`/order/${orderId}/review`)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium"
                            style={{ backgroundColor: 'var(--color-bg-card)', color: '#00A082' }}
                        >
                            <Star size={18} />
                            Avaliar
                        </button>
                    )}
                    <button
                        onClick={() => router.push(`/order/${orderId}/receipt`)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium"
                        style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text)' }}
                    >
                        <Receipt size={18} />
                        Recibo
                    </button>
                    {isCancellable && (
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium"
                            style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                        >
                            Cancelar
                        </button>
                    )}
                </div>
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
                        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>Selecione o motivo do cancelamento:</p>
                        <div className="space-y-2 mb-4">
                            {CANCELLATION_REASONS.map(reason => (
                                <button
                                    key={reason}
                                    onClick={() => setCancelReason(reason)}
                                    className={`w-full text-left p-3 rounded-xl border-2 ${cancelReason === reason ? 'border-[#00A082]' : ''}`}
                                    style={{ borderColor: cancelReason === reason ? '#00A082' : 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}
                                >
                                    <span style={{ color: 'var(--color-text)' }}>{reason}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 rounded-xl font-medium" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>Voltar</button>
                            <button onClick={handleCancel} className="flex-1 py-3 rounded-xl font-medium bg-red-500 text-white">Confirmar Cancelamento</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}