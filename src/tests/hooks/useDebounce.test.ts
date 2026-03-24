
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../../hooks/useDebounce';

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should return initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('initial', 500));

        expect(result.current).toBe('initial');
    });

    it('should debounce value after delay', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'initial', delay: 500 } }
        );

        expect(result.current).toBe('initial');

        rerender({ value: 'updated', delay: 500 });

        expect(result.current).toBe('initial');

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe('updated');
    });

    it('should use default delay of 300ms', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value),
            { initialProps: { value: 'initial' } }
        );

        expect(result.current).toBe('initial');

        rerender({ value: 'updated' });

        expect(result.current).toBe('initial');

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current).toBe('updated');
    });

    it('should debounce with rapid value changes', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'initial', delay: 500 } }
        );

        rerender({ value: 'first', delay: 500 });
        rerender({ value: 'second', delay: 500 });
        rerender({ value: 'third', delay: 500 });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe('third');
    });

    it('should handle different types', () => {
        const { result: numberResult } = renderHook(() => useDebounce(123, 300));
        expect(numberResult.current).toBe(123);

        const { result: arrayResult } = renderHook(() => useDebounce([1, 2, 3], 300));
        expect(arrayResult.current).toEqual([1, 2, 3]);

        const { result: objectResult } = renderHook(() => useDebounce({ key: 'value' }, 300));
        expect(objectResult.current).toEqual({ key: 'value' });
    });

    it('should handle object type', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: { name: 'test' }, delay: 500 } }
        );

        expect(result.current).toEqual({ name: 'test' });

        rerender({ value: { name: 'updated' }, delay: 500 });

        expect(result.current).toEqual({ name: 'test' });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toEqual({ name: 'updated' });
    });
});
