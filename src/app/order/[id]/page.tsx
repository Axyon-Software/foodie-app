// src/app/order/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    Clock,
    MapPin,
    CreditCard,
    ChefHat,
    Bike,
    Package,
    Home,
    Loader2,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils/format.utils';
import {
    getOrderById as getOrderFromDB,
    updateOrderStatus as updateOrderInDB,
    type OrderData,
} from '@/actions/orders';

const STATUS_STEPS = [
    { key: 'PENDING', label: 'Pedido recebido', icon: CheckCircle },
    { key: 'CONFIRMED', label: 'Confirmado', icon: CheckCircle },
    { key: 'PREPARING', label: 'Preparando', icon: ChefHat },
    { key: 'READY', label: 'Pronto', icon: Package },
    { key: 'DELIVERING', label: 'Saiu para entrega', icon: Bike },
    { key: 'DELIVERED', label: 'Entregue', icon: Home },
];

const PAYMENT_LABELS: Record<string, string> = {
    CREDIT_CARD: '💳 Cartão de Crédito',
    DEBIT_CARD: '💳 Cartão de Débito',
    PIX: '📱 Pix',
    CASH: '💵 Dinheiro',
};

const STATUS_PROGRESSION = [
    'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED',
];

export default function OrderPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<OrderData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [notFound, setNotFound] = useState<boolean>(false);

    // Load order from Supabase
    useEffect(() => {
        const loadOrder = async (): Promise<void> => {
            const result = await getOrderFromDB(orderId)

            if (result.error || !result.data) {
                setNotFound(true)
                setIsLoading(false)
                return
            }

            setOrder(result.data)
            setIsLoading(false)
        }

        loadOrder()
    }, [orderId])

    // Simulate status progression (demo only)
    useEffect(() => {
        if (!order) return;

        const currentIndex = STATUS_PROGRESSION.indexOf(order.status);

        if (currentIndex < STATUS_PROGRESSION.length - 1) {
            const timeout = setTimeout(async () => {
                const nextStatus = STATUS_PROGRESSION[currentIndex + 1];

                // ✅ CORREÇÃO: Passar objeto com todos os parâmetros necessários
                await updateOrderInDB({
                    orderId: order.id,
                    newStatus: nextStatus,
                    restaurantId: order.restaurantId,
                });

                // Update local state
                setOrder((prev) =>
                    prev ? { ...prev, status: nextStatus } : null
                );
            }, 5000);

            return () => clearTimeout(timeout);
        }
    }, [order]);

    // Loading state
    if (isLoading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
                <Loader2 size={32} className="animate-spin text-[#00A082]" />
            </div>
        );
    }

    // Order not found
    if (notFound || !order) {
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors"
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
                <div className="text-6xl mb-4">📦</div>
                <h1
                    className="text-2xl font-bold mb-4"
                    style={{ color: 'var(--color-text)' }}
                >
                    Pedido não encontrado
                </h1>
                <p
                    className="mb-6"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    O pedido que você procura não existe ou foi removido.
                </p>
                <Link
                    href="/"
                    className="bg-[#00A082] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#008F74] transition-colors"
                >
                    Voltar para home
                </Link>
            </div>
        );
    }

    const currentStepIndex = STATUS_STEPS.findIndex(
        (s) => s.key === order.status
    );
    const isDelivered = order.status === 'DELIVERED';

    const estimatedTime = order.estimatedDelivery
        ? new Date(order.estimatedDelivery).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        })
        : '--:--';

    const formatOrderAddress = (): string => {
        const addr = order.address;
        const parts = [
            `${addr.street}, ${addr.number}`,
            addr.complement,
            addr.neighborhood,
            `${addr.city} - ${addr.state}`,
        ];
        return parts.filter(Boolean).join(', ');
    };

    return (
        <div
            className="min-h-screen pb-8 transition-colors"
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
            {/* Success Header */}
            <div className="bg-[#00A082] text-white p-6 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                    <CheckCircle size={64} className="mx-auto mb-4" />
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl font-bold mb-2"
                >
                    {isDelivered ? 'Pedido Entregue! 🎉' : 'Pedido Confirmado!'}
                </motion.h1>
                <p className="text-white/80 text-sm">
                    Pedido #{order.id.slice(0, 8)}...
                </p>
            </div>

            <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* Estimated Time */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl p-6 text-center border transition-colors"
                    style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    <Clock size={32} className="mx-auto mb-2 text-[#00A082]" />
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        {isDelivered ? 'Entregue às' : 'Previsão de entrega'}
                    </p>
                    <p
                        className="text-3xl font-bold"
                        style={{ color: 'var(--color-text)' }}
                    >
                        {estimatedTime}
                    </p>
                </motion.div>

                {/* Progress Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl p-6 border transition-colors"
                    style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    <h2
                        className="font-bold text-lg mb-6"
                        style={{ color: 'var(--color-text)' }}
                    >
                        Acompanhe seu pedido
                    </h2>

                    <div className="space-y-4">
                        {STATUS_STEPS.map((step, index) => {
                            const StepIcon = step.icon;
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;

                            return (
                                <motion.div
                                    key={step.key}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    className="flex items-center gap-4"
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                            isCompleted
                                                ? 'bg-[#00A082] text-white'
                                                : ''
                                        }`}
                                        style={{
                                            backgroundColor: isCompleted
                                                ? undefined
                                                : 'var(--color-bg-secondary)',
                                            color: isCompleted
                                                ? undefined
                                                : 'var(--color-text-tertiary)',
                                        }}
                                    >
                                        <StepIcon size={20} />
                                    </div>

                                    <div className="flex-1">
                                        <p
                                            className="font-medium"
                                            style={{
                                                color: isCompleted
                                                    ? 'var(--color-text)'
                                                    : 'var(--color-text-tertiary)',
                                            }}
                                        >
                                            {step.label}
                                        </p>
                                        {isCurrent && !isDelivered && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 2,
                                                }}
                                                className="text-sm text-[#00A082]"
                                            >
                                                Em andamento...
                                            </motion.p>
                                        )}
                                    </div>

                                    {isCompleted && index < currentStepIndex && (
                                        <CheckCircle
                                            size={20}
                                            className="text-[#00A082]"
                                        />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Delivery Address */}
                <div
                    className="rounded-2xl p-6 border transition-colors"
                    style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <MapPin size={24} className="text-[#00A082]" />
                        <h2
                            className="font-bold text-lg"
                            style={{ color: 'var(--color-text)' }}
                        >
                            Endereço de entrega
                        </h2>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        {formatOrderAddress()}
                    </p>
                </div>

                {/* Payment Method */}
                <div
                    className="rounded-2xl p-6 border transition-colors"
                    style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <CreditCard size={24} className="text-[#00A082]" />
                        <h2
                            className="font-bold text-lg"
                            style={{ color: 'var(--color-text)' }}
                        >
                            Forma de pagamento
                        </h2>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                        {order.paymentMethod === 'CASH' && order.changeFor && (
                            <span
                                className="block text-sm mt-1"
                                style={{ color: 'var(--color-text-tertiary)' }}
                            >
                                Troco para R$ {Number(order.changeFor).toFixed(2)}
                            </span>
                        )}
                    </p>
                </div>

                {/* Order Items */}
                <div
                    className="rounded-2xl p-6 border transition-colors"
                    style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    <h2
                        className="font-bold text-lg mb-4"
                        style={{ color: 'var(--color-text)' }}
                    >
                        Itens do pedido
                    </h2>

                    <div className="space-y-3 mb-4">
                        {order.items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3"
                            >
                                <img
                                    src={item.menuItemImage || '/placeholder.png'}
                                    alt={item.menuItemName}
                                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                                />
                                <div className="flex-1">
                                    <p
                                        className="font-medium"
                                        style={{ color: 'var(--color-text)' }}
                                    >
                                        {item.quantity}x {item.menuItemName}
                                    </p>
                                    {item.observation && (
                                        <p
                                            className="text-xs"
                                            style={{
                                                color: 'var(--color-text-tertiary)',
                                            }}
                                        >
                                            📝 {item.observation}
                                        </p>
                                    )}
                                </div>
                                <p
                                    className="font-medium"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    {formatPrice(item.menuItemPrice * item.quantity)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div
                        className="border-t pt-4 space-y-2"
                        style={{ borderColor: 'var(--color-border)' }}
                    >
                        <div className="flex justify-between text-sm">
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                                Subtotal
                            </span>
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                                {formatPrice(order.subtotal)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                                Entrega
                            </span>
                            <span
                                style={{
                                    color:
                                        order.deliveryFee === 0
                                            ? '#00A082'
                                            : 'var(--color-text-secondary)',
                                }}
                            >
                                {order.deliveryFee === 0
                                    ? 'Grátis'
                                    : formatPrice(order.deliveryFee)}
                            </span>
                        </div>
                        {order.discount > 0 && (
                            <div
                                className="flex justify-between text-sm"
                                style={{ color: '#00A082' }}
                            >
                                <span>Desconto</span>
                                <span>-{formatPrice(order.discount)}</span>
                            </div>
                        )}
                        <div
                            className="flex justify-between font-bold text-lg pt-2 border-t"
                            style={{
                                color: 'var(--color-text)',
                                borderColor: 'var(--color-border)',
                            }}
                        >
                            <span>Total</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Link
                        href="/orders"
                        className="block w-full bg-[#00A082] text-white py-4 rounded-full font-semibold hover:bg-[#008F74] transition-colors text-center"
                    >
                        Ver meus pedidos
                    </Link>
                    <Link
                        href="/"
                        className="block w-full py-4 rounded-full font-semibold transition-colors text-center"
                        style={{
                            backgroundColor: 'var(--color-bg-card)',
                            color: 'var(--color-text)',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: 'var(--color-border)',
                        }}
                    >
                        Fazer novo pedido
                    </Link>
                </div>
            </main>
        </div>
    );
}