// src/actions/order-management.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { Order, OrderStatus, OrderReview, OrderTimeline, OrderFilters, OrderStats, CreateOrderRequest, UpdateOrderStatusRequest, CANCELLATION_REASONS } from '@/types/order-management.types';

export async function createOrder(data: CreateOrderRequest): Promise<{ data?: Order; error?: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Usuário não autenticado' };
    }

    const estimatedMinutes = 40 + Math.floor(Math.random() * 20);
    const estimatedDelivery = new Date(Date.now() + estimatedMinutes * 60 * 1000).toISOString();

    const { data: order, error } = await supabase
        .from('orders')
        .insert({
            user_id: user.id,
            restaurant_id: data.restaurantId,
            restaurant_name: data.restaurantName,
            status: 'PENDING',
            items: JSON.stringify(data.items),
            address: JSON.stringify(data.address),
            payment_method: data.paymentMethod,
            change_for: data.changeFor || null,
            subtotal: data.subtotal,
            delivery_fee: data.deliveryFee,
            discount: data.discount,
            total: data.total,
            coupon_code: data.couponCode || null,
            observation: data.observation || null,
            estimated_delivery: estimatedDelivery,
        })
        .select()
        .single();

    if (error) {
        return { error: 'Erro ao criar pedido. Tente novamente.' };
    }

    await supabase.from('order_timeline').insert({
        order_id: order.id,
        status: 'PENDING',
        timestamp: new Date().toISOString(),
        note: 'Pedido criado',
    });

    return { data: mapOrderFromDB(order) };
}

export async function getOrders(filters?: OrderFilters): Promise<{ data?: Order[]; error?: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Usuário não autenticado' };
    }

    let query = supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
    }
    if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
    }
    if (filters?.minValue !== undefined) {
        query = query.gte('total', filters.minValue);
    }
    if (filters?.maxValue !== undefined) {
        query = query.lte('total', filters.maxValue);
    }

    const { data, error } = await query;

    if (error) {
        return { error: 'Erro ao carregar pedidos' };
    }

    const orders = (data || []).map(mapOrderFromDB);
    return { data: orders };
}

export async function getRestaurantOrders(filters?: OrderFilters): Promise<{ data?: Order[]; error?: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Usuário não autenticado' };
    }

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!restaurant) {
        return { error: 'Restaurante não encontrado' };
    }

    let query = supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false });

    if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
    }
    if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
    }
    if (filters?.search) {
        query = query.ilike('restaurant_name', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
        return { error: 'Erro ao carregar pedidos' };
    }

    return { data: (data || []).map(mapOrderFromDB) };
}

export async function getOrderById(orderId: string): Promise<{ data?: Order; error?: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (error) {
        return { error: 'Pedido não encontrado' };
    }

    return { data: mapOrderFromDB(data) };
}

export async function updateOrderStatus(
    orderId: string,
    request: UpdateOrderStatusRequest
): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Usuário não autenticado' };
    }

    const updateData: Record<string, unknown> = { status: request.status };

    if (request.status === 'DELIVERED') {
        updateData.delivered_at = new Date().toISOString();
    }
    if (request.status === 'PREPARING') {
        updateData.prepared_at = new Date().toISOString();
    }
    if (request.status === 'CANCELLED') {
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancellation_reason = request.note;
    }

    const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

    if (error) {
        return { error: 'Erro ao atualizar pedido' };
    }

    await supabase.from('order_timeline').insert({
        order_id: orderId,
        status: request.status,
        timestamp: new Date().toISOString(),
        note: request.note || `Status alterado para ${request.status}`,
    });

    return { success: true };
}

export async function cancelOrder(
    orderId: string,
    reason: string
): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Usuário não autenticado' };
    }

    const { data: order } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

    if (!order) {
        return { error: 'Pedido não encontrado' };
    }

    const nonCancellableStatuses = ['DELIVERED', 'CANCELLED', 'DELIVERING'];
    if (nonCancellableStatuses.includes(order.status)) {
        return { error: 'Este pedido não pode ser cancelado' };
    }

    return updateOrderStatus(orderId, { status: 'CANCELLED', note: reason });
}

export async function getOrderTimeline(orderId: string): Promise<{ data?: OrderTimeline[]; error?: string }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('order_timeline')
        .select('*')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: true });

    if (error) {
        return { error: 'Erro ao carregar histórico' };
    }

    return { data: data || [] };
}

export async function submitOrderReview(
    orderId: string,
    rating: number,
    comment?: string
): Promise<{ data?: OrderReview; error?: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Usuário não autenticado' };
    }

    const { data: existingReview } = await supabase
        .from('order_reviews')
        .select('id')
        .eq('order_id', orderId)
        .single();

    if (existingReview) {
        return { error: 'Você já avaliou este pedido' };
    }

    const { data: review, error } = await supabase
        .from('order_reviews')
        .insert({
            order_id: orderId,
            rating,
            comment: comment || null,
            user_id: user.id,
        })
        .select()
        .single();

    if (error) {
        return { error: 'Erro ao enviar avaliação' };
    }

    await supabase
        .from('orders')
        .update({ reviewed: true })
        .eq('id', orderId);

    return { data: review };
}

export async function getOrderReview(orderId: string): Promise<{ data?: OrderReview; error?: string }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('order_reviews')
        .select('*')
        .eq('order_id', orderId)
        .single();

    if (error && error.code !== 'PGRST116') {
        return { error: 'Erro ao carregar avaliação' };
    }

    return { data: data || undefined };
}

export async function getOrderStats(): Promise<{ data?: OrderStats; error?: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Usuário não autenticado' };
    }

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!restaurant) {
        return { error: 'Restaurante não encontrado' };
    }

    const { data: orders } = await supabase
        .from('orders')
        .select('status, total, created_at')
        .eq('restaurant_id', restaurant.id);

    const allOrders = orders || [];

    const stats: OrderStats = {
        totalOrders: allOrders.length,
        pendingOrders: allOrders.filter(o => o.status === 'PENDING').length,
        preparingOrders: allOrders.filter(o => o.status === 'PREPARING').length,
        readyOrders: allOrders.filter(o => o.status === 'READY').length,
        deliveringOrders: allOrders.filter(o => ['DELIVERING', 'PICKED_UP'].includes(o.status)).length,
        completedOrders: allOrders.filter(o => o.status === 'DELIVERED').length,
        cancelledOrders: allOrders.filter(o => o.status === 'CANCELLED').length,
        totalRevenue: allOrders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + Number(o.total), 0),
        averageOrderValue: allOrders.length > 0 ? allOrders.reduce((sum, o) => sum + Number(o.total), 0) / allOrders.length : 0,
        averagePreparationTime: 35,
    };

    return { data: stats };
}

function mapOrderFromDB(row: Record<string, unknown>): Order {
    return {
        id: row.id as string,
        userId: row.user_id as string,
        restaurantId: row.restaurant_id as string,
        restaurantName: row.restaurant_name as string,
        status: row.status as OrderStatus,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items as Order['items'],
        address: typeof row.address === 'string' ? JSON.parse(row.address) : row.address as Order['address'],
        subtotal: Number(row.subtotal),
        deliveryFee: Number(row.delivery_fee),
        discount: Number(row.discount),
        total: Number(row.total),
        paymentMethod: row.payment_method as Order['paymentMethod'],
        changeFor: row.change_for as number | null,
        couponCode: row.coupon_code as string | null,
        observation: row.observation as string | null,
        estimatedDelivery: row.estimated_delivery as string | null,
        preparedAt: row.prepared_at as string | null,
        deliveredAt: row.delivered_at as string | null,
        cancelledAt: row.cancelled_at as string | null,
        cancellationReason: row.cancellation_reason as string | null,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
    };
}