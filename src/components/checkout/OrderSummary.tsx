// src/components/checkout/OrderSummary.tsx
'use client';

import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { getRestaurantById } from '@/data/mock';
import { formatPrice } from '@/lib/utils/format.utils';
import { CHECKOUT_MESSAGES } from '@/lib/constants/checkout.constants';

export default function OrderSummary() {
    const { items, restaurantId, totalPrice, appliedCoupon, couponDiscount } =
        useCart();

    const restaurant = restaurantId ? getRestaurantById(restaurantId) : null;
    const deliveryFee = restaurant?.deliveryFee || 0;

    const isFreeDeliveryCoupon = appliedCoupon?.code === 'FRETEGRATIS';
    const actualDeliveryFee = isFreeDeliveryCoupon ? 0 : deliveryFee;

    const finalTotal = totalPrice + actualDeliveryFee - couponDiscount;

    return (
        <div
            className="rounded-2xl border overflow-hidden transition-colors"
            style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
            }}
        >
            {/* Header */}
            <div
                className="flex items-center gap-3 p-4 border-b transition-colors"
                style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border)',
                }}
            >
                <div className="w-10 h-10 bg-[#00A082] rounded-full flex items-center justify-center">
                    <ShoppingBag size={20} className="text-white" />
                </div>
                <div>
                    <h2
                        className="font-bold text-lg"
                        style={{ color: 'var(--color-text)' }}
                    >
                        {CHECKOUT_MESSAGES.summaryTitle}
                    </h2>
                    {restaurant && (
                        <p
                            className="text-sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {restaurant.name}
                        </p>
                    )}
                </div>
            </div>

            {/* Itens */}
            <div className="p-4 space-y-3">
                {items.map((item, index) => (
                    <div
                        key={`${item.menuItem.id}-${index}`}
                        className="flex items-center gap-3"
                    >
                        {/* Imagem */}
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                            <Image
                                src={item.menuItem.image || '/placeholder.png'}
                                alt={item.menuItem.name}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p
                                className="font-medium text-sm truncate"
                                style={{ color: 'var(--color-text)' }}
                            >
                                {item.quantity}x {item.menuItem.name}
                            </p>
                            {item.observation && (
                                <p
                                    className="text-xs truncate"
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                >
                                    📝 {item.observation}
                                </p>
                            )}
                        </div>

                        {/* Preço */}
                        <p
                            className="font-medium text-sm"
                            style={{ color: 'var(--color-text)' }}
                        >
                            {formatPrice(item.menuItem.price * item.quantity)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Totais */}
            <div
                className="p-4 border-t space-y-2"
                style={{ borderColor: 'var(--color-border)' }}
            >
                <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                        Subtotal
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                        {formatPrice(totalPrice)}
                    </span>
                </div>

                <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                        Taxa de entrega
                    </span>
                    <span
                        style={{
                            color:
                                actualDeliveryFee === 0
                                    ? 'var(--color-primary)'
                                    : 'var(--color-text-secondary)',
                        }}
                    >
                        {actualDeliveryFee === 0
                            ? 'Grátis'
                            : formatPrice(actualDeliveryFee)}
                    </span>
                </div>

                {couponDiscount > 0 && (
                    <div
                        className="flex justify-between text-sm"
                        style={{ color: 'var(--color-primary)' }}
                    >
                        <span>Desconto ({appliedCoupon?.code})</span>
                        <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                )}

                {isFreeDeliveryCoupon && deliveryFee > 0 && (
                    <div
                        className="flex justify-between text-sm"
                        style={{ color: 'var(--color-primary)' }}
                    >
                        <span>Frete Grátis</span>
                        <span>-{formatPrice(deliveryFee)}</span>
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
                    <span>{formatPrice(Math.max(0, finalTotal))}</span>
                </div>
            </div>
        </div>
    );
}