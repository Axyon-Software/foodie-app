'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'

export interface KitchenOrder {
    id: string
    orderNumber: string
    orderType: 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY'
    status: OrderStatus
    customerName: string
    tableNumber?: string
    items: KitchenOrderItem[]
    total: number
    createdAt: string
    confirmedAt?: string
    preparingAt?: string
    readyAt?: string
    deliveredAt?: string
}

export interface KitchenOrderItem {
    name: string
    quantity: number
    observations?: string
    addons?: string[]
}

export interface UseNewOrderDetectorOptions {
    restaurantId: string
    onNewOrder?: (order: KitchenOrder) => void
    enabled?: boolean
    pollingInterval?: number
}

export interface UseNewOrderDetectorReturn {
    lastOrderId: string | null
    latestOrder: KitchenOrder | null
    isDetecting: boolean
    refreshLatest: () => Promise<void>
}

export function useNewOrderDetector(options: UseNewOrderDetectorOptions): UseNewOrderDetectorReturn {
    const { 
        restaurantId, 
        onNewOrder, 
        enabled = true,
        pollingInterval = 15000 
    } = options

    const [lastOrderId, setLastOrderId] = useState<string | null>(null)
    const [latestOrder, setLatestOrder] = useState<KitchenOrder | null>(null)
    const [isDetecting, setIsDetecting] = useState(false)
    const previousIdsRef = useRef<Set<string>>(new Set())
    const hasCalledCallbackRef = useRef<Set<string>>(new Set())

    const fetchLatestOrder = useCallback(async () => {
        if (!restaurantId || !enabled) return

        try {
            const response = await fetch(
                `/api/orders/latest?restaurantId=${restaurantId}&status=PENDING`
            )
            
            if (response.ok) {
                const order = await response.json()
                
                if (order && order.id) {
                    setLatestOrder(order)

                    const isNewOrder = !previousIdsRef.current.has(order.id)
                    
                    if (isNewOrder) {
                        previousIdsRef.current.add(order.id)
                        setLastOrderId(order.id)

                        if (!hasCalledCallbackRef.current.has(order.id)) {
                            hasCalledCallbackRef.current.add(order.id)
                            onNewOrder?.(order)
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao detectar novo pedido:', error)
        }
    }, [restaurantId, enabled, onNewOrder])

    useEffect(() => {
        if (!restaurantId || !enabled) return

        setIsDetecting(true)

        fetchLatestOrder()

        const supabase = createClient()
        
        const channel = supabase
            .channel(`new-order-detector-${restaurantId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                    filter: `restaurant_id=eq.${restaurantId}`
                },
                async (payload) => {
                    const newOrder = payload.new as KitchenOrder
                    
                    if (newOrder.status === 'PENDING') {
                        setLastOrderId(newOrder.id)
                        setLatestOrder(newOrder)
                        previousIdsRef.current.add(newOrder.id)
                        
                        if (!hasCalledCallbackRef.current.has(newOrder.id)) {
                            hasCalledCallbackRef.current.add(newOrder.id)
                            onNewOrder?.(newOrder)
                        }
                    }
                }
            )
            .subscribe()

        const pollingTimer = setInterval(fetchLatestOrder, pollingInterval)

        return () => {
            supabase.removeChannel(channel)
            clearInterval(pollingTimer)
            setIsDetecting(false)
        }
    }, [restaurantId, enabled, pollingInterval, fetchLatestOrder, onNewOrder])

    const refreshLatest = useCallback(async () => {
        await fetchLatestOrder()
    }, [fetchLatestOrder])

    return {
        lastOrderId,
        latestOrder,
        isDetecting,
        refreshLatest
    }
}