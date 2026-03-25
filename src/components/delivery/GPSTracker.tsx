// src/components/delivery/GPSTracker.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Phone, Clock, Truck, RefreshCw } from 'lucide-react';
import { Delivery, GeoPoint } from '@/types/delivery.types';
import { getDeliveryByOrder } from '@/actions/delivery-actions';

interface GPSTrackerProps {
    orderId: string;
}

export default function GPSTracker({ orderId }: GPSTrackerProps) {
    const [delivery, setDelivery] = useState<Delivery | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState(true);

    const loadDelivery = useCallback(async () => {
        const result = await getDeliveryByOrder(orderId);
        if (result.data) {
            setDelivery(result.data);
        }
        setLastUpdate(new Date());
        setIsLoading(false);
    }, [orderId]);

    useEffect(() => {
        loadDelivery();
        const interval = setInterval(loadDelivery, 15000);
        return () => clearInterval(interval);
    }, [loadDelivery]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <RefreshCw size={24} className="animate-spin text-[#00A082]" />
            </div>
        );
    }

    if (!delivery) {
        return (
            <div className="p-6 text-center rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <Truck size={48} className="mx-auto mb-4 text-gray-300" />
                <p style={{ color: 'var(--color-text-secondary)' }}>Aguardando atribuição de entregador</p>
            </div>
        );
    }

    const statusColors: Record<string, { bg: string; text: string }> = {
        PENDING: { bg: '#FEF3C7', text: '#D97706' },
        ASSIGNED: { bg: '#DBEAFE', text: '#2563EB' },
        PICKED_UP: { bg: '#E0E7FF', text: '#4F46E5' },
        DELIVERING: { bg: '#D1FAE5', text: '#059669' },
        DELIVERED: { bg: '#D1FAE5', text: '#059669' },
    };

    const statusLabels: Record<string, string> = {
        PENDING: 'Aguardando entregador',
        ASSIGNED: 'Entregador a caminho do restaurante',
        PICKED_UP: 'Pedido coletado',
        DELIVERING: 'A caminho da entrega',
        DELIVERED: 'Entregue',
    };

    const colors = statusColors[delivery.status];

    return (
        <div className="space-y-4">
            {/* Status Card */}
            <div className="p-4 rounded-2xl" style={{ backgroundColor: colors.bg }}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.text }}>
                        {delivery.status === 'DELIVERED' ? <Navigation size={24} className="text-white rotate-45" /> : <Truck size={24} className="text-white" />}
                    </div>
                    <div className="flex-1">
                        <span className="font-bold" style={{ color: colors.text }}>{statusLabels[delivery.status]}</span>
                        <p className="text-sm" style={{ color: colors.text, opacity: 0.8 }}>
                            {delivery.estimatedDeliveryTime && `Previsão: ${new Date(delivery.estimatedDeliveryTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                    </div>
                    <button onClick={loadDelivery} className="p-2 rounded-full bg-white/50">
                        <RefreshCw size={16} className={delivery.status !== 'DELIVERED' ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Driver Info */}
            {delivery.driver && (
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#00A082] flex items-center justify-center text-white font-bold">
                            {delivery.driver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1">
                            <span className="font-medium" style={{ color: 'var(--color-text)' }}>{delivery.driver.name}</span>
                            <p className="text-sm flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                                <Truck size={14} /> {delivery.driver.vehicleType === 'MOTO' ? 'Moto' : delivery.driver.vehicleType === 'BIKE' ? 'Bicicleta' : 'Carro'}
                                {delivery.driver.vehiclePlate && ` - ${delivery.driver.vehiclePlate}`}
                            </p>
                        </div>
                        <a
                            href={`tel:${delivery.driver.phone}`}
                            className="w-10 h-10 rounded-full bg-[#00A082] flex items-center justify-center"
                        >
                            <Phone size={18} className="text-white" />
                        </a>
                    </div>
                </div>
            )}

            {/* Map Placeholder */}
            <div 
                className="h-48 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: '#E5E7EB' }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 opacity-50" />
                <MapPin size={32} className="text-[#00A082] mb-2 relative z-10" />
                <p className="text-sm font-medium relative z-10" style={{ color: 'var(--color-text)' }}>
                    {delivery.currentLocation ? 'Localização atualizada' : 'Rastreamento em tempo real'}
                </p>
                <p className="text-xs relative z-10" style={{ color: 'var(--color-text-secondary)' }}>
                    Última atualização: {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>

            {/* Route Info */}
            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>ROTA</h4>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#00A082]/10 flex items-center justify-center shrink-0">
                            <MapPin size={16} className="text-[#00A082]" />
                        </div>
                        <div>
                            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>RETIRADA</span>
                            <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                                {delivery.pickupAddress.street}, {delivery.pickupAddress.number}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pl-3">
                        <div className="w-px h-6 ml-3.5" style={{ backgroundColor: 'var(--color-border)' }} />
                        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{delivery.distanceKm} km</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <Navigation size={16} className="text-red-500" />
                        </div>
                        <div>
                            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>ENTREGA</span>
                            <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                                {delivery.deliveryAddress.street}, {delivery.deliveryAddress.number}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>HISTÓRICO</h4>
                <div className="space-y-3">
                    {delivery.timeline.map((entry, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#00A082]" />
                            <span className="text-sm flex-1" style={{ color: 'var(--color-text)' }}>
                                {statusLabels[entry.status]}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                {new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}