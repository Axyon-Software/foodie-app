// src/components/restaurant/MenuItemModal.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Minus, Plus } from 'lucide-react';
import { MenuItem } from '@/types';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils/format.utils';
import { MENU_ITEM_CONFIG, MENU_MESSAGES } from '@/lib/constants/menu.constants';

interface MenuItemModalProps {
    item: MenuItem;
    isOpen: boolean;
    onClose: () => void;
    initialQuantity?: number;
    initialObservation?: string;
    mode?: 'add' | 'edit';
}

export default function MenuItemModal({
                                          item,
                                          isOpen,
                                          onClose,
                                          initialQuantity = 1,
                                          initialObservation = '',
                                          mode = 'add',
                                      }: MenuItemModalProps) {
    const { addItem } = useCart();

    const [quantity, setQuantity] = useState(initialQuantity);
    const [observation, setObservation] = useState(initialObservation);

    useEffect(() => {
        if (isOpen) {
            setQuantity(initialQuantity);
            setObservation(initialObservation);
        }
    }, [isOpen, initialQuantity, initialObservation]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const totalPrice = item.price * quantity;

    const handleQuantityChange = (delta: number): void => {
        setQuantity((prev) => {
            const newValue = prev + delta;
            if (newValue < MENU_ITEM_CONFIG.minQuantity) return MENU_ITEM_CONFIG.minQuantity;
            if (newValue > MENU_ITEM_CONFIG.maxQuantity) return MENU_ITEM_CONFIG.maxQuantity;
            return newValue;
        });
    };

    const handleAddToCart = (): void => {
        addItem(item, quantity, observation.trim() || undefined);
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent): void => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div
                className="w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-hidden animate-slide-up"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
                {/* Imagem do Item */}
                <div className="relative h-48 sm:h-64">
                    <Image
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                    />

                    {/* Botão Fechar */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors hover:opacity-80"
                        style={{
                            backgroundColor: 'var(--color-bg-card)',
                            color: 'var(--color-text)',
                        }}
                        aria-label="Fechar"
                    >
                        <X size={20} />
                    </button>

                    {/* Badge Popular */}
                    {item.popular && (
                        <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">
              🔥 Popular
            </span>
                    )}
                </div>

                {/* Conteúdo */}
                <div className="p-6">
                    {/* Nome e Descrição */}
                    <h2
                        className="text-2xl font-bold mb-2"
                        style={{ color: 'var(--color-text)' }}
                    >
                        {item.name}
                    </h2>
                    <p
                        className="mb-4"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        {item.description}
                    </p>

                    {/* Preço Unitário */}
                    <p className="text-[#00A082] font-bold text-xl mb-6">
                        {formatPrice(item.price)}
                    </p>

                    {/* Observações */}
                    <div className="mb-6">
                        <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: 'var(--color-text)' }}
                        >
                            {MENU_MESSAGES.observation}
                            <span
                                className="font-normal ml-2"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                ({MENU_MESSAGES.optional})
              </span>
                        </label>
                        <textarea
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            placeholder={MENU_MESSAGES.observationPlaceholder}
                            maxLength={MENU_ITEM_CONFIG.maxObservationLength}
                            rows={2}
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A082] focus:border-transparent resize-none transition-colors"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text)'
                            }}
                        />
                        <p
                            className="text-xs mt-1 text-right"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {observation.length}/{MENU_ITEM_CONFIG.maxObservationLength}
                        </p>
                    </div>
                </div>

                {/* Footer Fixo */}
                <div
                    className="sticky bottom-0 border-t p-4 transition-colors"
                    style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border)'
                    }}
                >
                    <div className="flex items-center gap-4">
                        {/* Controle de Quantidade */}
                        <div
                            className="flex items-center gap-3 rounded-full p-1"
                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                        >
                            <button
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= MENU_ITEM_CONFIG.minQuantity}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ color: 'var(--color-text)' }}
                                aria-label="Diminuir quantidade"
                            >
                                <Minus size={20} />
                            </button>

                            <span
                                className="font-bold text-lg w-8 text-center"
                                style={{ color: 'var(--color-text)' }}
                            >
                {quantity}
              </span>

                            <button
                                onClick={() => handleQuantityChange(1)}
                                disabled={quantity >= MENU_ITEM_CONFIG.maxQuantity}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ color: 'var(--color-text)' }}
                                aria-label="Aumentar quantidade"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* Botão Adicionar */}
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 bg-[#00A082] text-white py-4 rounded-full font-semibold hover:bg-[#008F74] transition-colors flex items-center justify-center gap-2"
                        >
                            <span>{mode === 'edit' ? MENU_MESSAGES.updateCart : MENU_MESSAGES.addToCart}</span>
                            <span className="font-bold">{formatPrice(totalPrice)}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}