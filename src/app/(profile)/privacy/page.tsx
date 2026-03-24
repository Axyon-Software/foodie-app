// src/app/(profile)/privacy/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Bell, Key, Trash2, AlertTriangle, Check, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getUserPrivacySettings, updateUserPrivacySettings } from '@/actions/profile-actions';
import { UserPrivacySettings } from '@/types/user-profile.types';

interface ToggleProps {
    enabled: boolean;
    onChange: () => void;
    label: string;
    description: string;
    icon: React.ReactNode;
    warning?: string;
}

function Toggle({ enabled, onChange, label, description, icon, warning }: ToggleProps) {
    return (
        <motion.div 
            whileTap={{ scale: 0.99 }}
            className="flex items-start gap-4 p-4 rounded-2xl"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
            <div 
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-primary-light)', color: '#00A082' }}
            >
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
                    <button
                        onClick={onChange}
                        className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-[#00A082]' : 'bg-gray-300'}`}
                    >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
                {warning && (
                    <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--color-error)' }}>
                        <AlertTriangle size={12} />
                        {warning}
                    </p>
                )}
            </div>
        </motion.div>
    );
}

export default function PrivacyPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<UserPrivacySettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            const result = await getUserPrivacySettings();
            if (result.data) {
                setSettings(result.data);
            }
            setIsLoading(false);
        };
        loadSettings();
    }, []);

    const handleToggle = async (key: keyof UserPrivacySettings) => {
        if (!settings) return;
        
        const newValue = !settings[key];
        setIsSaving(true);

        const result = await updateUserPrivacySettings({ [key]: newValue });
        
        if (result.success) {
            setSettings({ ...settings, [key]: newValue });
            toast.success('Configuração atualizada');
        } else {
            toast.error(result.error || 'Erro ao salvar');
        }
        
        setIsSaving(false);
    };

    if (isLoading || !settings) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A082]"></div>
            </div>
        );
    }

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
                        <Shield size={20} className="text-[#00A082]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                            Privacidade e Segurança
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Gerencie suas configurações de privacidade
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Profile Visibility */}
                <section>
                    <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--color-text-secondary)' }}>
                        VISIBILIDADE DO PERFIL
                    </h2>
                    <div className="space-y-3">
                        <Toggle
                            enabled={settings.showProfile}
                            onChange={() => handleToggle('showProfile')}
                            label="Perfil Público"
                            description="Permitir que outros usuários vejam seu perfil"
                            icon={<Eye size={20} />}
                        />
                        <Toggle
                            enabled={settings.showOrderHistory}
                            onChange={() => handleToggle('showOrderHistory')}
                            label="Histórico de Pedidos"
                            description="Permitir visualização do histórico de pedidos"
                            icon={<Eye size={20} />}
                        />
                    </div>
                </section>

                {/* Notifications */}
                <section>
                    <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--color-text-secondary)' }}>
                        NOTIFICAÇÕES
                    </h2>
                    <div className="space-y-3">
                        <Toggle
                            enabled={settings.allowNotifications}
                            onChange={() => handleToggle('allowNotifications')}
                            label="Notificações Push"
                            description="Receber notificações sobre pedidos e promoções"
                            icon={<Bell size={20} />}
                        />
                        <Toggle
                            enabled={settings.allowMarketing}
                            onChange={() => handleToggle('allowMarketing')}
                            label="Marketing e Promoções"
                            description="Receber ofertas e promoções por e-mail"
                            icon={<Bell size={20} />}
                        />
                    </div>
                </section>

                {/* Security */}
                <section>
                    <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--color-text-secondary)' }}>
                        SEGURANÇA
                    </h2>
                    <div className="space-y-3">
                        <Toggle
                            enabled={settings.twoFactorEnabled}
                            onChange={() => handleToggle('twoFactorEnabled')}
                            label="Autenticação em 2 Fatores"
                            description="Adicionar uma camada extra de segurança"
                            icon={<Key size={20} />}
                            warning="Recomendado para maior segurança"
                        />
                        <Toggle
                            enabled={settings.dataSharing}
                            onChange={() => handleToggle('dataSharing')}
                            label="Compartilhamento de Dados"
                            description="Permitir compartilhamento de dados com parceiros"
                            icon={<Eye size={20} />}
                            warning="Isso permite que terceiros acessem seus dados"
                        />
                    </div>
                </section>

                {/* Account Actions */}
                <section>
                    <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--color-text-secondary)' }}>
                        AÇÕES DA CONTA
                    </h2>
                    <div className="space-y-3">
                        <motion.button
                            whileTap={{ scale: 0.99 }}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl"
                            style={{ backgroundColor: 'var(--color-bg-card)' }}
                            onClick={() => router.push('/profile')}
                        >
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: 'var(--color-primary-light)', color: '#00A082' }}
                            >
                                <Key size={20} />
                            </div>
                            <div className="flex-1 text-left">
                                <span className="font-medium" style={{ color: 'var(--color-text)' }}>Alterar Senha</span>
                                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Atualize sua senha</p>
                            </div>
                            <ChevronRight size={20} style={{ color: 'var(--color-text-tertiary)' }} />
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.99 }}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl"
                            style={{ backgroundColor: 'var(--color-bg-card)' }}
                        >
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}
                            >
                                <Trash2 size={20} />
                            </div>
                            <div className="flex-1 text-left">
                                <span className="font-medium" style={{ color: 'var(--color-error)' }}>Excluir Conta</span>
                                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Remover todos os dados</p>
                            </div>
                            <ChevronRight size={20} style={{ color: 'var(--color-text-tertiary)' }} />
                        </motion.button>
                    </div>
                </section>

                {/* Data Info */}
                <div 
                    className="p-4 rounded-2xl"
                    style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                >
                    <div className="flex items-start gap-3">
                        <Check size={20} className="text-[#00A082] mt-0.5" />
                        <div>
                            <p className="font-medium" style={{ color: 'var(--color-text)' }}>Seus dados estão seguros</p>
                            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Seguimos rigorosos padrões de proteção de dados. Você pode solicitar a exportação ou exclusão dos seus dados a qualquer momento.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}