// src/actions/orders.ts
'use server'

import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface OrderItemData {
    menuItemId: string
    menuItemName: string
    menuItemImage: string | null
    menuItemPrice: number
    quantity: number
    observation?: string | undefined
}

export interface OrderData {
    id: string
    userId: string
    restaurantId: string
    restaurantName: string
    status: string
    items: OrderItemData[]
    address: {
        street: string
        number: string
        complement?: string
        neighborhood: string
        city: string
        state: string
        zipCode: string
    }
    paymentMethod: string
    changeFor: number | null
    subtotal: number
    deliveryFee: number
    discount: number
    total: number
    couponCode: string | null
    estimatedDelivery: string | null
    deliveredAt: string | null
    createdAt: string
    updatedAt: string
}

// Função helper para validar o status
function isValidOrderStatus(status: string): status is OrderStatus {
    return Object.values(OrderStatus).includes(status as OrderStatus)
}

export async function createOrder(orderData: {
    restaurantId: string
    restaurantName: string
    items: OrderItemData[]
    address: {
        street: string
        number: string
        complement?: string
        neighborhood: string
        city: string
        state: string
        zipCode: string
    }
    paymentMethod: string
    changeFor?: number
    subtotal: number
    deliveryFee: number
    discount: number
    total: number
    couponCode?: string
}): Promise<{ data?: OrderData; error?: string }> {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Usuário não autenticado' }
    }

    // Calculate estimated delivery (40-60 min from now)
    const estimatedMinutes = 40 + Math.floor(Math.random() * 20)
    const estimatedDelivery = new Date(
        Date.now() + estimatedMinutes * 60 * 1000
    ).toISOString()

    const { data, error } = await supabase
        .from('orders')
        .insert({
            user_id: user.id,
            restaurant_id: orderData.restaurantId,
            restaurant_name: orderData.restaurantName,
            status: 'PENDING',
            items: JSON.stringify(orderData.items),
            address: JSON.stringify(orderData.address),
            payment_method: orderData.paymentMethod,
            change_for: orderData.changeFor || null,
            subtotal: orderData.subtotal,
            delivery_fee: orderData.deliveryFee,
            discount: orderData.discount,
            total: orderData.total,
            coupon_code: orderData.couponCode || null,
            estimated_delivery: estimatedDelivery,
        })
        .select()
        .single()

    if (error) {
        return { error: 'Erro ao criar pedido. Tente novamente.' }
    }

    return {
        data: mapOrderFromDB(data),
    }
}

export async function getOrders(): Promise<{ data?: OrderData[]; error?: string }> {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Usuário não autenticado' }
    }

    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        return { error: 'Erro ao carregar pedidos' }
    }

    const orders: OrderData[] = (data || []).map(mapOrderFromDB)

    return { data: orders }
}

export async function getOrderById(
    orderId: string
): Promise<{ data?: OrderData; error?: string }> {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Usuário não autenticado' }
    }

    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single()

    if (error) {
        return { error: 'Pedido não encontrado' }
    }

    return { data: mapOrderFromDB(data) }
}

export async function updateOrderStatus({
                                            orderId,
                                            newStatus,
                                            restaurantId,
                                        }: {
    orderId: string
    newStatus: string
    restaurantId: string
}): Promise<{ success?: boolean; error?: string }> {
    // Validar o status primeiro
    if (!isValidOrderStatus(newStatus)) {
        return { error: 'Status inválido' }
    }

    // 1. Verificar autenticação
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Usuário não autenticado' }
    }

    // 2. Verificar se o usuário é dono do restaurante
    const restaurant = await prisma.restaurant.findFirst({
        where: {
            id: restaurantId,
            owner_id: user.id,
        },
    })

    if (!restaurant) {
        return { error: 'Não autorizado ou restaurante não encontrado' }
    }

    // 3. Atualizar o pedido
    try {
        await prisma.order.update({
            where: {
                id: orderId,
                restaurantId: restaurantId,
            },
            data: {
                status: newStatus,
                updatedAt: new Date(),
            },
        })

        revalidatePath('/dashboard/orders')
        return { success: true }
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error)
        return { error: 'Erro ao atualizar pedido' }
    }
}

// Helper to map DB row to OrderData
function mapOrderFromDB(row: Record<string, unknown>): OrderData {
    return {
        id: row.id as string,
        userId: row.user_id as string,
        restaurantId: row.restaurant_id as string,
        restaurantName: row.restaurant_name as string,
        status: row.status as string,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items as OrderItemData[],
        address: typeof row.address === 'string' ? JSON.parse(row.address) : row.address as OrderData['address'],
        paymentMethod: row.payment_method as string,
        changeFor: row.change_for as number | null,
        subtotal: Number(row.subtotal),
        deliveryFee: Number(row.delivery_fee),
        discount: Number(row.discount),
        total: Number(row.total),
        couponCode: row.coupon_code as string | null,
        estimatedDelivery: row.estimated_delivery as string | null,
        deliveredAt: row.delivered_at as string | null,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
    }
}