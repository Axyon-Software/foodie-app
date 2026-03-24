'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Exportar o tipo para uso em outros arquivos
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'

export type Order = {
    id: string
    customerName: string
    status: OrderStatus  // <- Mudança aqui: de string para OrderStatus
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
        const res = await fetch(`/api/orders?restaurantId=${restaurantId}`)
        const data = await res.json()
        setOrders(data as Order[])  // <- Type assertion para garantir o tipo
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
                    table: 'Order',
                    filter: `restaurantId=eq.${restaurantId}`
                },
                (payload) => {
                    console.log('Mudança detectada!', payload)

                    if (payload.eventType === 'INSERT' && payload.new.status === 'PENDING') {
                        newOrderSound?.play().catch(e => console.log('Som bloqueado'))
                        toast.success(`🔔 Novo pedido #${payload.new.id.slice(-4)}!`, {
                            description: `${payload.new.customerName} - ${payload.new.orderType === 'DINE_IN' ? 'Mesa ' + payload.new.tableNumber : 'Delivery'}`
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

    return { orders, refresh: fetchOrders }
}