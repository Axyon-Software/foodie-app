// src/hooks/useAddressFromCep.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAddressByCep, AddressFromCep } from '@/lib/services/viacep';
import { useDebounce } from './useDebounce';

interface UseAddressFromCepOptions {
    debounceMs?: number;
}

interface UseAddressFromCepResult {
    address: AddressFromCep | null;
    loading: boolean;
    error: string | null;
    search: (cep: string) => void;
    clear: () => void;
}

export function useAddressFromCep(
    onAddressFound?: (address: AddressFromCep) => void,
    options: UseAddressFromCepOptions = {}
): UseAddressFromCepResult {
    const { debounceMs = 500 } = options;

    const [cep, setCep] = useState('');
    const [address, setAddress] = useState<AddressFromCep | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const debouncedCep = useDebounce(cep, debounceMs);

    const search = useCallback((newCep: string) => {
        setCep(newCep);
        setError(null);
    }, []);

    const clear = useCallback(() => {
        setCep('');
        setAddress(null);
        setError(null);
    }, []);

    useEffect(() => {
        if (!debouncedCep || debouncedCep.replace(/\D/g, '').length !== 8) {
            return;
        }

        let cancelled = false;

        const fetchAddress = async () => {
            setLoading(true);
            setError(null);

            const result = await fetchAddressByCep(debouncedCep);

            if (cancelled) return;

            if (result.error) {
                setError(result.error);
                setAddress(null);
            } else if (result.data) {
                setAddress(result.data);
                setError(null);
                onAddressFound?.(result.data);
            }

            setLoading(false);
        };

        fetchAddress();

        return () => {
            cancelled = true;
        };
    }, [debouncedCep, onAddressFound]);

    return { address, loading, error, search, clear };
}