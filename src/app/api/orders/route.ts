import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const restaurantId = searchParams.get('restaurantId')
    const status = searchParams.get('status')

    if (!restaurantId) {
        return NextResponse.json({ error: 'restaurantId é obrigatório' }, { status: 400 })
    }

    const supabase = createClient()
    
    let query = supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })

    if (status && status !== 'ALL') {
        query = query.eq('status', status)
    }

    const { data: orders, error } = await query

    if (error) {
        console.error('Erro ao buscar pedidos:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formattedOrders = orders?.map(order => ({
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
    })) || []

    return NextResponse.json(formattedOrders)
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { restaurantId, customerName, orderType, tableNumber, items, total } = body

        if (!restaurantId || !items || items.length === 0) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
        }

        const supabase = createClient()

        const { data, error } = await supabase
            .from('orders')
            .insert({
                restaurant_id: restaurantId,
                customer_name: customerName || 'Cliente',
                order_type: orderType || 'TAKEAWAY',
                table_number: tableNumber,
                items: items,
                total: total,
                status: 'PENDING',
                order_number: `ORD-${Date.now().toString(36).toUpperCase()}`
            })
            .select()
            .single()

        if (error) {
            console.error('Erro ao criar pedido:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('Erro ao processar pedido:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}