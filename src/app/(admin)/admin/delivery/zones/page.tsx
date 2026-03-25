// src/app/(admin)/admin/delivery/zones/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Trash2, ToggleLeft, ToggleRight, ChevronLeft, Clock, DollarSign, Truck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getDeliveryZones, createDeliveryZone, toggleDeliveryZone, deleteDeliveryZone } from '@/actions/delivery-actions';
import { DeliveryZone, CreateDeliveryZoneRequest } from '@/types/delivery.types';

const RADIUS_OPTIONS = [1, 2, 3, 5, 7, 10, 15, 20];

export default function DeliveryZonesPage() {
    const router = useRouter();
    const [zones, setZones] = useState<DeliveryZone[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<CreateDeliveryZoneRequest>({
        name: '',
        type: 'RADIUS',
        radiusKm: 5,
        deliveryFee: 5.99,
        minOrderValue: 20,
        estimatedTimeMinutes: 45,
        priority: 1,
    });

    useEffect(() => {
        const loadZones = async () => {
            const result = await getDeliveryZones();
            if (result.data) setZones(result.data);
            setIsLoading(false);
        };
        loadZones();
    }, []);

    const handleCreate = async () => {
        if (!formData.name) {
            toast.error('Nome é obrigatório');
            return;
        }

        setIsSaving(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    formData.center = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    const result = await createDeliveryZone(formData);
                    if (result.data) {
                        setZones(prev => [...prev, result.data!]);
                        toast.success('Zona criada!');
                        setShowModal(false);
                        resetForm();
                    } else {
                        toast.error(result.error || 'Erro ao criar');
                    }
                    setIsSaving(false);
                },
                async () => {
                    toast.error('Permita acesso à localização');
                    setIsSaving(false);
                }
            );
        }
    };

    const handleToggle = async (zoneId: string, current: boolean) => {
        const result = await toggleDeliveryZone(zoneId, !current);
        if (result.success) {
            setZones(prev => prev.map(z => z.id === zoneId ? { ...z, isActive: !current } : z));
            toast.success(!current ? 'Zona ativada' : 'Zona desativada');
        }
    };

    const handleDelete = async (zoneId: string) => {
        if (!confirm('Excluir esta zona?')) return;
        const result = await deleteDeliveryZone(zoneId);
        if (result.success) {
            setZones(prev => prev.filter(z => z.id !== zoneId));
            toast.success('Zona excluída');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'RADIUS',
            radiusKm: 5,
            deliveryFee: 5.99,
            minOrderValue: 20,
            estimatedTimeMinutes: 45,
            priority: 1,
        });
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
            <div className="p-4 border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 -ml-2">
                            <ChevronLeft size={20} style={{ color: 'var(--color-text)' }} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-[#00A082]/10 flex items-center justify-center">
                            <MapPin size={20} className="text-[#00A082]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Zonas de Entrega</h1>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{zones.length} zonas</p>
                        </div>
                    </div>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00A082] text-white font-medium">
                        <Plus size={18} /> Nova
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 p-4">
                <div className="p-3 rounded-xl text-center" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <span className="text-lg font-bold text-[#00A082]">{zones.filter(z => z.isActive).length}</span>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Ativas</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <span className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                        {zones.length > 0 ? Math.max(...zones.map(z => z.radiusKm || 0)) : 0}km
                    </span>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Raio Máx</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <span className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                        R$ {zones.length > 0 ? Math.min(...zones.map(z => z.deliveryFee)).toFixed(2) : '0'}
                    </span>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Menor Frete</p>
                </div>
            </div>

            {/* Zones List */}
            <div className="p-4 space-y-3">
                {zones.length === 0 ? (
                    <div className="text-center py-12">
                        <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="mb-2" style={{ color: 'var(--color-text-secondary)' }}>Nenhuma zona cadastrada</p>
                        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Defina zonas para cálculo automático de frete</p>
                    </div>
                ) : (
                    zones.map((zone, index) => (
                        <motion.div
                            key={zone.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="p-4 rounded-2xl"
                            style={{ backgroundColor: 'var(--color-bg-card)', opacity: zone.isActive ? 1 : 0.5 }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#00A082]/10 flex items-center justify-center">
                                        <MapPin size={20} className="text-[#00A082]" />
                                    </div>
                                    <div>
                                        <span className="font-bold" style={{ color: 'var(--color-text)' }}>{zone.name}</span>
                                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                            Raio {zone.radiusKm}km
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleToggle(zone.id, zone.isActive)}>
                                        {zone.isActive ? (
                                            <ToggleRight size={28} className="text-green-500" />
                                        ) : (
                                            <ToggleLeft size={28} className="text-gray-400" />
                                        )}
                                    </button>
                                    <button onClick={() => handleDelete(zone.id)} className="p-1.5 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                                        <Trash2 size={14} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                    <div className="flex items-center gap-1 mb-1">
                                        <DollarSign size={12} className="text-[#00A082]" />
                                        <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Frete</span>
                                    </div>
                                    <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>R$ {zone.deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                    <div className="flex items-center gap-1 mb-1">
                                        <Clock size={12} className="text-[#00A082]" />
                                        <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Tempo</span>
                                    </div>
                                    <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{zone.estimatedTimeMinutes}min</span>
                                </div>
                                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                    <div className="flex items-center gap-1 mb-1">
                                        <Truck size={12} className="text-[#00A082]" />
                                        <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Mínimo</span>
                                    </div>
                                    <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>R$ {zone.minOrderValue.toFixed(2)}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-4 max-h-[90vh] overflow-y-auto"
                        style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                        <h3 className="font-bold mb-4" style={{ color: 'var(--color-text)' }}>Nova Zona de Entrega</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text)' }}>Nome *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    placeholder="Ex: Zona Sul"
                                    className="w-full px-4 py-3 rounded-xl outline-none"
                                    style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text)' }}>Raio (km)</label>
                                <div className="flex flex-wrap gap-2">
                                    {RADIUS_OPTIONS.map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setFormData(p => ({ ...p, radiusKm: r }))}
                                            className={`px-4 py-2 rounded-full text-sm font-medium ${formData.radiusKm === r ? 'bg-[#00A082] text-white' : ''}`}
                                            style={{ backgroundColor: formData.radiusKm === r ? '#00A082' : 'var(--color-bg-secondary)', color: formData.radiusKm === r ? 'white' : 'var(--color-text-secondary)' }}
                                        >
                                            {r}km
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text)' }}>Frete (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.deliveryFee}
                                        onChange={(e) => setFormData(p => ({ ...p, deliveryFee: parseFloat(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 rounded-xl outline-none"
                                        style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text)' }}>Tempo (min)</label>
                                    <input
                                        type="number"
                                        value={formData.estimatedTimeMinutes}
                                        onChange={(e) => setFormData(p => ({ ...p, estimatedTimeMinutes: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 rounded-xl outline-none"
                                        style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text)' }}>Pedido Mín.</label>
                                    <input
                                        type="number"
                                        value={formData.minOrderValue}
                                        onChange={(e) => setFormData(p => ({ ...p, minOrderValue: parseFloat(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 rounded-xl outline-none"
                                        style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 py-3 rounded-xl font-medium" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>Cancelar</button>
                                <button onClick={handleCreate} disabled={isSaving} className="flex-1 py-3 rounded-xl font-medium bg-[#00A082] text-white flex items-center justify-center gap-2">
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Criar'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}