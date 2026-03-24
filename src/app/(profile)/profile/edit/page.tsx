// src/app/(profile)/profile/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, Loader2, User, Mail, Phone, ChevronLeft, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { formatPhoneInput } from '@/lib/utils/format.utils';

export default function EditProfilePage() {
    const router = useRouter();
    const { user, profile, updateProfile } = useAuth();
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (profile) {
            setFullName(profile.fullName || '');
            setPhone(profile.phone ? formatPhoneInput(profile.phone) : '');
            setIsLoading(false);
        }
    }, [profile]);

    useEffect(() => {
        if (profile) {
            const nameChanged = fullName !== (profile.fullName || '');
            const phoneDigits = phone.replace(/\D/g, '');
            const phoneChanged = phoneDigits !== (profile.phone || '');
            setHasChanges(nameChanged || phoneChanged);
        }
    }, [fullName, phone, profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasChanges) return;

        setIsSaving(true);
        const phoneDigits = phone.replace(/\D/g, '');

        const result = await updateProfile({
            fullName,
            phone: phoneDigits,
        });

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Perfil atualizado com sucesso');
            router.push('/profile');
        }
        setIsSaving(false);
    };

    if (isLoading) {
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
                className="p-4 border-b sticky top-0 z-10"
                style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2">
                        <ChevronLeft size={20} style={{ color: 'var(--color-text)' }} />
                    </button>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                        Editar Perfil
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center py-6">
                    <div className="relative">
                        {profile?.avatarUrl ? (
                            <img 
                                src={profile.avatarUrl} 
                                alt={profile.fullName || 'User'}
                                className="w-24 h-24 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-[#00A082] flex items-center justify-center text-white text-3xl font-bold">
                                {fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                            </div>
                        )}
                        <button
                            type="button"
                            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#00A082] flex items-center justify-center"
                            style={{ backgroundColor: '#00A082' }}
                        >
                            <Camera size={16} className="text-white" />
                        </button>
                    </div>
                    <button type="button" className="mt-3 text-sm font-medium" style={{ color: '#00A082' }}>
                        Alterar foto
                    </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                            <User size={16} style={{ color: 'var(--color-text-secondary)' }} />
                            Nome completo
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                            style={{ 
                                backgroundColor: 'var(--color-bg-input)', 
                                color: 'var(--color-text)',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: 'var(--color-border)'
                            }}
                        />
                    </div>

                    {/* Email (readonly) */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                            <Mail size={16} style={{ color: 'var(--color-text-secondary)' }} />
                            E-mail
                        </label>
                        <input
                            type="email"
                            value={profile?.email || ''}
                            readOnly
                            className="w-full px-4 py-3 rounded-xl opacity-60 cursor-not-allowed"
                            style={{ 
                                backgroundColor: 'var(--color-bg-tertiary)', 
                                color: 'var(--color-text-secondary)',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: 'var(--color-border)'
                            }}
                        />
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                            O e-mail não pode ser alterado
                        </p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                            <Phone size={16} style={{ color: 'var(--color-text-secondary)' }} />
                            Telefone
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setFullName(formatPhoneInput(e.target.value))}
                            placeholder="(00) 00000-0000"
                            className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                            style={{ 
                                backgroundColor: 'var(--color-bg-input)', 
                                color: 'var(--color-text)',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: 'var(--color-border)'
                            }}
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={!hasChanges || isSaving}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-semibold transition-colors disabled:opacity-50"
                        style={{ backgroundColor: '#00A082', color: 'white' }}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Salvar alterações
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}