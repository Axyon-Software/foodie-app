// src/app/(profile)/payment-methods/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Trash2, ChevronRight, Check, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PaymentMethod {
    id: string;
    type: 'card' | 'pix';
    brand?: string;
    last4?: string;
    pixKey?: string;
    isDefault: boolean;
    expiry?: string;
}

export default function PaymentMethodsPage() {
    const router = useRouter();
    const [methods, setMethods] = useState<PaymentMethod[]>([
        {
            id: '1',
            type: 'card',
            brand: 'Visa',
            last4: '4242',
            isDefault: true,
            expiry: '12/26',
        },
        {
            id: '2',
            type: 'pix',
            pixKey: 'seu@email.com',
            isDefault: false,
        },
    ]);

    const handleSetDefault = (id: string) => {
        setMethods(prev => prev.map(m => ({
            ...m,
            isDefault: m.id === id,
        })));
        toast.success('Método de pagamento padrão atualizado');
    };

    const handleDelete = (id: string) => {
        if (methods.length === 1) {
            toast.error('Você precisa ter pelo menos um método de pagamento');
            return;
        }
        setMethods(prev => prev.filter(m => m.id !== id));
        toast.success('Método de pagamento removido');
    };

    const getCardIcon = (brand?: string) => {
        return <CreditCard size={20} />;
    };

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg)' }}>
            {/* Header */}
            <div 
                className="p-4 border-b"
                style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2">
                        <ChevronRight size={20} className="rotate-180" style={{ color: 'var(--color-text)' }} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-[#00A082]/10 flex items-center justify-center">
                        <CreditCard size={20} className="text-[#00A082]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                            Métodos de Pagamento
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Gerencie seus métodos de pagamento
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Credit/Debit Cards */}
                <section>
                    <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--color-text-secondary)' }}>
                        CARTÕES
                    </h2>
                    <div className="space-y-3">
                        {methods.filter(m => m.type === 'card').map((method, index) => (
                            <motion.div
                                key={method.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative p-4 rounded-2xl"
                                style={{ backgroundColor: 'var(--color-bg-card)' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-12 h-8 rounded flex items-center justify-center"
                                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                                    >
                                        {getCardIcon(method.brand)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                                                {method.brand} •••• {method.last4}
                                            </span>
                                            {method.isDefault && (
                                                <span 
                                                    className="px-2 py-0.5 text-xs rounded-full"
                                                    style={{ backgroundColor: 'var(--color-primary-light)', color: '#00A082' }}
                                                >
                                                    Padrão
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            Expira {method.expiry}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                    {!method.isDefault && (
                                        <button
                                            onClick={() => handleSetDefault(method.id)}
                                            className="text-sm font-medium"
                                            style={{ color: '#00A082' }}
                                        >
                                            Definir como padrão
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(method.id)}
                                        className="text-sm font-medium ml-auto"
                                        style={{ color: 'var(--color-error)' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Pix */}
                <section>
                    <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--color-text-secondary)' }}>
                        PIX
                    </h2>
                    <div className="space-y-3">
                        {methods.filter(m => m.type === 'pix').map((method, index) => (
                            <motion.div
                                key={method.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative p-4 rounded-2xl"
                                style={{ backgroundColor: 'var(--color-bg-card)' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-12 h-12 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: '#00A082' }}
                                    >
                                        <Smartphone size={24} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                                                Chave Pix
                                            </span>
                                            {method.isDefault && (
                                                <span 
                                                    className="px-2 py-0.5 text-xs rounded-full"
                                                    style={{ backgroundColor: 'var(--color-primary-light)', color: '#00A082' }}
                                                >
                                                    Padrão
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            {method.pixKey}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                    {!method.isDefault && (
                                        <button
                                            onClick={() => handleSetDefault(method.id)}
                                            className="text-sm font-medium"
                                            style={{ color: '#00A082' }}
                                        >
                                            Definir como padrão
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(method.id)}
                                        className="text-sm font-medium ml-auto"
                                        style={{ color: 'var(--color-error)' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Add New Button */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed"
                    style={{ borderColor: 'var(--color-border)' }}
                    onClick={() => toast.info('Em breve: adicionar novo método de pagamento')}
                >
                    <Plus size={20} style={{ color: '#00A082' }} />
                    <span className="font-medium" style={{ color: '#00A082' }}>
                        Adicionar novo método
                    </span>
                </motion.button>

                {/* Info */}
                <div 
                    className="p-4 rounded-2xl"
                    style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                >
                    <div className="flex items-start gap-3">
                        <Check size={20} className="text-[#00A082] mt-0.5" />
                        <div>
                            <p className="font-medium" style={{ color: 'var(--color-text)' }}>Seus dados estão seguros</p>
                            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Utilizamos criptografia de nível bancário para proteger seus dados de pagamento.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}