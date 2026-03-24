// src/components/checkout/CardForm.tsx
'use client';

import { useState, useCallback } from 'react';
import { CreditCard, Lock, Check } from 'lucide-react';
import { CardDetails } from '@/types/payment.types';

interface CardFormProps {
    cardDetails: CardDetails | null;
    onCardChange: (details: CardDetails | null) => void;
    error?: string;
}

export default function CardForm({ cardDetails, onCardChange, error }: CardFormProps) {
    const [localCard, setLocalCard] = useState<CardDetails>(
        cardDetails || {
            number: '',
            expiry: '',
            cvc: '',
            name: '',
            saveCard: false,
        }
    );

    const formatCardNumber = useCallback((value: string): string => {
        const v = value.replace(/\D/g, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    }, []);

    const formatExpiry = useCallback((value: string): string => {
        const v = value.replace(/\D/g, '');
        if (v.length >= 2) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        }
        return v;
    }, []);

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value);
        const newCard = { ...localCard, number: formatted };
        setLocalCard(newCard);
        onCardChange(newCard);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatExpiry(e.target.value);
        const newCard = { ...localCard, expiry: formatted };
        setLocalCard(newCard);
        onCardChange(newCard);
    };

    const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value.replace(/\D/g, '').substring(0, 4);
        const newCard = { ...localCard, cvc: v };
        setLocalCard(newCard);
        onCardChange(newCard);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCard = { ...localCard, name: e.target.value.toUpperCase() };
        setLocalCard(newCard);
        onCardChange(newCard);
    };

    const getCardBrand = (): string => {
        const number = localCard.number.replace(/\D/g, '');
        if (number.startsWith('4')) return 'Visa';
        if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
        if (number.startsWith('6')) return 'Elo';
        if (number.startsWith('34') || number.startsWith('37')) return 'Amex';
        return '';
    };

    const isValid = (): boolean => {
        const number = localCard.number.replace(/\D/g, '');
        const expiry = localCard.expiry.replace(/\D/g, '');
        return (
            number.length >= 13 &&
            number.length <= 19 &&
            expiry.length === 4 &&
            localCard.cvc.length >= 3 &&
            localCard.name.length >= 2
        );
    };

    const brand = getCardBrand();
    const valid = isValid();

    return (
        <div
            className="space-y-4"
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
            {/* Número do cartão */}
            <div>
                <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    Número do cartão
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={localCard.number}
                        onChange={handleCardNumberChange}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className="w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A082] transition-colors"
                        style={{
                            backgroundColor: 'var(--color-bg-input)',
                            color: 'var(--color-text)',
                            borderColor: 'var(--color-border)',
                        }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {brand === 'Visa' && <span className="text-xl">💳</span>}
                        {brand === 'Mastercard' && <span className="text-xl">💳</span>}
                        {brand === 'Elo' && <span className="text-xl">💳</span>}
                        {!brand && <CreditCard size={20} style={{ color: 'var(--color-text-tertiary)' }} />}
                    </div>
                </div>
            </div>

            {/* Validade e CVV */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        Validade
                    </label>
                    <input
                        type="text"
                        value={localCard.expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A082] transition-colors"
                        style={{
                            backgroundColor: 'var(--color-bg-input)',
                            color: 'var(--color-text)',
                            borderColor: 'var(--color-border)',
                        }}
                    />
                </div>
                <div>
                    <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        CVV
                    </label>
                    <input
                        type="text"
                        value={localCard.cvc}
                        onChange={handleCvcChange}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A082] transition-colors"
                        style={{
                            backgroundColor: 'var(--color-bg-input)',
                            color: 'var(--color-text)',
                            borderColor: 'var(--color-border)',
                        }}
                    />
                </div>
            </div>

            {/* Nome do titular */}
            <div>
                <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    Nome do titular
                </label>
                <input
                    type="text"
                    value={localCard.name}
                    onChange={handleNameChange}
                    placeholder="NOME COMO NO CARTÃO"
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A082] transition-colors"
                    style={{
                        backgroundColor: 'var(--color-bg-input)',
                        color: 'var(--color-text)',
                        borderColor: 'var(--color-border)',
                    }}
                />
            </div>

            {/* Salvar cartão */}
            <label className="flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={localCard.saveCard}
                    onChange={(e) => {
                        const newCard = { ...localCard, saveCard: e.target.checked };
                        setLocalCard(newCard);
                        onCardChange(newCard);
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-[#00A082] focus:ring-[#00A082]"
                />
                <span style={{ color: 'var(--color-text-secondary)' }}>
                    Salvar cartão para próximas compras
                </span>
            </label>

            {/* Validação visual */}
            {valid && (
                <div
                    className="flex items-center gap-2 p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(0, 160, 130, 0.1)' }}
                >
                    <Check size={16} className="text-[#00A082]" />
                    <span className="text-sm text-[#00A082]">Dados do cartão válidos</span>
                </div>
            )}

            {error && (
                <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                    {error}
                </p>
            )}

            {/* Segurança */}
            <div
                className="flex items-center gap-2 text-xs"
                style={{ color: 'var(--color-text-tertiary)' }}
            >
                <Lock size={14} />
                <span>Seus dados são criptografados e seguros</span>
            </div>
        </div>
    );
}
