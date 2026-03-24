// src/components/checkout/PaymentForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { PaymentMethod } from '@/types';
import { CardDetails } from '@/types/payment.types';
import { PAYMENT_OPTIONS, CHECKOUT_MESSAGES } from '@/lib/constants/checkout.constants';
import CardForm from './CardForm';
import PixQRCode from './PixQRCode';
import { PixPaymentDetails } from '@/types/payment.types';
import { createPixPayment } from '@/actions/payments';

interface PaymentFormProps {
    selectedMethod: PaymentMethod | null;
    changeFor: string;
    error?: string;
    totalAmount: number;
    onMethodChange: (method: PaymentMethod) => void;
    onChangeForChange: (value: string) => void;
}

export default function PaymentForm({
    selectedMethod,
    changeFor,
    error,
    totalAmount,
    onMethodChange,
    onChangeForChange,
}: PaymentFormProps) {
    const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
    const [cardError, setCardError] = useState<string>('');
    const [pixDetails, setPixDetails] = useState<PixPaymentDetails | null>(null);
    const [isGeneratingPix, setIsGeneratingPix] = useState(false);
    const [showCardForm, setShowCardForm] = useState(false);
    const [showPixForm, setShowPixForm] = useState(false);

    const isCardPayment = selectedMethod === 'CREDIT_CARD' || selectedMethod === 'DEBIT_CARD';
    const isPixPayment = selectedMethod === 'PIX';
    const isCashPayment = selectedMethod === 'CASH';

    useEffect(() => {
        if (selectedMethod === 'PIX' && !pixDetails && !isGeneratingPix) {
            handleGeneratePix();
        }
    }, [selectedMethod]);

    const handleGeneratePix = async () => {
        setIsGeneratingPix(true);
        const result = await createPixPayment(totalAmount, 'pending-order');
        if (result.data) {
            setPixDetails(result.data);
        }
        setIsGeneratingPix(false);
    };

    const handleMethodSelect = (method: PaymentMethod) => {
        onMethodChange(method);
        setShowCardForm(method === 'CREDIT_CARD' || method === 'DEBIT_CARD');
        setShowPixForm(method === 'PIX');
        
        if (method === 'CASH') {
            setShowCardForm(false);
            setShowPixForm(false);
        }
        
        if (method !== 'CREDIT_CARD' && method !== 'DEBIT_CARD') {
            setCardDetails(null);
            setCardError('');
        }
        if (method !== 'PIX') {
            setPixDetails(null);
        }
    };

    return (
        <div
            className="rounded-2xl border overflow-hidden transition-colors"
            style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
            }}
        >
            {/* Header */}
            <div
                className="flex items-center gap-3 p-4 border-b transition-colors"
                style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border)',
                }}
            >
                <div className="w-10 h-10 bg-[#00A082] rounded-full flex items-center justify-center">
                    <CreditCard size={20} className="text-white" />
                </div>
                <h2
                    className="font-bold text-lg"
                    style={{ color: 'var(--color-text)' }}
                >
                    {CHECKOUT_MESSAGES.paymentTitle}
                </h2>
            </div>

            {/* Opções de pagamento */}
            <div className="p-4 space-y-3">
                {PAYMENT_OPTIONS.map((option) => {
                    const isSelected = selectedMethod === option.value;

                    return (
                        <label
                            key={option.value}
                            className="flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all"
                            style={{
                                borderColor: isSelected
                                    ? 'var(--color-primary)'
                                    : 'var(--color-border)',
                                backgroundColor: isSelected
                                    ? 'var(--color-primary-light)'
                                    : 'transparent',
                            }}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={option.value}
                                checked={isSelected}
                                onChange={() => handleMethodSelect(option.value)}
                                className="sr-only"
                            />

                            {/* Ícone */}
                            <span className="text-2xl">{option.icon}</span>

                            {/* Info */}
                            <div className="flex-1">
                                <p
                                    className="font-medium"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    {option.label}
                                </p>
                                {option.description && (
                                    <p
                                        className="text-sm"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        {option.description}
                                    </p>
                                )}
                            </div>

                            {/* Radio visual */}
                            <div
                                className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                style={{
                                    borderColor: isSelected
                                        ? 'var(--color-primary)'
                                        : 'var(--color-text-tertiary)',
                                }}
                            >
                                {isSelected && (
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                    />
                                )}
                            </div>
                        </label>
                    );
                })}

                {error && (
                    <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                        {error}
                    </p>
                )}

                {/* Formulário de Cartão */}
                {showCardForm && (
                    <div className="mt-4">
                        <CardForm
                            cardDetails={cardDetails}
                            onCardChange={setCardDetails}
                            error={cardError}
                        />
                    </div>
                )}

                {/* QR Code Pix */}
                {showPixForm && (
                    <div className="mt-4">
                        <PixQRCode
                            pixDetails={pixDetails}
                            amount={totalAmount}
                            onGenerateNew={handleGeneratePix}
                            isGenerating={isGeneratingPix}
                        />
                    </div>
                )}

                {/* Campo de troco (só aparece se for dinheiro) */}
                {isCashPayment && (
                    <div
                        className="mt-4 p-4 rounded-xl transition-colors"
                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                    >
                        <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {CHECKOUT_MESSAGES.changeFor}
                        </label>
                        <div className="flex items-center gap-3">
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                                R$
                            </span>
                            <input
                                type="number"
                                value={changeFor}
                                onChange={(e) => onChangeForChange(e.target.value)}
                                placeholder={CHECKOUT_MESSAGES.changeForPlaceholder}
                                min="0"
                                step="0.01"
                                className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A082] transition-colors"
                                style={{
                                    backgroundColor: 'var(--color-bg-input)',
                                    color: 'var(--color-text)',
                                    borderColor: 'var(--color-border)',
                                }}
                            />
                        </div>
                        <label className="flex items-center gap-2 mt-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={changeFor === ''}
                                onChange={(e) =>
                                    onChangeForChange(e.target.checked ? '' : '0')
                                }
                                className="w-4 h-4 rounded border-gray-300 text-[#00A082] focus:ring-[#00A082]"
                            />
                            <span
                                className="text-sm"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                {CHECKOUT_MESSAGES.noChangeNeeded}
                            </span>
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}
