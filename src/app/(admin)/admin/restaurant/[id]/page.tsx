// src/app/(admin)/admin/restaurant/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    Store, Settings, DollarSign, Clock, MapPin, Phone, Mail, 
    Image, Star, Plus, ChevronRight, Edit3, ToggleLeft, ToggleRight,
    Utensils, Users, ShoppingBag, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getRestaurantProfile, updateRestaurantStatus } from '@/actions/restaurantActions';
import { RestaurantProfile, RestaurantStatus } from '@/types/restaurant-management.types';

interface MenuItem {
    icon: React.ReactNode;
    label: string;
    href: string;
    description?: string;
}

export default function RestaurantProfilePage() {
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    useEffect(() => {
        const loadRestaurant = async () => {
            const result = await getRestaurantProfile();
            if (result.data) {
                setRestaurant(result.data);
            }
            setIsLoading(false);
        };
        loadRestaurant();
    }, []);

    const handleStatusToggle = async () => {
        if (!restaurant) return;
        
        const newStatus: RestaurantStatus = restaurant.status === 'OPEN' ? 'CLOSED' : 'OPEN';
        setIsUpdatingStatus(true);
        
        const result = await updateRestaurantStatus(newStatus);
        
        if (result.success) {
            setRestaurant(prev => prev ? { ...prev, status: newStatus } : null);
            toast.success(newStatus === 'OPEN' ? 'Restaurante aberto!' : 'Restaurante fechado');
        } else {
            toast.error(result.error || 'Erro ao atualizar');
        }
        
        setIsUpdatingStatus(false);
    };

    const managementMenu: MenuItem[] = [
        { icon: <Utensils size={20} />, label: 'Cardápio', href: '/admin/menu', description: 'Gerenciar itens' },
        { icon: <ShoppingBag size={20} />, label: 'Pedidos', href: '/admin/orders', description: 'Ver pedidos' },
        { icon: <Users size={20} />, label: 'Mesas', href: '/admin/tables', description: 'Gerenciar mesas' },
        { icon: <Star size={20} />, label: 'Avaliações', href: '/admin/reviews', description: 'Ver avaliações' },
        { icon: <Clock size={20} />, label: 'Horário', href: '/admin/hours', description: 'Editar horários' },
        { icon: <Image size={20} />, label: 'Galeria', href: '/admin/gallery', description: 'Fotos do restaurante' },
        { icon: <CreditCard size={20} />, label: 'Pagamentos', href: '/admin/bank', description: 'Dados bancários' },
        { icon: <Settings size={20} />, label: 'Configurações', href: '/admin/settings', description: 'Editar perfil' },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A082]"></div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ backgroundColor: 'var(--color-bg)' }}>
                <Store size={64} className="text-gray-300 mb-4" />
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Nenhum restaurante encontrado</h2>
                <p className="text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>Crie seu restaurante para começar a vender</p>
                <Link href="/admin/restaurant/create">
                    <button className="px-6 py-3 bg-[#00A082] text-white rounded-full font-medium">
                        Criar Restaurante
                    </button>
                </Link>
            </div>
        );
    }

    const isOpen = restaurant.status === 'OPEN';

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg)' }}>
            {/* Header com Banner */}
            <div className="relative">
                <div 
                    className="h-32"
                    style={{ 
                        background: restaurant.images?.banner 
                            ? `url(${restaurant.images.banner}) center/cover` 
                            : 'linear-gradient(135deg, #00A082 0%, #008F74 100%)' 
                    }}
                >
                    <div className="absolute inset-0 bg-black/30" />
                </div>
                
                <div className="px-4 -mt-12 relative z-10">
                    <div className="flex items-end gap-4">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-4" style={{ borderColor: 'var(--color-bg-card)', backgroundColor: 'var(--color-bg-card)' }}>
                            {restaurant.images?.logo ? (
                                <img src={restaurant.images.logo} alt={restaurant.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[#00A082] flex items-center justify-center">
                                    <Store size={32} className="text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 mb-2">
                            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{restaurant.name}</h1>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{restaurant.category}</p>
                        </div>
                        <button
                            onClick={handleStatusToggle}
                            disabled={isUpdatingStatus}
                            className="flex items-center gap-2 px-4 py-2 rounded-full font-medium"
                            style={{ 
                                backgroundColor: isOpen ? '#D1FAE5' : '#FEE2E2',
                                color: isOpen ? '#059669' : '#DC2626'
                            }}
                        >
                            {isUpdatingStatus ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : isOpen ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                            {isOpen ? 'Aberto' : 'Fechado'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 p-4">
                <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <Star size={20} className="mx-auto mb-1 text-yellow-500" />
                    <span className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{restaurant.rating || '0.0'}</span>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Nota</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <ShoppingBag size={20} className="mx-auto mb-1 text-[#00A082]" />
                    <span className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>0</span>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Pedidos</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <Users size={20} className="mx-auto mb-1 text-[#00A082]" />
                    <span className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>0</span>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Avaliações</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <DollarSign size={20} className="mx-auto mb-1 text-[#00A082]" />
                    <span className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>R$ {restaurant.deliveryFee}</span>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Frete</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/admin/orders">
                        <motion.div whileTap={{ scale: 0.98 }} className="p-4 rounded-2xl text-center" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                            <ShoppingBag size={24} className="mx-auto mb-2 text-[#00A082]" />
                            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Pedidos</span>
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>0 novos</p>
                        </motion.div>
                    </Link>
                    <Link href="/admin/menu">
                        <motion.div whileTap={{ scale: 0.98 }} className="p-4 rounded-2xl text-center" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                            <Utensils size={24} className="mx-auto mb-2 text-[#00A082]" />
                            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Cardápio</span>
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Gerenciar</p>
                        </motion.div>
                    </Link>
                </div>
            </div>

            {/* Menu de Gerenciamento */}
            <div className="p-4 pt-0">
                <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>GERENCIAMENTO</h2>
                <div className="grid grid-cols-2 gap-3">
                    {managementMenu.map((item, index) => (
                        <Link key={item.label} href={item.href}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="p-4 rounded-2xl"
                                style={{ backgroundColor: 'var(--color-bg-card)' }}
                            >
                                <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                                    style={{ backgroundColor: 'var(--color-primary-light)', color: '#00A082' }}
                                >
                                    {item.icon}
                                </div>
                                <span className="text-sm font-medium block" style={{ color: 'var(--color-text)' }}>{item.label}</span>
                                {item.description && (
                                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{item.description}</span>
                                )}
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Informações de Contato */}
            <div className="p-4 pt-0">
                <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>INFORMAÇÕES</h2>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                        <Phone size={18} style={{ color: 'var(--color-text-secondary)' }} />
                        <span style={{ color: 'var(--color-text)' }}>{restaurant.contact?.phone || 'Não definido'}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                        <Mail size={18} style={{ color: 'var(--color-text-secondary)' }} />
                        <span style={{ color: 'var(--color-text)' }}>{restaurant.contact?.email || 'Não definido'}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                        <MapPin size={18} style={{ color: 'var(--color-text-secondary)' }} />
                        <span style={{ color: 'var(--color-text)' }}>
                            {restaurant.address?.street ? `${restaurant.address.street}, ${restaurant.address.number} - ${restaurant.address.neighborhood}` : 'Não definido'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                        <Clock size={18} style={{ color: 'var(--color-text-secondary)' }} />
                        <span style={{ color: 'var(--color-text)' }}>
                            {restaurant.estimatedDeliveryTime ? `${restaurant.estimatedDeliveryTime} min` : 'Não definido'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Edit Button */}
            <div className="p-4 pt-0">
                <Link href={`/admin/restaurant/${restaurant.id}/edit`}>
                    <motion.button whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                        <Edit3 size={20} style={{ color: '#00A082' }} />
                        <span className="font-medium" style={{ color: '#00A082' }}>Editar Restaurante</span>
                    </motion.button>
                </Link>
            </div>
        </div>
    );
}