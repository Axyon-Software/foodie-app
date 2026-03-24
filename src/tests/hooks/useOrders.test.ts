
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOrders } from '../../hooks/useOrders';
import { OrderData } from '@/types';

const ORDERS_STORAGE_KEY = 'foodie-orders';

const mockOrder: OrderData = {
    id: 'ABC123',
    items: [],
    address: {
        id: '1',
        street: 'Rua Teste',
        number: '123',
        complement: '',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
    },
    paymentMethod: 'PIX',
    subtotal: 59.80,
    deliveryFee: 5.99,
    discount: 0,
    total: 65.79,
    restaurantId: '1',
    restaurantName: 'Test Restaurant',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
};

describe('useOrders', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should start with empty orders', () => {
        const { result } = renderHook(() => useOrders());

        expect(result.current.orders).toEqual([]);
    });

    it('should load orders from localStorage', () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
            JSON.stringify([mockOrder])
        );

        const { result } = renderHook(() => useOrders());

        expect(result.current.orders).toHaveLength(1);
        expect(result.current.orders[0].id).toBe('ABC123');
    });

    it('should handle empty localStorage', () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);

        const { result } = renderHook(() => useOrders());

        expect(result.current.orders).toEqual([]);
    });

    it('should handle invalid JSON in localStorage', () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('invalid-json');

        const { result } = renderHook(() => useOrders());

        expect(result.current.orders).toEqual([]);
    });

    it('should add order to beginning of list', () => {
        const { result } = renderHook(() => useOrders());

        act(() => {
            result.current.addOrder(mockOrder);
        });

        expect(result.current.orders).toHaveLength(1);
        expect(result.current.orders[0].id).toBe('ABC123');
    });

    it('should add multiple orders', () => {
        const { result } = renderHook(() => useOrders());

        const order1 = { ...mockOrder, id: 'order-1' };
        const order2 = { ...mockOrder, id: 'order-2' };

        act(() => {
            result.current.addOrder(order1);
            result.current.addOrder(order2);
        });

        expect(result.current.orders).toHaveLength(2);
        expect(result.current.orders[0].id).toBe('order-2');
        expect(result.current.orders[1].id).toBe('order-1');
    });

    it('should get order by id', () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
            JSON.stringify([mockOrder])
        );

        const { result } = renderHook(() => useOrders());

        const found = result.current.getOrderById('ABC123');
        expect(found).toBeDefined();
        expect(found?.id).toBe('ABC123');
    });

    it('should return undefined for non-existent order', () => {
        const { result } = renderHook(() => useOrders());

        act(() => {
            result.current.addOrder(mockOrder);
        });

        const found = result.current.getOrderById('NON-EXISTENT');
        expect(found).toBeUndefined();
    });

    it('should update order status', () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
            JSON.stringify([mockOrder])
        );

        const { result } = renderHook(() => useOrders());

        act(() => {
            result.current.updateOrderStatus('ABC123', 'CONFIRMED');
        });

        expect(result.current.orders[0].status).toBe('CONFIRMED');
    });

    it('should update only specific order status', () => {
        const order1 = { ...mockOrder, id: 'order-1' };
        const order2 = { ...mockOrder, id: 'order-2' };

        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
            JSON.stringify([order1, order2])
        );

        const { result } = renderHook(() => useOrders());

        act(() => {
            result.current.updateOrderStatus('order-1', 'CONFIRMED');
        });

        expect(result.current.orders[0].status).toBe('CONFIRMED');
        expect(result.current.orders[1].status).toBe('PENDING');
    });

    it('should persist orders to localStorage', () => {
        const { result } = renderHook(() => useOrders());

        act(() => {
            result.current.addOrder(mockOrder);
        });

        expect(localStorage.setItem).toHaveBeenCalledWith(
            ORDERS_STORAGE_KEY,
            expect.any(String)
        );
    });
});
