// src/components/checkout/PixQRCode.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, RefreshCw, Check, Clock } from 'lucide-react';
import { PixPaymentDetails } from '@/types/payment.types';
import { formatPrice } from '@/lib/utils/format.utils';

interface PixQRCodeProps {
    pixDetails: PixPaymentDetails | null;
    amount: number;
    onGenerateNew: () => void;
    isGenerating: boolean;
}

export default function PixQRCode({
    pixDetails,
    amount,
    onGenerateNew,
    isGenerating,
}: PixQRCodeProps) {
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (pixDetails?.expiresAt) {
            const updateTimeLeft = () => {
                const now = new Date();
                const expires = new Date(pixDetails.expiresAt);
                const diff = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / 1000));
                setTimeLeft(diff);
            };

            updateTimeLeft();
            timerRef.current = setInterval(updateTimeLeft, 1000);

            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }
    }, [pixDetails?.expiresAt]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCopyPixKey = async () => {
        if (pixDetails?.pixKey) {
            await navigator.clipboard.writeText(pixDetails.pixKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const isExpired = timeLeft <= 0;

    if (isGenerating && !pixDetails) {
        return (
            <div
                className="flex flex-col items-center justify-center p-8"
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
                <RefreshCw size={32} className="animate-spin text-[#00A082] mb-4" />
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Gerando QR Code Pix...
                </p>
            </div>
        );
    }

    if (isExpired && pixDetails) {
        return (
            <div
                className="p-6 text-center"
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
                <Clock size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="font-medium mb-4" style={{ color: 'var(--color-text)' }}>
                    QR Code expirado
                </p>
                <button
                    onClick={onGenerateNew}
                    className="px-6 py-3 bg-[#00A082] text-white rounded-xl font-medium hover:bg-[#008F74] transition-colors"
                >
                    Gerar novo QR Code
                </button>
            </div>
        );
    }

    if (!pixDetails) return null;

    return (
        <div
            className="space-y-4"
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
            {/* QR Code */}
            <div className="flex flex-col items-center p-6">
                <div className="bg-white p-4 rounded-xl">
                    <QRCodeSVG
                        value={pixDetails.qrCode}
                        size={180}
                        level="M"
                        includeMargin
                    />
                </div>
                <p className="mt-4 font-medium" style={{ color: 'var(--color-text)' }}>
                    Escaneie com seu banco
                </p>
            </div>

            {/* Valor */}
            <div
                className="text-center py-3 border-y"
                style={{ borderColor: 'var(--color-border)' }}
            >
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Valor do Pix
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {formatPrice(amount)}
                </p>
            </div>

            {/* Chave Pix */}
            <div className="p-4">
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Chave Pix (copie e cole):
                </p>
                <div
                    className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                    <code
                        className="flex-1 text-sm break-all"
                        style={{ color: 'var(--color-text)' }}
                    >
                        {pixDetails.pixKey}
                    </code>
                    <button
                        onClick={handleCopyPixKey}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {copied ? (
                            <Check size={20} className="text-green-500" />
                        ) : (
                            <Copy size={20} style={{ color: 'var(--color-text-tertiary)' }} />
                        )}
                    </button>
                </div>
            </div>

            {/* Tempo restante */}
            <div className="flex items-center justify-center gap-2 pb-4">
                <Clock size={16} style={{ color: timeLeft < 60 ? 'var(--color-error)' : 'var(--color-text-tertiary)' }} />
                <span
                    className="text-sm"
                    style={{ color: timeLeft < 60 ? 'var(--color-error)' : 'var(--color-text-tertiary)' }}
                >
                    Expira em {formatTime(timeLeft)}
                </span>
            </div>

            {/* Instruções */}
            <div
                className="p-4 text-sm space-y-2"
                style={{ color: 'var(--color-text-secondary)' }}
            >
                <p>• Abra o app do seu banco</p>
                <p>• Escolha pagar via Pix</p>
                <p>• Escaneie o QR Code ou copie a chave</p>
                <p>• O pagamento será confirmado automaticamente</p>
            </div>
        </div>
    );
}
