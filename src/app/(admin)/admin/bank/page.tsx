// src/app/(admin)/admin/bank/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Building, Key, User, FileText, ChevronLeft, Loader2, Shield, CheckCircle, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { updateBankInfo } from '@/actions/restaurant-actions';
import { BankInfo } from '@/types/restaurant-management.types';

const BANKS = [
    'Banco do Brasil', 'Bradesco', 'Itaú', 'Santander', 'Caixa', 
    'Nubank', 'Inter', 'C6 Bank', 'Banco Pan', 'Safra', 'Sicoob', 'Sicredi'
];

const PIX_KEY_TYPES = [
    { value: 'cpf', label: 'CPF' },
    { value: 'cnpj', label: 'CNPJ' },
    { value: 'email', label: 'E-mail' },
    { value: 'phone', label: 'Telefone' },
    { value: 'random', label: 'Chave Aleatória' },
];

export default function BankInfoPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<BankInfo>({
        bank: '',
        agency: '',
        account: '',
        accountType: 'checking',
        pixKey: '',
        pixKeyType: 'cpf',
        holderName: '',
        document: '',
    });

    const handleChange = (field: keyof BankInfo, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.bank || !formData.agency || !formData.account || !formData.holderName || !formData.document) {
            toast.error('Preencha os campos obrigatórios');
            return;
        }

        if (!formData.pixKey) {
            toast.error('Adicione uma chave Pix');
            return;
        }

        setIsLoading(true);
        const result = await updateBankInfo(formData);

        if (result.success) {
            toast.success('Informações bancárias salvas!');
            router.back();
        } else {
            toast.error(result.error || 'Erro ao salvar');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg)' }}>
            {/* Header */}
            <div className="p-4 border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2">
                        <ChevronLeft size={20} style={{ color: 'var(--color-text)' }} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-[#00A082]/10 flex items-center justify-center">
                        <CreditCard size={20} className="text-[#00A082]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Dados Bancários</h1>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Receba seus pagamentos
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="p-4">
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                    <div className="flex items-start gap-3">
                        <Shield size={24} className="text-[#00A082] mt-0.5" />
                        <div>
                            <p className="font-medium text-[#00A082]">Pagamentos seguros</p>
                            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Suas informações bancárias são criptografadas e armazenadas com segurança.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">
                {/* Dados do Titular */}
                <section>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        DADOS DO TITULAR
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                <User size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                Nome Completo *
                            </label>
                            <input
                                type="text"
                                value={formData.holderName}
                                onChange={(e) => handleChange('holderName', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                placeholder="Nome como está no banco"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                <FileText size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                CPF ou CNPJ *
                            </label>
                            <input
                                type="text"
                                value={formData.document}
                                onChange={(e) => handleChange('document', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                placeholder="000.000.000-00"
                            />
                        </div>
                    </div>
                </section>

                {/* Dados Bancários */}
                <section>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        DADOS BANCÁRIOS
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                <Building size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                Banco *
                            </label>
                            <select
                                value={formData.bank}
                                onChange={(e) => handleChange('bank', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                            >
                                <option value="">Selecione...</option>
                                {BANKS.map(bank => (
                                    <option key={bank} value={bank}>{bank}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Agência *</label>
                                <input
                                    type="text"
                                    value={formData.agency}
                                    onChange={(e) => handleChange('agency', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                    style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                    placeholder="0000"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Conta *</label>
                                <input
                                    type="text"
                                    value={formData.account}
                                    onChange={(e) => handleChange('account', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                    style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                    placeholder="00000-0"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Tipo de Conta</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="accountType"
                                        value="checking"
                                        checked={formData.accountType === 'checking'}
                                        onChange={() => handleChange('accountType', 'checking')}
                                    />
                                    <span style={{ color: 'var(--color-text)' }}>Conta Corrente</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="accountType"
                                        value="savings"
                                        checked={formData.accountType === 'savings'}
                                        onChange={() => handleChange('accountType', 'savings')}
                                    />
                                    <span style={{ color: 'var(--color-text)' }}>Poupança</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pix */}
                <section>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        CHAVE PIX
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: '#00A082' }}>
                            <Smartphone size={24} className="text-white" />
                            <div>
                                <p className="font-medium text-white">Receba por Pix</p>
                                <p className="text-sm text-white/80">O pagamento cai na hora</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                <Key size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                Tipo de Chave *
                            </label>
                            <select
                                value={formData.pixKeyType}
                                onChange={(e) => handleChange('pixKeyType', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                            >
                                {PIX_KEY_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Chave Pix *</label>
                            <input
                                type="text"
                                value={formData.pixKey}
                                onChange={(e) => handleChange('pixKey', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                placeholder={formData.pixKeyType === 'cpf' ? '000.000.000-00' : 'sua@chave.com'}
                            />
                        </div>
                    </div>
                </section>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-semibold transition-colors disabled:opacity-50"
                        style={{ backgroundColor: '#00A082', color: 'white' }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                Salvar Informações
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}