import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

describe('useLocalStorage', () => {
    const TEST_KEY = 'test-key';

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should return initial value', () => {
        const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

        expect(result.current[0]).toBe('initial');
    });

    it('should load value from localStorage', () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('"stored-value"');

        const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

        expect(result.current[0]).toBe('stored-value');
    });

    it('should return initial value when localStorage is empty', () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);

        const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'default'));

        expect(result.current[0]).toBe('default');
    });

    it('should handle invalid JSON in localStorage', () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('invalid');

        const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'default'));

        expect(result.current[0]).toBe('default');
    });

    it('should update value', () => {
        const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

        act(() => {
            result.current[1]('updated');
        });

        expect(result.current[0]).toBe('updated');
        expect(localStorage.setItem).toHaveBeenCalledWith(
            TEST_KEY,
            '"updated"'
        );
    });

    it('should update value using function', () => {
        // Correção: Definindo explicitamente como <number> para evitar 'never'
        const { result } = renderHook(() => useLocalStorage<number>(TEST_KEY, 0));

        act(() => {
            result.current[1]((prev) => prev + 1);
        });

        expect(result.current[0]).toBe(1);
    });

    it('should persist object to localStorage', () => {
        // Correção: Definindo a interface para aceitar a nova propriedade 'value'
        interface TestObject {
            name: string;
            value?: number;
        }

        const { result } = renderHook(() =>
            useLocalStorage<TestObject>(TEST_KEY, { name: 'test' })
        );

        act(() => {
            result.current[1]({ name: 'updated', value: 123 });
        });

        expect(result.current[0]).toEqual({ name: 'updated', value: 123 });
        expect(localStorage.setItem).toHaveBeenCalledWith(
            TEST_KEY,
            JSON.stringify({ name: 'updated', value: 123 })
        );
    });

    it('should persist array to localStorage', () => {

        const { result } = renderHook(() => useLocalStorage<number[]>(TEST_KEY, []));

        act(() => {
            result.current[1]([1, 2, 3]);
        });

        expect(result.current[0]).toEqual([1, 2, 3]);
        expect(localStorage.setItem).toHaveBeenCalledWith(
            TEST_KEY,
            JSON.stringify([1, 2, 3])
        );
    });

    it('should handle number type', () => {
        const { result } = renderHook(() => useLocalStorage<number>(TEST_KEY, 0));

        act(() => {
            result.current[1](42);
        });

        expect(result.current[0]).toBe(42);
    });

    it('should handle boolean type', () => {
        const { result } = renderHook(() => useLocalStorage<boolean>(TEST_KEY, false));

        act(() => {
            result.current[1](true);
        });

        expect(result.current[0]).toBe(true);
    });

    it('should use different keys independently', () => {
        const { result: result1 } = renderHook(() => useLocalStorage('key1', 'value1'));
        const { result: result2 } = renderHook(() => useLocalStorage('key2', 'value2'));

        expect(result1.current[0]).toBe('value1');
        expect(result2.current[0]).toBe('value2');

        act(() => {
            result1.current[1]('updated1');
        });

        expect(result1.current[0]).toBe('updated1');
        expect(result2.current[0]).toBe('value2');
    });

    it('should update value when value changes', () => {
        localStorage.clear();
        vi.clearAllMocks();
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);

        const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

        act(() => {
            result.current[1]('updated');
        });

        expect(localStorage.setItem).toHaveBeenCalledWith(TEST_KEY, '"updated"');
    });
});