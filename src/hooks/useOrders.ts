// src/hooks/useOrders.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { OrderData } from '@/types';

const ORDERS_STORAGE_KEY = 'foodie-orders';

export function useOrders() {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Hidratar do localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
            if (stored) {
                setOrders(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
        setIsHydrated(true);
    }, []);

    // Persistir no localStorage
    useEffect(() => {
        if (isHydrated) {
            try {
                localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
            } catch (error) {
                console.error('Error saving orders:', error);
            }
        }
    }, [orders, isHydrated]);

    const addOrder = useCallback((order: OrderData): void => {
        setOrders((prev) => [order, ...prev]);
    }, []);

    const getOrderById = useCallback((id: string): OrderData | undefined => {
        return orders.find((order) => order.id === id);
    }, [orders]);

    const updateOrderStatus = useCallback((
        id: string,
        status: OrderData['status']
    ): void => {
        setOrders((prev) =>
            prev.map((order) =>
                order.id === id ? { ...order, status } : order
            )
        );
    }, []);

    return {
        orders,
        addOrder,
        getOrderById,
        updateOrderStatus,
        isHydrated,
    };
}
