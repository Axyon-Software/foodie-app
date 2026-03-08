
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '../../hooks/useFavorites';

const FAVORITES_STORAGE_KEY = 'foodie-favorites';

describe('useFavorites', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should start with empty favorites', () => {
        const { result } = renderHook(() => useFavorites());

        expect(result.current.favorites).toEqual([]);
    });

    it('should load favorites from localStorage', () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
            JSON.stringify(['restaurant-1', 'restaurant-2'])
        );

        const { result } = renderHook(() => useFavorites());

        expect(result.current.favorites).toEqual(['restaurant-1', 'restaurant-2']);
    });

    it('should handle empty localStorage', () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);

        const { result } = renderHook(() => useFavorites());

        expect(result.current.favorites).toEqual([]);
    });

    it('should handle invalid JSON in localStorage', () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('invalid-json');

        const { result } = renderHook(() => useFavorites());

        expect(result.current.favorites).toEqual([]);
    });

    it('should add favorite', () => {
        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current.addFavorite('restaurant-1');
        });

        expect(result.current.favorites).toContain('restaurant-1');
        expect(localStorage.setItem).toHaveBeenCalledWith(
            FAVORITES_STORAGE_KEY,
            JSON.stringify(['restaurant-1'])
        );
    });

    it('should not add duplicate favorite', () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
            JSON.stringify(['restaurant-1'])
        );

        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current.addFavorite('restaurant-1');
        });

        expect(result.current.favorites).toHaveLength(1);
    });

    it('should remove favorite', () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
            JSON.stringify(['restaurant-1', 'restaurant-2'])
        );

        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current.removeFavorite('restaurant-1');
        });

        expect(result.current.favorites).not.toContain('restaurant-1');
        expect(result.current.favorites).toContain('restaurant-2');
    });

    it('should toggle favorite - add when not favorited', async () => {
        const { result } = renderHook(() => useFavorites());

        await act(async () => {
            result.current.addFavorite('restaurant-1');
        });

        expect(result.current.favorites).toContain('restaurant-1');
    });

    it('should toggle favorite - remove when favorited', async () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
            JSON.stringify(['restaurant-1'])
        );

        const { result } = renderHook(() => useFavorites());

        await act(async () => {
            result.current.removeFavorite('restaurant-1');
        });

        expect(result.current.favorites).not.toContain('restaurant-1');
    });

    it('should check if restaurant is favorite', () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
            JSON.stringify(['restaurant-1', 'restaurant-2'])
        );

        const { result } = renderHook(() => useFavorites());

        expect(result.current.isFavorite('restaurant-1')).toBe(true);
        expect(result.current.isFavorite('restaurant-3')).toBe(false);
    });

    it('should persist favorites to localStorage', () => {
        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current.addFavorite('restaurant-1');
            result.current.addFavorite('restaurant-2');
        });

        expect(localStorage.setItem).toHaveBeenLastCalledWith(
            FAVORITES_STORAGE_KEY,
            JSON.stringify(['restaurant-1', 'restaurant-2'])
        );
    });
});
