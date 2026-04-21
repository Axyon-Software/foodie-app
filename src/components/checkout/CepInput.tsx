// src/components/checkout/CepInput.tsx
'use client';

import { useState, useCallback } from 'react';
import { Loader2, MapPinOff } from 'lucide-react';
import { useAddressFromCep } from '@/hooks/useAddressFromCep';
import { formatZipCodeInput } from '@/lib/utils/address.utils';

interface CepInputProps {
    onAddressFound?: (address: {
        street: string;
        neighborhood: string;
        city: string;
        state: string;
    }) => void;
    label?: string;
    placeholder?: string;
}

export default function CepInput({
    onAddressFound,
    label = 'CEP',
    placeholder = '00000-000',
}: CepInputProps) {
    const [cep, setCep] = useState('');
    const [showLink, setShowLink] = useState(false);

    const { address, loading, error, search, clear } = useAddressFromCep(
        (found) => {
            onAddressFound?.(found);
            setShowLink(false);
        },
        { debounceMs: 500 }
    );

    const handleChange = useCallback((value: string) => {
        const formatted = formatZipCodeInput(value);
        setCep(formatted);

        const digits = value.replace(/\D/g, '');
        if (digits.length < 8) {
            setShowLink(true);
        }
    }, []);

    const handleBlur = useCallback(() => {
        if (cep.replace(/\D/g, '').length === 8) {
            search(cep);
        }
    }, [cep, search]);

    const handleClear = useCallback(() => {
        setCep('');
        clear();
        setShowLink(true);
    }, [clear]);

    const inputBaseStyles =
        'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A082] transition-colors';

    const getInputStyle = (hasError: boolean) => ({
        backgroundColor: 'var(--color-bg-input)',
        color: 'var(--color-text)',
        borderColor: hasError ? 'var(--color-error)' : 'var(--color-border)',
    });

    return (
        <div className="space-y-2">
            <label
                className="block text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
            >
                {label}
            </label>

            <div className="relative">
                <input
                    type="text"
                    value={cep}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    maxLength={9}
                    className={inputBaseStyles}
                    style={getInputStyle(!!error)}
                />

                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2
                            className="animate-spin text-[#00A082]"
                            size={20}
                        />
                    </div>
                )}

                {cep && !loading && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        ×
                    </button>
                )}
            </div>

            {error && (
                <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                    {error}
                </p>
            )}

            {address && (
                <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                >
                    <p
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                            {address.street}
                        </span>
                        {address.neighborhood && `, ${address.neighborhood}`}
                    </p>
                    <p
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        {address.city} - {address.state}
                    </p>
                </div>
            )}

            {showLink && !loading && !address && !error && (
                <a
                    href="https://buscacep.correios.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm hover:underline"
                    style={{ color: 'var(--color-text-tertiary)' }}
                >
                    <MapPinOff size={14} />
                    Não sei meu CEP
                </a>
            )}
        </div>
    );
}