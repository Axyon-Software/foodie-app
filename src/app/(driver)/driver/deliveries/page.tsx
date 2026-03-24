// src/app/(driver)/driver/deliveries/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
    MapPin, Phone, Camera, CheckCircle, Navigation, Clock, 
    Truck, Package, ChevronRight, X, Upload, Loader2,
    User, MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getDeliveryByOrder, updateDeliveryStatus, updateDriverLocation, submitDeliveryProof } from '@/actions/delivery-actions';
import { Delivery, DeliveryStatus, GeoPoint } from '@/types/delivery.types';
import { formatPrice } from '@/lib/utils/format.utils';

interface DeliveryProofForm {
    photoUrl: string;
    notes: string;
    signedBy: string;
}

export default function DriverDeliveriesPage() {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showProofModal, setShowProofModal] = useState(false);
    const [proofForm, setProofForm] = useState<DeliveryProofForm>({ photoUrl: '', notes: '', signedBy: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);

    useEffect(() => {
        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setCurrentLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                    },
                    () => toast.error('Permita acesso à localização')
                );
            }
        };
        getLocation();
        const locationInterval = setInterval(getLocation, 30000);
        return () => clearInterval(locationInterval);
    }, []);

    useEffect(() => {
        const updateLocation = async () => {
            if (currentLocation && selectedDelivery?.driverId) {
                await updateDriverLocation(selectedDelivery.driverId, currentLocation);
            }
        };
        if (currentLocation) updateLocation();
    }, [currentLocation, selectedDelivery?.driverId]);

    const handleStatusUpdate = async (status: DeliveryStatus) => {
        if (!selectedDelivery) return;
        
        if (status === 'DELIVERED') {
            setShowProofModal(true);
            return;
        }

        setIsSubmitting(true);
        const result = await updateDeliveryStatus(selectedDelivery.id, status);
        if (result.success) {
            toast.success('Status atualizado!');
            setSelectedDelivery(prev => prev ? { ...prev, status, timeline: [...prev.timeline, { status, timestamp: new Date().toISOString() }] } : null);
        } else {
            toast.error(result.error || 'Erro ao atualizar');
        }
        setIsSubmitting(false);
    };

    const handleSubmitProof = async () => {
        if (!selectedDelivery || !proofForm.photoUrl) {
            toast.error('Adicione uma foto');
            return;
        }

        setIsSubmitting(true);
        
        const proofResult = await submitDeliveryProof(selectedDelivery.id, {
            photoUrl: proofForm.photoUrl,
            notes: proofForm.notes,
            signedBy: proofForm.signedBy,
            location: currentLocation || { latitude: 0, longitude: 0 },
            timestamp: new Date().toISOString(),
        });

        if (proofResult.success) {
            const statusResult = await updateDeliveryStatus(selectedDelivery.id, 'DELIVERED');
            if (statusResult.success) {
                toast.success('Entrega confirmada!');
                setShowProofModal(false);
                setSelectedDelivery(null);
            }
        } else {
            toast.error(proofResult.error || 'Erro ao enviar');
        }
        setIsSubmitting(false);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            PENDING: { bg: '#FEF3C7', text: '#D97706' },
            ASSIGNED: { bg: '#DBEAFE', text: '#2563EB' },
            PICKED_UP: { bg: '#E0E7FF', text: '#4F46E5' },
            DELIVERING: { bg: '#D1FAE5', text: '#059669' },
            DELIVERED: { bg: '#D1FAE5', text: '#059669' },
        };
        return colors[status] || colors.PENDING;
    };

    const getNextAction = (status: DeliveryStatus) => {
        switch (status) {
            case 'ASSIGNED': return { next: 'PICKED_UP', label: 'Confirmar Retirada', icon: <Package size={20} /> };
            case 'PICKED_UP': return { next: 'DELIVERING', label: 'Iniciar Entrega', icon: <Truck size={20} /> };
            case 'DELIVERING': return { next: 'DELIVERED', label: 'Confirmar Entrega', icon: <CheckCircle size={20} /> };
            default: return null;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A082]"></div>
            </div>
        );
    }

    if (selectedDelivery) {
        const colors = getStatusColor(selectedDelivery.status);
        const nextAction = getNextAction(selectedDelivery.status);

        return (
            <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg)' }}>
                {/* Header */}
                <div className="p-4 border-b sticky top-0 z-10" style={{ backgroundColor: colors.bg }}>
                    <div className="flex items-center justify-between">
                        <button onClick={() => setSelectedDelivery(null)} className="text-sm font-medium" style={{ color: colors.text }}>
                            Voltar
                        </button>
                        <span className="font-bold" style={{ color: colors.text }}>
                            #{selectedDelivery.id.substring(0, 8)}
                        </span>
                        <div className="w-12" />
                    </div>
                </div>

                {/* Status */}
                <div className="p-4">
                    <div className="p-4 rounded-2xl" style={{ backgroundColor: colors.bg }}>
                        <div className="flex items-center gap-3">
                            <Truck size={24} style={{ color: colors.text }} />
                            <div>
                                <span className="font-bold" style={{ color: colors.text }}>
                                    {selectedDelivery.status === 'ASSIGNED' ? 'Retirar Pedido' :
                                     selectedDelivery.status === 'PICKED_UP' ? 'Pedido Coletado' :
                                     selectedDelivery.status === 'DELIVERING' ? 'A Caminho' : 'Entregue'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pickup & Delivery */}
                <div className="px-4 space-y-4">
                    <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[#00A082]/10 flex items-center justify-center">
                                <MapPin size={20} className="text-[#00A082]" />
                            </div>
                            <div>
                                <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>RETIRADA</span>
                                <p className="font-medium" style={{ color: 'var(--color-text)' }}>{selectedDelivery.pickupAddress.street}</p>
                                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    {selectedDelivery.pickupAddress.number} - {selectedDelivery.pickupAddress.neighborhood}
                                </p>
                            </div>
                        </div>
                        <div className="h-px my-3" style={{ backgroundColor: 'var(--color-border)' }} />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Navigation size={20} className="text-red-500" />
                            </div>
                            <div>
                                <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>ENTREGA</span>
                                <p className="font-medium" style={{ color: 'var(--color-text)' }}>{selectedDelivery.deliveryAddress.street}</p>
                                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    {selectedDelivery.deliveryAddress.number} - {selectedDelivery.deliveryAddress.neighborhood}
                                </p>
                            </div>
                        </div>
                        {selectedDelivery.deliveryAddress.reference && (
                            <div className="mt-3 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>📍 {selectedDelivery.deliveryAddress.reference}</p>
                            </div>
                        )}
                    </div>

                    {/* Contact */}
                    <div className="flex gap-3">
                        <a href={`tel:`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                            <Phone size={18} className="text-[#00A082]" />
                            <span className="font-medium" style={{ color: 'var(--color-text)' }}>Ligar</span>
                        </a>
                        <a href={`sms:`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                            <MessageCircle size={18} className="text-[#00A082]" />
                            <span className="font-medium" style={{ color: 'var(--color-text)' }}>SMS</span>
                        </a>
                    </div>

                    {/* Navigation */}
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedDelivery.deliveryLocation.latitude},${selectedDelivery.deliveryLocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-4 rounded-xl font-medium"
                        style={{ backgroundColor: '#3B82F6', color: 'white' }}
                    >
                        <Navigation size={20} />
                        Abrir Navegação
                    </a>
                </div>

                {/* Action Button */}
                {nextAction && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 border-t" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                        <button
                            onClick={() => handleStatusUpdate(nextAction.next as DeliveryStatus)}
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-semibold bg-[#00A082] text-white disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : nextAction.icon}
                            {nextAction.label}
                        </button>
                    </div>
                )}

                {/* Proof Modal */}
                {showProofModal && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-4 max-h-[90vh] overflow-y-auto"
                            style={{ backgroundColor: 'var(--color-bg-card)' }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold" style={{ color: 'var(--color-text)' }}>Comprovante de Entrega</h3>
                                <button onClick={() => setShowProofModal(false)}>
                                    <X size={20} style={{ color: 'var(--color-text-secondary)' }} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                        <Camera size={16} /> Foto da Entrega *
                                    </label>
                                    <div className="h-40 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer" style={{ borderColor: 'var(--color-border)' }}>
                                        {proofForm.photoUrl ? (
                                            <img src={proofForm.photoUrl} alt="Proof" className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <Upload size={32} style={{ color: 'var(--color-text-tertiary)' }} />
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={proofForm.photoUrl}
                                        onChange={(e) => setProofForm(p => ({ ...p, photoUrl: e.target.value }))}
                                        placeholder="URL da foto"
                                        className="w-full mt-2 px-3 py-2 rounded-lg outline-none"
                                        style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)' }}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text)' }}>Assinado por</label>
                                    <input
                                        type="text"
                                        value={proofForm.signedBy}
                                        onChange={(e) => setProofForm(p => ({ ...p, signedBy: e.target.value }))}
                                        placeholder="Nome de quem recebeu"
                                        className="w-full px-4 py-3 rounded-xl outline-none"
                                        style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)' }}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text)' }}>Observações</label>
                                    <textarea
                                        value={proofForm.notes}
                                        onChange={(e) => setProofForm(p => ({ ...p, notes: e.target.value }))}
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl outline-none"
                                        style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)' }}
                                    />
                                </div>

                                <button
                                    onClick={handleSubmitProof}
                                    disabled={isSubmitting}
                                    className="w-full py-4 rounded-full font-semibold bg-[#00A082] text-white flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                                    Confirmar Entrega
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="p-4 text-center">
                <Truck size={48} className="mx-auto mb-4 text-gray-300" />
                <h2 className="font-bold mb-2" style={{ color: 'var(--color-text)' }}>Suas Entregas</h2>
                <p style={{ color: 'var(--color-text-secondary)' }}>Nenhuma entrega pendente</p>
            </div>
        </div>
    );
}