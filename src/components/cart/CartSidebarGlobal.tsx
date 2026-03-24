// src/components/cart/CartSidebarGlobal.tsx
'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils/format.utils'

export function CartSidebarGlobal() {
    const router = useRouter()
    const {
        items,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        removeItem,
        updateQuantity,
        clearCart,
        couponDiscount,
    } = useCart()

    const handleCheckout = (): void => {
        setIsCartOpen(false)
        router.push('/cart')
    }

    const handleOverlayClick = (): void => {
        setIsCartOpen(false)
    }

    return (
        <AnimatePresence>
            {isCartOpen && items.length > 0 && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50"
                        style={{ backgroundColor: 'var(--color-bg-modal-overlay)' }}
                        onClick={handleOverlayClick}
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col"
                        style={{
                            backgroundColor: 'var(--color-bg)',
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        {/* Header */}
                        <div
                            className="flex items-center justify-between px-6 py-4"
                            style={{
                                borderBottomWidth: '1px',
                                borderBottomStyle: 'solid',
                                borderBottomColor: 'var(--color-border)',
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <ShoppingBag size={22} className="text-[#00A082]" />
                                <h2
                                    className="text-lg font-bold"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    Carrinho ({totalItems})
                                </h2>
                            </div>

                            <div className="flex items-center gap-2">
                                {items.length > 0 && (
                                    <button
                                        onClick={clearCart}
                                        className="rounded-full p-2 transition-colors"
                                        style={{ color: 'var(--color-error)' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                'var(--color-bg-hover)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent'
                                        }}
                                        aria-label="Limpar carrinho"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}

                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="rounded-full p-2 transition-colors"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            'var(--color-bg-hover)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent'
                                    }}
                                    aria-label="Fechar carrinho"
                                >
                                    <X size={22} />
                                </button>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <div className="flex flex-col gap-4">
                                {items.map((item) => (
                                    <div
                                        key={`${item.menuItem.id}-${item.observation || ''}`}
                                        className="flex gap-4 rounded-xl p-3"
                                        style={{
                                            backgroundColor: 'var(--color-bg-card)',
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            borderColor: 'var(--color-border)',
                                        }}
                                    >
                                        {/* Item Image */}
                                        <img
                                            src={item.menuItem.image || '/placeholder.png'}
                                            alt={item.menuItem.name}
                                            className="h-16 w-16 rounded-lg object-cover"
                                        />

                                        {/* Item Info */}
                                        <div className="flex flex-1 flex-col">
                                            <div className="flex items-start justify-between">
                                                <h3
                                                    className="text-sm font-semibold"
                                                    style={{ color: 'var(--color-text)' }}
                                                >
                                                    {item.menuItem.name}
                                                </h3>
                                                <button
                                                    onClick={() =>
                                                        removeItem(
                                                            item.menuItem.id,
                                                            item.observation
                                                        )
                                                    }
                                                    className="p-1 transition-colors"
                                                    style={{ color: 'var(--color-text-tertiary)' }}
                                                    aria-label={`Remover ${item.menuItem.name}`}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>

                                            {item.observation && (
                                                <p
                                                    className="mt-0.5 text-xs"
                                                    style={{
                                                        color: 'var(--color-text-tertiary)',
                                                    }}
                                                >
                                                    Obs: {item.observation}
                                                </p>
                                            )}

                                            <div className="mt-2 flex items-center justify-between">
                                                <span
                                                    className="text-sm font-bold text-[#00A082]"
                                                >
                                                    {formatPrice(
                                                        item.menuItem.price * item.quantity
                                                    )}
                                                </span>

                                                {/* Quantity Controls */}
                                                <div
                                                    className="flex items-center gap-3 rounded-full px-2 py-1"
                                                    style={{
                                                        backgroundColor:
                                                            'var(--color-bg-secondary)',
                                                    }}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.menuItem.id,
                                                                item.quantity - 1,
                                                                item.observation
                                                            )
                                                        }
                                                        className="flex h-6 w-6 items-center justify-center rounded-full transition-colors"
                                                        style={{
                                                            color: 'var(--color-text-secondary)',
                                                        }}
                                                        aria-label="Diminuir quantidade"
                                                    >
                                                        <Minus size={14} />
                                                    </button>

                                                    <span
                                                        className="min-w-[20px] text-center text-sm font-semibold"
                                                        style={{
                                                            color: 'var(--color-text)',
                                                        }}
                                                    >
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.menuItem.id,
                                                                item.quantity + 1,
                                                                item.observation
                                                            )
                                                        }
                                                        className="flex h-6 w-6 items-center justify-center rounded-full transition-colors"
                                                        style={{ color: '#00A082' }}
                                                        aria-label="Aumentar quantidade"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div
                            className="px-6 py-4"
                            style={{
                                borderTopWidth: '1px',
                                borderTopStyle: 'solid',
                                borderTopColor: 'var(--color-border)',
                                backgroundColor: 'var(--color-bg-card)',
                            }}
                        >
                            {/* Subtotal */}
                            <div className="mb-3 flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span
                                        className="text-sm"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        Subtotal
                                    </span>
                                    <span
                                        className="text-sm font-medium"
                                        style={{ color: 'var(--color-text)' }}
                                    >
                                        {formatPrice(totalPrice)}
                                    </span>
                                </div>

                                {couponDiscount > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="text-sm"
                                            style={{ color: '#00A082' }}
                                        >
                                            Desconto
                                        </span>
                                        <span
                                            className="text-sm font-medium"
                                            style={{ color: '#00A082' }}
                                        >
                                            -{formatPrice(couponDiscount)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2"
                                     style={{
                                         borderTopWidth: '1px',
                                         borderTopStyle: 'solid',
                                         borderTopColor: 'var(--color-border)',
                                     }}
                                >
                                    <span
                                        className="text-base font-bold"
                                        style={{ color: 'var(--color-text)' }}
                                    >
                                        Total
                                    </span>
                                    <span
                                        className="text-base font-bold"
                                        style={{ color: 'var(--color-text)' }}
                                    >
                                        {formatPrice(totalPrice - couponDiscount)}
                                    </span>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                className="w-full rounded-xl bg-[#00A082] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#008F74]"
                            >
                                Ver carrinho completo
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}