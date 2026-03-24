// src/hooks/useKitchenOrders.ts
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'

export type Order = {
    id: string
    customerName: string
    status: OrderStatus
    items: any[]
    total: number
    tableNumber?: string
    orderType: string
    createdAt: string
}

export function useKitchenOrders(restaurantId: string) {
    const [orders, setOrders] = useState<Order[]>([])
    const [newOrderSound, setNewOrderSound] = useState<HTMLAudioElement | null>(null)

    useEffect(() => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
        setNewOrderSound(audio)
    }, [])

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch(`/api/orders?restaurantId=${restaurantId}`)
            if (res.ok) {
                const data = await res.json()
                setOrders(data as Order[])
            }
        } catch (e) {
            console.error('Erro ao buscar pedidos:', e)
        }
    }, [restaurantId])

    useEffect(() => {
        fetchOrders()

        const supabase = createClient()

        const channel = supabase
            .channel(`kitchen-${restaurantId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `restaurant_id=eq.${restaurantId}`
                },
                (payload) => {
                    console.log('Mudança detectada!', payload)

                    if (payload.eventType === 'INSERT' && payload.new.status === 'PENDING') {
                        newOrderSound?.play().catch(e => console.log('Som bloqueado'))
                        toast.success(`🔔 Novo pedido #${String(payload.new.id).slice(-4)}!`, {
                            description: `${payload.new.customer_name} - ${payload.new.order_type === 'DINE_IN' ? 'Mesa ' + payload.new.table_number : 'Delivery'}`
                        })
                    }

                    fetchOrders()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [restaurantId, fetchOrders, newOrderSound])

    // Poll every 15 seconds as fallback
    useEffect(() => {
        const interval = setInterval(fetchOrders, 15000)
        return () => clearInterval(interval)
    }, [fetchOrders])

    return { orders, refresh: fetchOrders }
}
