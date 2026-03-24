// src/components/orders/OrderCard.tsx
'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { type OrderData } from '@/actions/orders'
import { ORDER_STATUS_CONFIG, ORDER_MESSAGES, ACTIVE_STATUSES } from '@/lib/constants/order.constants'
import { formatPrice } from '@/lib/utils/format.utils'
import { formatDateBR } from '@/lib/utils/format.utils'

interface OrderCardProps {
    order: OrderData
    index: number
}

export function OrderCard({ order, index }: OrderCardProps) {
    const router = useRouter()
    const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.PENDING
    const isActive = ACTIVE_STATUSES.includes(order.status)
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

    const handleClick = (): void => {
        router.push(`/order/${order.id}`)
    }

    const formatOrderDate = (dateString: string): string => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMinutes = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMinutes / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMinutes < 1) return 'Agora mesmo'
        if (diffMinutes < 60) return `Há ${diffMinutes} min`
        if (diffHours < 24) return `Há ${diffHours}h`
        if (diffDays < 7) return `Há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`
        return formatDateBR(dateString)
    }

    return (
        <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={handleClick}
            className="w-full rounded-2xl p-5 text-left transition-colors"
            style={{
                backgroundColor: 'var(--color-bg-card)',
                borderWidth: isActive ? '2px' : '1px',
                borderStyle: 'solid',
                borderColor: isActive ? statusConfig.color : 'var(--color-border)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-card)'
            }}
        >
            {/* Top row */}
            <div className="mb-3 flex items-start justify-between">
                <div>
                    <h3
                        className="text-base font-semibold"
                        style={{ color: 'var(--color-text)' }}
                    >
                        {order.restaurantName}
                    </h3>
                    <p
                        className="mt-0.5 text-xs"
                        style={{ color: 'var(--color-text-tertiary)' }}
                    >
                        {formatOrderDate(order.createdAt)}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span
                        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.color,
                        }}
                    >
                        <span>{statusConfig.icon}</span>
                        {statusConfig.label}
                    </span>

                    <ChevronRight
                        size={18}
                        style={{ color: 'var(--color-text-tertiary)' }}
                    />
                </div>
            </div>

            {/* Items preview */}
            <div className="mb-3 flex items-center gap-3">
                {/* Item images (max 3) */}
                <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, i) => (
                        <img
                            key={i}
                            src={item.menuItemImage || '/placeholder.png'}
                            alt={item.menuItemName}
                            className="h-10 w-10 rounded-full border-2 object-cover"
                            style={{ borderColor: 'var(--color-bg-card)' }}
                        />
                    ))}
                    {order.items.length > 3 && (
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-medium"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                borderColor: 'var(--color-bg-card)',
                                color: 'var(--color-text-secondary)',
                            }}
                        >
                            +{order.items.length - 3}
                        </div>
                    )}
                </div>

                {/* Items summary */}
                <p
                    className="flex-1 truncate text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    {order.items.map((item) => item.menuItemName).join(', ')}
                </p>
            </div>

            {/* Bottom row */}
            <div
                className="flex items-center justify-between pt-3"
                style={{
                    borderTopWidth: '1px',
                    borderTopStyle: 'solid',
                    borderTopColor: 'var(--color-border)',
                }}
            >
                <span
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    {ORDER_MESSAGES.ITEMS_COUNT(itemCount)}
                </span>

                <span
                    className="text-sm font-bold"
                    style={{ color: 'var(--color-text)' }}
                >
                    {formatPrice(order.total)}
                </span>
            </div>

            {/* Active indicator */}
            {isActive && (
                <div className="mt-3 flex items-center gap-2">
                    <div
                        className="h-2 w-2 animate-pulse rounded-full"
                        style={{ backgroundColor: statusConfig.color }}
                    />
                    <span
                        className="text-xs font-medium"
                        style={{ color: statusConfig.color }}
                    >
                        {ORDER_MESSAGES.TRACK_ORDER}
                    </span>
                </div>
            )}
        </motion.button>
    )
}