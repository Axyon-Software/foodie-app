// src/app/(profile)/admin/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    Store, ShoppingBag, Users, DollarSign, TrendingUp, 
    Clock, CheckCircle, XCircle, ChefHat, UserCheck, Plus,
    ArrowUpRight, ArrowDownRight, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface StatCard {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: React.ReactNode;
}

interface OrderItem {
    id: string;
    customer: string;
    items: string;
    total: string;
    status: string;
    time: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats] = useState<StatCard[]>([
        { label: 'Pedidos Hoje', value: '24', change: '+12%', trend: 'up', icon: <ShoppingBag size={20} /> },
        { label: 'Receita Hoje', value: 'R$ 1.840', change: '+8%', trend: 'up', icon: <DollarSign size={20} /> },
        { label: 'Pedidos Prontos', value: '5', change: '', trend: 'up', icon: <CheckCircle size={20} /> },
        { label: 'Clientes Ativos', value: '156', change: '+3%', trend: 'up', icon: <Users size={20} /> },
    ]);

    const [recentOrders] = useState<OrderItem[]>([
        { id: '1', customer: 'Maria Santos', items: '2 itens', total: 'R$ 45,90', status: 'preparing', time: '5 min' },
        { id: '2', customer: 'João Silva', items: '3 itens', total: 'R$ 78,50', status: 'ready', time: '12 min' },
        { id: '3', customer: 'Ana Costa', items: '1 item', total: 'R$ 24,00', status: 'delivering', time: '18 min' },
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'preparing': return { bg: '#FEF3C7', text: '#D97706' };
            case 'ready': return { bg: '#D1FAE5', text: '#059669' };
            case 'delivering': return { bg: '#DBEAFE', text: '#2563EB' };
            default: return { bg: '#F3F4F6', text: '#6B7280' };
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'preparing': return 'Preparando';
            case 'ready': return 'Pronto';
            case 'delivering': return 'Entregando';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg)' }}>
            {/* Header */}
            <div 
                className="p-4 border-b"
                style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#00A082]/10 flex items-center justify-center">
                            <Store size={20} className="text-[#00A082]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                                Painel Admin
                            </h1>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                Restaurante Gourmet
                            </p>
                        </div>
                    </div>
                    <div 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: 'var(--color-primary-light)', color: '#00A082' }}
                    >
                        Aberto
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 rounded-2xl"
                            style={{ backgroundColor: 'var(--color-bg-card)' }}
                        >
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                                style={{ backgroundColor: 'var(--color-primary-light)', color: '#00A082' }}
                            >
                                {stat.icon}
                            </div>
                            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                                {stat.value}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {stat.label}
                            </p>
                            {stat.change && (
                                <div className="flex items-center gap-1 mt-2">
                                    {stat.trend === 'up' ? (
                                        <ArrowUpRight size={14} className="text-green-500" />
                                    ) : (
                                        <ArrowDownRight size={14} className="text-red-500" />
                                    )}
                                    <span 
                                        className="text-xs font-medium"
                                        style={{ color: stat.trend === 'up' ? '#059669' : '#DC2626' }}
                                    >
                                        {stat.change} vs ontem
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <section>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        AÇÕES RÁPIDAS
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                        <Link href="/admin/orders">
                            <motion.div 
                                whileTap={{ scale: 0.95 }}
                                className="p-4 rounded-2xl text-center"
                                style={{ backgroundColor: 'var(--color-bg-card)' }}
                            >
                                <div className="w-12 h-12 rounded-full bg-[#00A082]/10 flex items-center justify-center mx-auto mb-2">
                                    <ShoppingBag size={24} className="text-[#00A082]" />
                                </div>
                                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                    Pedidos
                                </span>
                            </motion.div>
                        </Link>
                        <Link href="/admin/menu">
                            <motion.div 
                                whileTap={{ scale: 0.95 }}
                                className="p-4 rounded-2xl text-center"
                                style={{ backgroundColor: 'var(--color-bg-card)' }}
                            >
                                <div className="w-12 h-12 rounded-full bg-[#00A082]/10 flex items-center justify-center mx-auto mb-2">
                                    <ChefHat size={24} className="text-[#00A082]" />
                                </div>
                                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                    Cardápio
                                </span>
                            </motion.div>
                        </Link>
                        <Link href="/admin/staff">
                            <motion.div 
                                whileTap={{ scale: 0.95 }}
                                className="p-4 rounded-2xl text-center"
                                style={{ backgroundColor: 'var(--color-bg-card)' }}
                            >
                                <div className="w-12 h-12 rounded-full bg-[#00A082]/10 flex items-center justify-center mx-auto mb-2">
                                    <UserCheck size={24} className="text-[#00A082]" />
                                </div>
                                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                    Equipe
                                </span>
                            </motion.div>
                        </Link>
                    </div>
                </section>

                {/* Recent Orders */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                            PEDIDOS RECENTES
                        </h2>
                        <Link href="/admin/orders" className="text-sm font-medium" style={{ color: '#00A082' }}>
                            Ver todos
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentOrders.map((order, index) => {
                            const statusColors = getStatusColor(order.status);
                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-4 p-4 rounded-2xl"
                                    style={{ backgroundColor: 'var(--color-bg-card)' }}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                                                {order.customer}
                                            </span>
                                            <span 
                                                className="px-2 py-0.5 text-xs rounded-full"
                                                style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                                            >
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            <span>{order.items}</span>
                                            <span>•</span>
                                            <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                                                {order.total}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {order.time}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} style={{ color: 'var(--color-text-tertiary)' }} />
                                </motion.div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}