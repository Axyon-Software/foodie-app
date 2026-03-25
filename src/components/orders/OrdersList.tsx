// src/components/orders/OrdersList.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ShoppingBag, ClipboardList, Search, X, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { getOrders, type OrderData } from '@/actions/orders'
import {
    ORDER_MESSAGES,
    ACTIVE_STATUSES,
    COMPLETED_STATUSES,
} from '@/lib/constants/order.constants'
import { OrderCard } from '@/components/orders/OrderCard'

type TabType = 'active' | 'completed'

export function OrdersList() {
    const router = useRouter()
    const [orders, setOrders] = useState<OrderData[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [activeTab, setActiveTab] = useState<TabType>('active')
    const [searchQuery, setSearchQuery] = useState('')
    const [showSearch, setShowSearch] = useState(false)

    useEffect(() => {
        const loadOrders = async (): Promise<void> => {
            const result = await getOrders()

            if (result.error) {
                toast.error(ORDER_MESSAGES.LOAD_ERROR)
                router.push('/sign-in')
                return
            }

            setOrders(result.data || [])
            setIsLoading(false)

            const hasActive = (result.data || []).some((o) =>
                ACTIVE_STATUSES.includes(o.status)
            )
            if (!hasActive && (result.data || []).length > 0) {
                setActiveTab('completed')
            }
        }

        loadOrders()
    }, [router])

    const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status))
    const completedOrders = orders.filter((o) => COMPLETED_STATUSES.includes(o.status))

    const filteredOrders = useMemo(() => {
        const baseOrders = activeTab === 'active' ? activeOrders : completedOrders

        if (!searchQuery.trim()) return baseOrders

        const query = searchQuery.toLowerCase()
        return baseOrders.filter(
            (o) =>
                o.id.toLowerCase().includes(query) ||
                o.restaurantName.toLowerCase().includes(query) ||
                o.items.some((i) => i.menuItemName.toLowerCase().includes(query))
        )
    }, [activeTab, activeOrders, completedOrders, searchQuery])

    const handleExplore = (): void => {
        router.push('/')
    }

    if (isLoading) {
        return (
            <div
                className="flex min-h-[60vh] items-center justify-center"
                style={{ backgroundColor: 'var(--color-bg)' }}
            >
                <Loader2 size={32} className="animate-spin" style={{ color: '#00A082' }} />
            </div>
        )
    }

    return (
        <div
            className="min-h-screen transition-colors"
            style={{ backgroundColor: 'var(--color-bg)' }}
        >
            <div className="mx-auto max-w-2xl px-4 py-8">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-start justify-between"
                >
                    <div>
                        <h1
                            className="text-2xl font-bold"
                            style={{ color: 'var(--color-text)' }}
                        >
                            {ORDER_MESSAGES.PAGE_TITLE}
                        </h1>
                        <p
                            className="mt-1 text-sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {ORDER_MESSAGES.PAGE_SUBTITLE}
                        </p>
                    </div>

                    {orders.length > 0 && (
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                            style={{
                                backgroundColor: showSearch
                                    ? '#00A082'
                                    : 'var(--color-bg-secondary)',
                                color: showSearch ? 'white' : 'var(--color-text-secondary)',
                            }}
                        >
                            {showSearch ? <X size={18} /> : <Search size={18} />}
                        </button>
                    )}
                </motion.div>

                {/* Search Bar */}
                <AnimatePresence>
                    {showSearch && orders.length > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-4 overflow-hidden"
                        >
                            <div
                                className="flex items-center gap-3 rounded-xl px-4 py-3"
                                style={{ backgroundColor: 'var(--color-bg-card)' }}
                            >
                                <Search
                                    size={18}
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                />
                                <input
                                    type="text"
                                    placeholder={ORDER_MESSAGES.SEARCH_PLACEHOLDER}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent text-sm outline-none"
                                    style={{ color: 'var(--color-text)' }}
                                    autoFocus
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')}>
                                        <X
                                            size={16}
                                            style={{ color: 'var(--color-text-tertiary)' }}
                                        />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {orders.length > 0 ? (
                    <>
                        {/* Tabs */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="mb-6 flex gap-2 rounded-xl p-1"
                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                        >
                            <button
                                onClick={() => setActiveTab('active')}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor:
                                        activeTab === 'active'
                                            ? 'var(--color-bg-card)'
                                            : 'transparent',
                                    color:
                                        activeTab === 'active'
                                            ? '#00A082'
                                            : 'var(--color-text-secondary)',
                                    boxShadow:
                                        activeTab === 'active'
                                            ? 'var(--shadow-sm)'
                                            : 'none',
                                }}
                            >
                                <ClipboardList size={16} />
                                {ORDER_MESSAGES.TAB_ACTIVE}
                                {activeOrders.length > 0 && (
                                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#00A082] px-1.5 text-[10px] font-bold text-white">
                                        {activeOrders.length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTab('completed')}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor:
                                        activeTab === 'completed'
                                            ? 'var(--color-bg-card)'
                                            : 'transparent',
                                    color:
                                        activeTab === 'completed'
                                            ? '#00A082'
                                            : 'var(--color-text-secondary)',
                                    boxShadow:
                                        activeTab === 'completed'
                                            ? 'var(--shadow-sm)'
                                            : 'none',
                                }}
                            >
                                <ShoppingBag size={16} />
                                {ORDER_MESSAGES.TAB_COMPLETED}
                                {completedOrders.length > 0 && (
                                    <span
                                        className="text-xs"
                                        style={{ color: 'var(--color-text-tertiary)' }}
                                    >
                                        ({completedOrders.length})
                                    </span>
                                )}
                            </button>
                        </motion.div>

                        {/* Orders List */}
                        {filteredOrders.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {filteredOrders.map((order, index) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        index={index}
                                    />
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-16 text-center"
                            >
                                <p
                                    className="text-sm"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                >
                                    {searchQuery
                                        ? 'Nenhum pedido encontrado para sua busca'
                                        : activeTab === 'active'
                                            ? 'Nenhum pedido em andamento'
                                            : 'Nenhum pedido concluído'}
                                </p>
                            </motion.div>
                        )}
                    </>
                ) : (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center py-20"
                    >
                        <div
                            className="mb-4 flex h-20 w-20 items-center justify-center rounded-full"
                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                        >
                            <ShoppingBag
                                size={36}
                                style={{ color: 'var(--color-text-tertiary)' }}
                            />
                        </div>
                        <h3
                            className="mb-2 text-lg font-semibold"
                            style={{ color: 'var(--color-text)' }}
                        >
                            {ORDER_MESSAGES.EMPTY_TITLE}
                        </h3>
                        <p
                            className="mb-6 text-sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {ORDER_MESSAGES.EMPTY_SUBTITLE}
                        </p>
                        <button
                            onClick={handleExplore}
                            className="flex items-center gap-2 rounded-xl bg-[#00A082] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#008F74]"
                        >
                            {ORDER_MESSAGES.EMPTY_BUTTON}
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
