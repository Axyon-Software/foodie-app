
import { describe, it, expect } from 'vitest';
import {
    calculateSubtotal,
    calculateTotalItems,
    calculateCartSummary
} from '@/lib/utils/cart.utils';
import { mockCartItem, mockMenuItem } from '@/tests/utils/mock-data';

describe('cart.utils', () => {
    describe('calculateSubtotal', () => {
        it('should calculate subtotal correctly', () => {
            const items = [
                { menuItem: { ...mockMenuItem, price: 10 }, quantity: 2 },
                { menuItem: { ...mockMenuItem, price: 15 }, quantity: 1 },
            ];

            expect(calculateSubtotal(items)).toBe(35);
        });

        it('should return 0 for empty cart', () => {
            expect(calculateSubtotal([])).toBe(0);
        });
    });

    describe('calculateTotalItems', () => {
        it('should count total items', () => {
            const items = [
                { menuItem: mockMenuItem, quantity: 2 },
                { menuItem: mockMenuItem, quantity: 3 },
            ];

            expect(calculateTotalItems(items)).toBe(5);
        });
    });

    describe('calculateCartSummary', () => {
        it('should calculate complete summary', () => {
            const items = [{ menuItem: { ...mockMenuItem, price: 50 }, quantity: 2 }];
            const summary = calculateCartSummary(items, 5.99, 10);

            expect(summary.subtotal).toBe(100);
            expect(summary.deliveryFee).toBe(5.99);
            expect(summary.discount).toBe(10);
            expect(summary.total).toBe(95.99);
            expect(summary.itemCount).toBe(2);
        });

        it('should not allow negative total', () => {
            const items = [{ menuItem: { ...mockMenuItem, price: 10 }, quantity: 1 }];
            const summary = calculateCartSummary(items, 0, 50);

            expect(summary.total).toBe(0);
        });
    });
});