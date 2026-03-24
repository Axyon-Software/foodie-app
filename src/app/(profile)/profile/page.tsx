// src/app/(profile)/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, Shield, Heart, MapPin, ShoppingBag,
    Settings, LogOut, ChevronRight, Bell, Key, Eye, Check,
    Clock, Star, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { formatDateBR } from '@/lib/utils/format.utils';
import { getUserProfile, getUserPrivacySettings, updateUserPrivacySettings, getFavoriteRestaurants } from '@/actions/profileActions';
import { UserPrivacySettings } from '@/types/user-profile.types';

interface ProfileMenuItem {
    icon: React.ReactNode;
    label: string;
    href: string;
    badge?: string;
    action?: () => void;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, signOut, hasRole } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [privacySettings, setPrivacySettings] = useState<UserPrivacySettings | null>(null);
    const [favoritesCount, setFavoritesCount] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            if (!user) {
                router.push('/sign-in');
                return;
            }

            // Carregar perfil
            const profileResult = await getUserProfile();
            if (profileResult.data) {
                setProfile(profileResult.data);
            }

            // Carregar configurações de privacidade
            const privacyResult = await getUserPrivacySettings();
            if (privacyResult.data) {
                setPrivacySettings(privacyResult.data);
            }

            // Carregar favoritos
            const favoritesResult = await getFavoriteRestaurants();
            if (favoritesResult.data) {
                setFavoritesCount(favoritesResult.data.length);
            }

            setIsLoading(false);
        };

        loadData();
    }, [user, router]);

    const handlePrivacyToggle = async (key: keyof UserPrivacySettings) => {
        if (!privacySettings) return;

        const newSettings = { ...privacySettings, [key]: !privacySettings[key] };

        const result = await updateUserPrivacySettings({ [key]: !privacySettings[key] });

        if (result.success) {
            setPrivacySettings(newSettings);
            toast.success('Configuração atualizada');
        } else {
            toast.error(result.error || 'Erro ao atualizar');
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const clientMenuItems: ProfileMenuItem[] = [
        {
            icon: <ShoppingBag size={20} />,
            label: 'Meus Pedidos',
            href: '/orders',
        },
        {
            icon: <Heart size={20} />,
            label: 'Restaurantes Favoritos',
            href: '/favorites',
            badge: favoritesCount > 0 ? `${favoritesCount}` : undefined,
        },
        {
            icon: <MapPin size={20} />,
            label: 'Endereços Salvos',
            href: '/addresses',
        },
        {
            icon: <CreditCard size={20} />,
            label: 'Métodos de Pagamento',
            href: '/payment-methods',
        },
        {
            icon: <Settings size={20} />,
            label: 'Preferências',
            href: '/preferences',
        },
        {
            icon: <Shield size={20} />,
            label: 'Privacidade e Segurança',
            href: '/privacy',
        },
    ];

    const adminMenuItems: ProfileMenuItem[] = [
        {
            icon: <Star size={20} />,
            label: 'Painel do Restaurante',
            href: '/admin',
        },
        {
            icon: <ShoppingBag size={20} />,
            label: 'Gerenciar Pedidos',
            href: '/admin/orders',
        },
        {
            icon: <User size={20} />,
            label: 'Gerenciar Staff',
            href: '/admin/staff',
        },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A082]"></div>
            </div>
        );
    }

    // Verificar se tem alguma das roles de admin
    const isAdmin = hasRole('ADMIN') || hasRole('GERENCIADOR');
    const menuItems = isAdmin ? [...adminMenuItems, ...clientMenuItems] : clientMenuItems;

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg)' }}>
            {/* Header */}
            <div
                className="p-6"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
                <div className="flex items-center gap-4">
                    {profile?.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt={profile.full_name || 'User'}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-[#00A082] flex items-center justify-center text-white text-xl font-bold">
                            {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                        </div>
                    )}
                    <div className="flex-1">
                        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                            {profile?.full_name || 'Usuário'}
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {user?.email}
                        </p>
                        {profile?.role && profile.role !== 'CLIENTE' && (
                            <span
                                className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full"
                                style={{ backgroundColor: 'var(--color-primary-light)', color: '#00A082' }}
                            >
                                {profile.role === 'ADMIN' && 'Administrador'}
                                {profile.role === 'GERENCIADOR' && 'Gerente'}
                                {profile.role === 'EQUIPE' && 'Equipe'}
                            </span>
                        )}
                    </div>
                    <Link href="/profile/edit">
                        <button className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                            <Settings size={20} style={{ color: 'var(--color-text-secondary)' }} />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4">
                <Link href="/orders">
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-2xl text-center"
                        style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                        <ShoppingBag size={24} className="mx-auto mb-2 text-[#00A082]" />
                        <span className="block text-lg font-bold" style={{ color: 'var(--color-text)' }}>0</span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Pedidos</span>
                    </motion.div>
                </Link>
                <Link href="/favorites">
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-2xl text-center"
                        style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                        <Heart size={24} className="mx-auto mb-2 text-[#00A082]" />
                        <span className="block text-lg font-bold" style={{ color: 'var(--color-text)' }}>{favoritesCount}</span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Favoritos</span>
                    </motion.div>
                </Link>
                <Link href="/addresses">
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-2xl text-center"
                        style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                        <MapPin size={24} className="mx-auto mb-2 text-[#00A082]" />
                        <span className="block text-lg font-bold" style={{ color: 'var(--color-text)' }}>0</span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Endereços</span>
                    </motion.div>
                </Link>
            </div>

            {/* Menu */}
            <div className="p-4 space-y-2">
                {menuItems.map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link href={item.href}>
                            <div
                                className="flex items-center gap-4 p-4 rounded-2xl transition-colors"
                                style={{ backgroundColor: 'var(--color-bg-card)' }}
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'var(--color-primary-light)', color: '#00A082' }}
                                >
                                    {item.icon}
                                </div>
                                <span className="flex-1 font-medium" style={{ color: 'var(--color-text)' }}>
                                    {item.label}
                                </span>
                                {item.badge && (
                                    <span
                                        className="px-2 py-0.5 text-xs rounded-full"
                                        style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                                <ChevronRight size={20} style={{ color: 'var(--color-text-tertiary)' }} />
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Privacy Quick Settings */}
            {privacySettings && (
                <div className="p-4">
                    <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        Segurança Rápida
                    </h2>
                    <div className="space-y-2">
                        <button
                            onClick={() => handlePrivacyToggle('allowNotifications')}
                            className="w-full flex items-center justify-between p-4 rounded-2xl"
                            style={{ backgroundColor: 'var(--color-bg-card)' }}
                        >
                            <div className="flex items-center gap-3">
                                <Bell size={20} style={{ color: 'var(--color-text-secondary)' }} />
                                <span style={{ color: 'var(--color-text)' }}>Notificações</span>
                            </div>
                            <div
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${privacySettings.allowNotifications ? 'bg-[#00A082]' : 'bg-gray-300'}`}
                            >
                                <div
                                    className={`w-4 h-4 rounded-full bg-white transition-transform ${privacySettings.allowNotifications ? 'translate-x-6' : ''}`}
                                />
                            </div>
                        </button>
                        <button
                            onClick={() => handlePrivacyToggle('twoFactorEnabled')}
                            className="w-full flex items-center justify-between p-4 rounded-2xl"
                            style={{ backgroundColor: 'var(--color-bg-card)' }}
                        >
                            <div className="flex items-center gap-3">
                                <Key size={20} style={{ color: 'var(--color-text-secondary)' }} />
                                <span style={{ color: 'var(--color-text)' }}>Autenticação em 2 fatores</span>
                            </div>
                            <div
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${privacySettings.twoFactorEnabled ? 'bg-[#00A082]' : 'bg-gray-300'}`}
                            >
                                <div
                                    className={`w-4 h-4 rounded-full bg-white transition-transform ${privacySettings.twoFactorEnabled ? 'translate-x-6' : ''}`}
                                />
                            </div>
                        </button>
                        <button
                            onClick={() => handlePrivacyToggle('dataSharing')}
                            className="w-full flex items-center justify-between p-4 rounded-2xl"
                            style={{ backgroundColor: 'var(--color-bg-card)' }}
                        >
                            <div className="flex items-center gap-3">
                                <Eye size={20} style={{ color: 'var(--color-text-secondary)' }} />
                                <span style={{ color: 'var(--color-text)' }}>Compartilhamento de dados</span>
                            </div>
                            <div
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${privacySettings.dataSharing ? 'bg-[#00A082]' : 'bg-gray-300'}`}
                            >
                                <div
                                    className={`w-4 h-4 rounded-full bg-white transition-transform ${privacySettings.dataSharing ? 'translate-x-6' : ''}`}
                                />
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Account Info */}
            <div className="p-4">
                <div
                    className="p-4 rounded-2xl"
                    style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Membro desde</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                            {profile?.created_at ? formatDateBR(profile.created_at) : '-'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Logout */}
            <div className="p-4 pt-0">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl font-medium"
                    style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-error)' }}
                >
                    <LogOut size={20} />
                    Sair da Conta
                </button>
            </div>
        </div>
    );
}