// src/actions/orders.ts
'use server'

import { prisma } from '@/lib/prisma'
import { OrderStatus, Prisma } from '@prisma/client'
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

function isValidOrderStatus(status: string): status is OrderStatus {
    return Object.values(OrderStatus).includes(status as OrderStatus)
}

// ✅ HELPER para converter JSON do Prisma
function parseOrderItems(items: unknown): OrderItemData[] {
    if (Array.isArray(items)) {
        return items as OrderItemData[]
    }
    if (typeof items === 'string') {
        return JSON.parse(items)
    }
    return []
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

    const estimatedMinutes = 40 + Math.floor(Math.random() * 20)
    const estimatedDelivery = new Date(
        Date.now() + estimatedMinutes * 60 * 1000
    ).toISOString()

    try {
        const order = await prisma.order.create({
            data: {
                customer_name: user.email || 'Cliente',
                customer_phone: null,
                order_type: 'DELIVERY',
                delivery_address: JSON.stringify(orderData.address),
                status: OrderStatus.PENDING,
                items: orderData.items as unknown as Prisma.InputJsonValue, // ✅ CORRIGIDO
                total: orderData.total,
                restaurant_id: orderData.restaurantId, // ✅ SNAKE_CASE
            },
        })

        return {
            data: {
                id: order.id,
                userId: user.id,
                restaurantId: order.restaurant_id,
                restaurantName: orderData.restaurantName,
                status: order.status,
                items: orderData.items,
                address: orderData.address,
                paymentMethod: orderData.paymentMethod,
                changeFor: orderData.changeFor || null,
                subtotal: orderData.subtotal,
                deliveryFee: orderData.deliveryFee,
                discount: orderData.discount,
                total: order.total,
                couponCode: orderData.couponCode || null,
                estimatedDelivery,
                deliveredAt: null,
                createdAt: order.created_at.toISOString(),
                updatedAt: order.updated_at.toISOString(),
            },
        }
    } catch (error) {
        console.error('Erro ao criar pedido:', error)
        return { error: 'Erro ao criar pedido. Tente novamente.' }
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

    try {
        const orders = await prisma.order.findMany({
            where: {
                // ✅ Busca por email que foi salvo em customer_name
                customer_name: user.email || '',
            },
            orderBy: {
                created_at: 'desc',
            },
        })

        const mappedOrders: OrderData[] = orders.map(order => {
            const items = parseOrderItems(order.items)

            let address = {
                street: '',
                number: '',
                neighborhood: '',
                city: '',
                state: '',
                zipCode: '',
            }
            if (order.delivery_address) {
                try {
                    address = JSON.parse(order.delivery_address)
                } catch {
                    // mantém endereço vazio
                }
            }

            return {
                id: order.id,
                userId: user.id,
                restaurantId: order.restaurant_id,
                restaurantName: '',
                status: order.status,
                items,
                address,
                paymentMethod: 'CASH',
                changeFor: null,
                subtotal: order.total,
                deliveryFee: 0,
                discount: 0,
                total: order.total,
                couponCode: null,
                estimatedDelivery: null,
                deliveredAt: null,
                createdAt: order.created_at.toISOString(),
                updatedAt: order.updated_at.toISOString(),
            }
        })

        return { data: mappedOrders }
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error)
        return { error: 'Erro ao carregar pedidos' }
    }
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

    try {
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
        })

        if (!order) {
            return { error: 'Pedido não encontrado' }
        }

        const items = parseOrderItems(order.items) // ✅ USANDO HELPER

        let address = { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' }
        if (order.delivery_address) {
            if (typeof order.delivery_address === 'string') {
                address = JSON.parse(order.delivery_address)
            }
        }

        const orderData: OrderData = {
            id: order.id,
            userId: user.id,
            restaurantId: order.restaurant_id,
            restaurantName: '',
            status: order.status,
            items,
            address,
            paymentMethod: 'Dinheiro',
            changeFor: null,
            subtotal: order.total,
            deliveryFee: 0,
            discount: 0,
            total: order.total,
            couponCode: null,
            estimatedDelivery: null,
            deliveredAt: null,
            createdAt: order.created_at.toISOString(),
            updatedAt: order.updated_at.toISOString(),
        }

        return { data: orderData }
    } catch (error) {
        console.error('Erro ao buscar pedido:', error)
        return { error: 'Pedido não encontrado' }
    }
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
    if (!isValidOrderStatus(newStatus)) {
        return { error: 'Status inválido' }
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Usuário não autenticado' }
    }

    try {
        await prisma.order.update({
            where: {
                id: orderId,
            },
            data: {
                status: newStatus as OrderStatus,
                updated_at: new Date(),
            },
        })

        revalidatePath('/dashboard/orders')
        revalidatePath('/orders')
        return { success: true }
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error)
        return { error: 'Erro ao atualizar pedido' }
    }
}