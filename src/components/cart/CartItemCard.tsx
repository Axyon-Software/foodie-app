// src/components/cart/CartItemCard.tsx
'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/types';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils/format.utils';

interface CartItemCardProps {
    item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
    const { updateQuantity } = useCart();

    const { menuItem, quantity, observation } = item;
    const totalPrice = menuItem.price * quantity;

    return (
        <div
            className="flex gap-4 p-4 rounded-2xl border transition-colors"
            style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)'
            }}
        >
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                <Image
                    src={menuItem.image || '/placeholder.png'}  // ✅ Adicionar fallback
                    alt={menuItem.name}
                    fill
                    className="object-cover"
                />
            </div>

            <div className="flex-1 min-w-0">
                <h3
                    className="font-semibold truncate"
                    style={{ color: 'var(--color-text)' }}
                >
                    {menuItem.name}
                </h3>

                {observation && (
                    <p
                        className="text-sm truncate mt-0.5"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        📝 {observation}
                    </p>
                )}

                <div className="flex items-center justify-between mt-3">
                    <p className="text-[#00A082] font-bold text-lg">
                        {formatPrice(totalPrice)}
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => updateQuantity(menuItem.id, quantity - 1, observation)}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                            aria-label="Diminuir quantidade"
                        >
                            {quantity === 1 ? (
                                <Trash2 size={16} className="text-red-500" />
                            ) : (
                                <Minus size={16} style={{ color: 'var(--color-text)' }} />
                            )}
                        </button>

                        <span
                            className="font-bold text-lg w-8 text-center"
                            style={{ color: 'var(--color-text)' }}
                        >
                            {quantity}
                        </span>

                        <button
                            onClick={() => updateQuantity(menuItem.id, quantity + 1, observation)}
                            className="w-8 h-8 rounded-full bg-[#00A082] text-white flex items-center justify-center hover:bg-[#008F74] transition-colors"
                            aria-label="Aumentar quantidade"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}