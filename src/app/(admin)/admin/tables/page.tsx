// src/app/(admin)/admin/tables/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Table, CheckCircle, XCircle, Clock, Trash2, ChevronLeft, Users, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getTables, createTable, updateTableStatus, deleteTable } from '@/actions/restaurantActions';
import { RestaurantTable } from '@/types/restaurant-management.types';

const LOCATIONS = ['Salão Principal', 'Terraço', 'Varanda', 'Salão Privativo', 'Bar'];

export default function TablesPage() {
    const router = useRouter();
    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingTable, setIsAddingTable] = useState(false);
    const [newTable, setNewTable] = useState({ number: '', capacity: '4', location: 'Salão Principal' });

    useEffect(() => {
        const loadTables = async () => {
            const result = await getTables();
            if (result.data) {
                setTables(result.data);
            }
            setIsLoading(false);
        };
        loadTables();
    }, []);

    const handleAddTable = async () => {
        if (!newTable.number) {
            toast.error('Informe o número da mesa');
            return;
        }

        setIsAddingTable(true);
        const result = await createTable({
            number: parseInt(newTable.number),
            capacity: parseInt(newTable.capacity),
            location: newTable.location,
            status: 'available',
        });

        if (result.data) {
            setTables(prev => [...prev, result.data!]);
            toast.success(`Mesa ${newTable.number} adicionada`);
            setNewTable({ number: '', capacity: '4', location: 'Salão Principal' });
        } else {
            toast.error(result.error || 'Erro ao adicionar mesa');
        }

        setIsAddingTable(false);
    };

    const handleStatusChange = async (tableId: string, status: RestaurantTable['status']) => {
        const result = await updateTableStatus(tableId, status);
        if (result.success) {
            setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
            toast.success('Status atualizado');
        } else {
            toast.error(result.error || 'Erro ao atualizar');
        }
    };

    const handleDelete = async (tableId: string) => {
        const result = await deleteTable(tableId);
        if (result.success) {
            setTables(prev => prev.filter(t => t.id !== tableId));
            toast.success('Mesa removida');
        } else {
            toast.error(result.error || 'Erro ao remover');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return { bg: '#D1FAE5', text: '#059669', icon: <CheckCircle size={16} /> };
            case 'occupied': return { bg: '#FEE2E2', text: '#DC2626', icon: <Users size={16} /> };
            case 'reserved': return { bg: '#FEF3C7', text: '#D97706', icon: <Clock size={16} /> };
            default: return { bg: '#F3F4F6', text: '#6B7280', icon: <Table size={16} /> };
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'available': return 'Livre';
            case 'occupied': return 'Ocupada';
            case 'reserved': return 'Reservada';
            default: return status;
        }
    };

    const availableCount = tables.filter(t => t.status === 'available').length;
    const occupiedCount = tables.filter(t => t.status === 'occupied').length;
    const reservedCount = tables.filter(t => t.status === 'reserved').length;

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
            <div className="p-4 border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2">
                        <ChevronLeft size={20} style={{ color: 'var(--color-text)' }} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-[#00A082]/10 flex items-center justify-center">
                        <Table size={20} className="text-[#00A082]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Mesas</h1>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {tables.length} mesa{tables.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 p-4">
                <div className="p-3 rounded-xl text-center" style={{ backgroundColor: '#D1FAE5' }}>
                    <CheckCircle size={20} className="mx-auto mb-1 text-[#059669]" />
                    <span className="text-lg font-bold" style={{ color: '#059669' }}>{availableCount}</span>
                    <p className="text-xs" style={{ color: '#059669' }}>Livres</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ backgroundColor: '#FEE2E2' }}>
                    <Users size={20} className="mx-auto mb-1 text-[#DC2626]" />
                    <span className="text-lg font-bold" style={{ color: '#DC2626' }}>{occupiedCount}</span>
                    <p className="text-xs" style={{ color: '#DC2626' }}>Ocupadas</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ backgroundColor: '#FEF3C7' }}>
                    <Clock size={20} className="mx-auto mb-1 text-[#D97706]" />
                    <span className="text-lg font-bold" style={{ color: '#D97706' }}>{reservedCount}</span>
                    <p className="text-xs" style={{ color: '#D97706' }}>Reservadas</p>
                </div>
            </div>

            {/* Add Table Form */}
            <div className="p-4">
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <h3 className="font-medium mb-3" style={{ color: 'var(--color-text)' }}>Adicionar Mesa</h3>
                    <div className="flex gap-3">
                        <input
                            type="number"
                            value={newTable.number}
                            onChange={(e) => setNewTable(prev => ({ ...prev, number: e.target.value }))}
                            placeholder="Nº"
                            className="w-20 px-3 py-2 rounded-xl text-center"
                            style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                        />
                        <select
                            value={newTable.capacity}
                            onChange={(e) => setNewTable(prev => ({ ...prev, capacity: e.target.value }))}
                            className="flex-1 px-3 py-2 rounded-xl"
                            style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                        >
                            {[1,2,3,4,5,6,7,8,10,12].map(n => (
                                <option key={n} value={n}>{n} {n === 1 ? 'lugar' : 'lugares'}</option>
                            ))}
                        </select>
                        <select
                            value={newTable.location}
                            onChange={(e) => setNewTable(prev => ({ ...prev, location: e.target.value }))}
                            className="flex-1 px-3 py-2 rounded-xl"
                            style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                        >
                            {LOCATIONS.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAddTable}
                            disabled={isAddingTable}
                            className="px-4 py-2 rounded-xl bg-[#00A082] text-white font-medium disabled:opacity-50"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tables List */}
            <div className="p-4 pt-0 space-y-3">
                {tables.length === 0 ? (
                    <div className="text-center py-12">
                        <Table size={48} className="mx-auto mb-4 text-gray-300" />
                        <p style={{ color: 'var(--color-text-secondary)' }}>Nenhuma mesa cadastrada</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Adicione mesas para reservas</p>
                    </div>
                ) : (
                    tables.map((table, index) => {
                        const status = getStatusColor(table.status);
                        return (
                            <motion.div
                                key={table.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-4 p-4 rounded-2xl"
                                style={{ backgroundColor: 'var(--color-bg-card)' }}
                            >
                                <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: status.bg, color: status.text }}
                                >
                                    <Table size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold" style={{ color: 'var(--color-text)' }}>Mesa {table.number}</span>
                                        <span 
                                            className="px-2 py-0.5 text-xs rounded-full flex items-center gap-1"
                                            style={{ backgroundColor: status.bg, color: status.text }}
                                        >
                                            {status.icon}
                                            {getStatusLabel(table.status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            {table.capacity} lugares
                                        </span>
                                        <span>•</span>
                                        <span>{table.location}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {table.status === 'available' && (
                                        <button
                                            onClick={() => handleStatusChange(table.id, 'occupied')}
                                            className="p-2 rounded-lg"
                                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                                        >
                                            <Users size={18} style={{ color: 'var(--color-text-secondary)' }} />
                                        </button>
                                    )}
                                    {table.status === 'occupied' && (
                                        <button
                                            onClick={() => handleStatusChange(table.id, 'available')}
                                            className="p-2 rounded-lg"
                                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                                        >
                                            <CheckCircle size={18} style={{ color: '#059669' }} />
                                        </button>
                                    )}
                                    {table.status === 'available' && (
                                        <button
                                            onClick={() => handleStatusChange(table.id, 'reserved')}
                                            className="p-2 rounded-lg"
                                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                                        >
                                            <Clock size={18} style={{ color: '#D97706' }} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(table.id)}
                                        className="p-2 rounded-lg"
                                        style={{ backgroundColor: '#FEE2E2' }}
                                    >
                                        <Trash2 size={18} style={{ color: '#DC2626' }} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}