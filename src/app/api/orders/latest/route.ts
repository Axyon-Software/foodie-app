import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const restaurantId = searchParams.get('restaurantId')
    const status = searchParams.get('status') || 'PENDING'

    if (!restaurantId) {
        return NextResponse.json({ error: 'restaurantId é obrigatório' }, { status: 400 })
    }

    const supabase = createClient()

    const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            return NextResponse.json(null)
        }
        console.error('Erro ao buscar último pedido:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formattedOrder = {
        id: order.id,
        orderNumber: order.order_number || order.id.slice(-4).toUpperCase(),
        orderType: order.order_type,
        status: order.status,
        customerName: order.customer_name || 'Cliente',
        tableNumber: order.table_number,
        items: order.items || [],
        total: order.total || 0,
        createdAt: order.created_at,
        confirmedAt: order.confirmed_at,
        preparingAt: order.preparing_at,
        readyAt: order.ready_at,
        deliveredAt: order.delivered_at
    }

    return NextResponse.json(formattedOrder)
}