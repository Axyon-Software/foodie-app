// src/app/(profile)/order/[id]/receipt/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    Receipt, Download, Mail, Printer, Share2, 
    ChevronLeft, CheckCircle, Clock, CreditCard, 
    Banknote, Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import { getReceiptByOrder, formatReceiptForPrint, sendReceiptByEmail } from '@/actions/receipt-actions';
import { ReceiptData } from '@/types/payment.types';
import { formatPrice } from '@/lib/utils/format.utils';

export default function ReceiptPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;
    
    const [receipt, setReceipt] = useState<ReceiptData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    useEffect(() => {
        const loadReceipt = async () => {
            const result = await getReceiptByOrder(orderId);
            if (result.data) {
                setReceipt(result.data);
            }
            setIsLoading(false);
        };
        loadReceipt();
    }, [orderId]);

    const handlePrint = () => {
        if (!receipt) return;
        const printContent = formatReceiptForPrint(receipt);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head><title>Recibo - ${receipt.restaurantName}</title></head>
                <body style="font-family: monospace; white-space: pre-wrap; padding: 20px;">
                    ${printContent}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handleDownload = () => {
        if (!receipt) return;
        const content = formatReceiptForPrint(receipt);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo-${receipt.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Recibo baixado');
    };

    const handleSendEmail = async () => {
        if (!receipt?.customerEmail) return;
        
        setIsSendingEmail(true);
        const result = await sendReceiptByEmail(receipt.id, receipt.customerEmail);
        
        if (result.success) {
            toast.success('Recibo enviado por e-mail');
        } else {
            toast.error(result.error || 'Erro ao enviar');
        }
        
        setIsSendingEmail(false);
    };

    const getPaymentIcon = (method: string) => {
        switch (method) {
            case 'CREDIT_CARD':
            case 'DEBIT_CARD':
                return <CreditCard size={18} />;
            case 'PIX':
                return <Smartphone size={18} />;
            case 'CASH':
                return <Banknote size={18} />;
            default:
                return <CreditCard size={18} />;
        }
    };

    const getPaymentLabel = (method: string) => {
        switch (method) {
            case 'CREDIT_CARD': return 'Cartão de Crédito';
            case 'DEBIT_CARD': return 'Cartão de Débito';
            case 'PIX': return 'Pix';
            case 'CASH': return 'Dinheiro';
            case 'BOLETO': return 'Boleto';
            default: return method;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A082]"></div>
            </div>
        );
    }

    if (!receipt) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ backgroundColor: 'var(--color-bg)' }}>
                <Receipt size={64} className="text-gray-300 mb-4" />
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Recibo não encontrado</h2>
                <button onClick={() => router.back()} className="text-[#00A082]">Voltar</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg)' }}>
            {/* Header */}
            <div className="p-4 border-b" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2">
                        <ChevronLeft size={20} style={{ color: 'var(--color-text)' }} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-[#00A082]/10 flex items-center justify-center">
                        <Receipt size={20} className="text-[#00A082]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Recibo</h1>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {receipt.restaurantName}
                        </p>
                    </div>
                </div>
            </div>

            {/* Status */}
            <div className="p-4">
                <div className="p-4 rounded-2xl flex items-center gap-3" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: receipt.status === 'PAID' ? '#D1FAE5' : '#FEF3C7' }}
                    >
                        {receipt.status === 'PAID' ? (
                            <CheckCircle size={24} className="text-green-600" />
                        ) : (
                            <Clock size={24} className="text-yellow-600" />
                        )}
                    </div>
                    <div>
                        <span className="font-bold" style={{ color: 'var(--color-text)' }}>
                            {receipt.status === 'PAID' ? 'Pago' : 'Pendente'}
                        </span>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {receipt.id}
                        </p>
                    </div>
                </div>
            </div>

            {/* Receipt Details */}
            <div className="p-4 pt-0 space-y-4">
                {/* Restaurant Info */}
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <h3 className="font-bold mb-2" style={{ color: 'var(--color-text)' }}>{receipt.restaurantName}</h3>
                    {receipt.restaurantCNPJ && (
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>CNPJ: {receipt.restaurantCNPJ}</p>
                    )}
                </div>

                {/* Items */}
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>ITENS</h3>
                    <div className="space-y-2">
                        {receipt.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                                <div>
                                    <span style={{ color: 'var(--color-text)' }}>
                                        {item.quantity}x {item.name}
                                    </span>
                                    {item.observation && (
                                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                            Obs: {item.observation}
                                        </p>
                                    )}
                                </div>
                                <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                                    {formatPrice(item.totalPrice)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals */}
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                            <span style={{ color: 'var(--color-text)' }}>{formatPrice(receipt.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: 'var(--color-text-secondary)' }}>Frete</span>
                            <span style={{ color: 'var(--color-text)' }}>{formatPrice(receipt.deliveryFee)}</span>
                        </div>
                        {receipt.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Desconto</span>
                                <span>-{formatPrice(receipt.discount)}</span>
                            </div>
                        )}
                        <div 
                            className="flex justify-between font-bold text-lg pt-2 border-t"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                        >
                            <span>Total</span>
                            <span>{formatPrice(receipt.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>PAGAMENTO</h3>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                            {getPaymentIcon(receipt.paymentMethod)}
                        </div>
                        <div>
                            <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                                {getPaymentLabel(receipt.paymentMethod)}
                            </span>
                            {receipt.transactionId && (
                                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                    Transação: {receipt.transactionId}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>ENTREGA</h3>
                    <p style={{ color: 'var(--color-text)' }}>
                        {receipt.address.street}, {receipt.address.number}
                        {receipt.address.complement && ` - ${receipt.address.complement}`}
                    </p>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        {receipt.address.neighborhood} - {receipt.address.city}/{receipt.address.state}
                    </p>
                    <p style={{ color: 'var(--color-text-tertiary)' }}>CEP: {receipt.address.zipCode}</p>
                </div>

                {/* Date */}
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Emitido em: {new Date(receipt.issuedAt).toLocaleString('pt-BR')}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 fixed bottom-0 left-0 right-0 border-t" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownload}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                    >
                        <Download size={18} />
                        Baixar
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                    >
                        <Printer size={18} />
                        Imprimir
                    </button>
                    <button
                        onClick={handleSendEmail}
                        disabled={isSendingEmail}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-[#00A082] text-white disabled:opacity-50"
                    >
                        <Mail size={18} />
                        {isSendingEmail ? 'Enviando...' : 'E-mail'}
                    </button>
                </div>
            </div>
        </div>
    );
}
