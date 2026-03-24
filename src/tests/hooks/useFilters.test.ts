// src/tests/hooks/useFilters.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilters } from '../../hooks/useFilters';
import { Restaurant } from '@/types';

const mockRestaurants: Restaurant[] = [
    {
        id: '1',
        name: 'Pizzaria Napoli',
        image: 'https://example.com/pizza.jpg',
        rating: 4.8,
        reviewCount: 150,
        deliveryTime: '30-45 min',
        deliveryFee: 5.99,
        category: 'Pizza',
        promoted: true,
        isOpen: true,
    },
    {
        id: '2',
        name: 'Hamburgueria Legal',
        image: 'https://example.com/burger.jpg',
        rating: 4.2,
        reviewCount: 80,
        deliveryTime: '20-35 min',
        deliveryFee: 0,
        category: 'Hambúrguer',
        promoted: false,
        isOpen: true,
    },
    {
        id: '3',
        name: 'Sushi Express',
        image: 'https://example.com/sushi.jpg',
        rating: 4.5,
        reviewCount: 200,
        deliveryTime: '40-55 min',
        deliveryFee: 8.99,
        category: 'Sushi',
        promoted: false,
        isOpen: true,
    },
    {
        id: '4',
        name: 'Pizzaria Roma',
        image: 'https://example.com/pizza2.jpg',
        rating: 3.8,
        reviewCount: 50,
        deliveryTime: '35-50 min',
        deliveryFee: 3.99,
        category: 'Pizza',
        promoted: false,
        isOpen: true,
    },
];

describe('useFilters', () => {
    it('should return all restaurants with default filters', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        expect(result.current.filteredRestaurants).toHaveLength(4);
    });

    it('should filter by search term', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        act(() => {
            result.current.updateFilter('search', 'pizza');
        });

        expect(result.current.filteredRestaurants).toHaveLength(2);
        expect(result.current.filteredRestaurants.map(r => r.name)).toContain('Pizzaria Napoli');
        expect(result.current.filteredRestaurants.map(r => r.name)).toContain('Pizzaria Roma');
    });

    it('should search in category as well', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        act(() => {
            result.current.updateFilter('search', 'sushi');
        });

        expect(result.current.filteredRestaurants).toHaveLength(1);
        expect(result.current.filteredRestaurants[0].name).toBe('Sushi Express');
    });

    it('should filter by category', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        act(() => {
            result.current.updateFilter('category', 'Pizza');
        });

        expect(result.current.filteredRestaurants).toHaveLength(2);
    });

    it('should filter by minimum rating', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        act(() => {
            result.current.updateFilter('minRating', 4.5);
        });

        expect(result.current.filteredRestaurants).toHaveLength(2);
        result.current.filteredRestaurants.forEach(r => {
            expect(r.rating).toBeGreaterThanOrEqual(4.5);
        });
    });

    it('should filter by free delivery only', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        act(() => {
            result.current.updateFilter('freeDeliveryOnly', true);
        });

        expect(result.current.filteredRestaurants).toHaveLength(1);
        expect(result.current.filteredRestaurants[0].name).toBe('Hamburgueria Legal');
    });

    it('should filter by max delivery fee', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        act(() => {
            result.current.updateFilter('maxDeliveryFee', 5);
        });

        expect(result.current.filteredRestaurants).toHaveLength(2);
    });

    it('should sort by rating', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        act(() => {
            result.current.updateFilter('sortBy', 'rating');
        });

        expect(result.current.filteredRestaurants[0].rating).toBe(4.8);
    });

    it('should sort by delivery time', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        act(() => {
            result.current.updateFilter('sortBy', 'delivery_time');
        });

        expect(result.current.filteredRestaurants[0].name).toBe('Hamburgueria Legal');
    });

    it('should sort by delivery fee', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        act(() => {
            result.current.updateFilter('sortBy', 'delivery_fee');
        });

        expect(result.current.filteredRestaurants[0].deliveryFee).toBe(0);
    });

    it('should sort by relevance - promoted first', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        act(() => {
            result.current.updateFilter('sortBy', 'relevance');
        });

        expect(result.current.filteredRestaurants[0].promoted).toBe(true);
    });

    it('should reset filters to default', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        act(() => {
            result.current.updateFilter('search', 'pizza');
            result.current.updateFilter('category', 'Pizza');
        });

        expect(result.current.filteredRestaurants).toHaveLength(2);

        act(() => {
            result.current.resetFilters();
        });

        expect(result.current.filteredRestaurants).toHaveLength(4);
    });

    it('should detect active filters', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        expect(result.current.hasActiveFilters).toBe(false);

        act(() => {
            result.current.updateFilter('search', 'test');
        });

        expect(result.current.hasActiveFilters).toBe(true);

        act(() => {
            result.current.resetFilters();
        });

        expect(result.current.hasActiveFilters).toBe(false);
    });

    it('should detect active filters for category', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        act(() => {
            result.current.updateFilter('category', 'Pizza');
        });

        expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should detect active filters for rating', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        act(() => {
            result.current.updateFilter('minRating', 4.0);
        });

        expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should combine multiple filters', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        act(() => {
            result.current.updateFilter('category', 'Pizza');
            result.current.updateFilter('minRating', 4.5);
        });

        expect(result.current.filteredRestaurants).toHaveLength(1);
        expect(result.current.filteredRestaurants[0].name).toBe('Pizzaria Napoli');
    });

    it('should return current filters state', () => {
        const { result } = renderHook(() => useFilters(mockRestaurants));

        act(() => {
            result.current.updateFilter('search', 'test');
        });

        expect(result.current.filters.search).toBe('test');
    });

    it('should handle empty restaurants array', () => {
        const { result } = renderHook(() => useFilters([]));

        expect(result.current.filteredRestaurants).toHaveLength(0);
    });
});
