import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider } from '../../contexts/CartContext';
import { useCart } from '../../hooks/useCart';
import { mockMenuItem } from '../utils/mock-data';

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
);

describe('useCart', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should start with empty cart', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        expect(result.current.items).toEqual([]);
        expect(result.current.totalItems).toBe(0);
        expect(result.current.totalPrice).toBe(0);
    });

    it('should add item to cart', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(mockMenuItem, 1);
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].menuItem.id).toBe(mockMenuItem.id);
        expect(result.current.items[0].quantity).toBe(1);
    });

    it('should add item with observation', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(mockMenuItem, 1, 'Sem cebola');
        });

        expect(result.current.items[0].observation).toBe('Sem cebola');
    });

    it('should increment quantity for same item', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(mockMenuItem, 1);
            result.current.addItem(mockMenuItem, 2);
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].quantity).toBe(3);
    });

    it('should treat items with different observations as separate', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(mockMenuItem, 1, 'Sem cebola');
            result.current.addItem(mockMenuItem, 1, 'Com extra queijo');
        });

        expect(result.current.items).toHaveLength(2);
    });

    it('should update quantity', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(mockMenuItem, 1);
        });

        act(() => {
            result.current.updateQuantity(mockMenuItem.id, 5);
        });

        expect(result.current.items[0].quantity).toBe(5);
    });

    it('should remove item when quantity is 0', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(mockMenuItem, 1);
        });

        act(() => {
            result.current.updateQuantity(mockMenuItem.id, 0);
        });

        expect(result.current.items).toHaveLength(0);
    });

    it('should remove specific item', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(mockMenuItem, 1);
        });

        act(() => {
            result.current.removeItem(mockMenuItem.id);
        });

        expect(result.current.items).toHaveLength(0);
    });

    it('should clear cart', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(mockMenuItem, 1);
            result.current.addItem({ ...mockMenuItem, id: '102' }, 2);
        });

        act(() => {
            result.current.clearCart();
        });

        expect(result.current.items).toHaveLength(0);
        expect(result.current.restaurantId).toBeNull();
    });

    it('should calculate total items', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(mockMenuItem, 2);
            result.current.addItem({ ...mockMenuItem, id: '102' }, 3);
        });

        expect(result.current.totalItems).toBe(5);
    });

    it('should calculate total price', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem({ ...mockMenuItem, price: 10 }, 2);
            result.current.addItem({ ...mockMenuItem, id: '102', price: 15 }, 1);
        });

        expect(result.current.totalPrice).toBe(35);
    });

    it('should apply coupon', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem({ ...mockMenuItem, price: 100 }, 1);
        });

        act(() => {
            const response = result.current.applyCoupon('DESCONTO10');
            expect(response.success).toBe(true);
        });

        expect(result.current.appliedCoupon?.code).toBe('DESCONTO10');
        expect(result.current.couponDiscount).toBe(10);
    });

    it('should reject invalid coupon', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(mockMenuItem, 1);
        });

        act(() => {
            const response = result.current.applyCoupon('INVALIDO');
            expect(response.success).toBe(false);
            expect(response.error).toBeDefined();
        });
    });

    it('should remove coupon', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem({ ...mockMenuItem, price: 100 }, 1);
            result.current.applyCoupon('DESCONTO10');
        });

        act(() => {
            result.current.removeCoupon();
        });

        expect(result.current.appliedCoupon).toBeNull();
        expect(result.current.couponDiscount).toBe(0);
    });
});