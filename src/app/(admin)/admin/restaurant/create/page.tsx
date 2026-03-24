// src/app/(admin)/admin/restaurant/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Store, MapPin, Phone, Mail, Clock, DollarSign, Image, ChevronLeft, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { createRestaurant } from '@/actions/restaurantActions';

const CATEGORIES = [
    'Lanchonete', 'Restaurante', 'Pizzaria', 'Sorveteria', 'Fast Food',
    'Churrascaria', 'Japanese', 'Italian', 'Mexican', 'Indian', 'Chinese',
    'Thai', 'French', 'Seafood', 'BBQ', 'Vegetarian', 'Cafe', 'Bakery'
];

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface FormData {
    name: string;
    description: string;
    category: string;
    phone: string;
    email: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    deliveryFee: string;
    minimumOrder: string;
    estimatedDeliveryTime: string;
}

interface OperatingHour {
    dayOfWeek: number;
    open: string;
    close: string;
    isClosed: boolean;
}

export default function CreateRestaurantPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        category: '',
        phone: '',
        email: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        deliveryFee: '0',
        minimumOrder: '20',
        estimatedDeliveryTime: '45',
    });
    const [operatingHours, setOperatingHours] = useState<OperatingHour[]>(
        DAYS.map((_, i) => ({ dayOfWeek: i, open: '09:00', close: '22:00', isClosed: i === 0 }))
    );
    const [logo, setLogo] = useState<string | null>(null);
    const [banner, setBanner] = useState<string | null>(null);

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleHourChange = (day: number, field: keyof OperatingHour, value: string | boolean) => {
        setOperatingHours(prev => prev.map(h => 
            h.dayOfWeek === day ? { ...h, [field]: value } : h
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.category || !formData.email || !formData.phone) {
            toast.error('Preencha os campos obrigatórios');
            return;
        }

        setIsLoading(true);
        const result = await createRestaurant({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            cuisine: [],
            phone: formData.phone,
            email: formData.email,
            street: formData.street,
            number: formData.number,
            complement: formData.complement,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            deliveryFee: parseFloat(formData.deliveryFee) || 0,
            minimumOrder: parseFloat(formData.minimumOrder) || 0,
            estimatedDeliveryTime: parseInt(formData.estimatedDeliveryTime) || 45,
        });

        if (result.error) {
            toast.error(result.error);
            setIsLoading(false);
            return;
        }

        toast.success('Restaurante criado com sucesso!');
        router.push('/admin/restaurant');
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
                        <Store size={20} className="text-[#00A082]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                            Criar Restaurante
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Configure seu restaurante
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">
                {/* Imagens */}
                <section>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        IMAGENS
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text)' }}>
                                Logo
                            </label>
                            <div 
                                className="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                                style={{ borderColor: logo ? 'transparent' : 'var(--color-border)' }}
                            >
                                {logo ? (
                                    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <Upload size={24} style={{ color: 'var(--color-text-tertiary)' }} />
                                        <span className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>Upload</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text)' }}>
                                Banner
                            </label>
                            <div 
                                className="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                                style={{ borderColor: banner ? 'transparent' : 'var(--color-border)' }}
                            >
                                {banner ? (
                                    <img src={banner} alt="Banner" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <Upload size={24} style={{ color: 'var(--color-text-tertiary)' }} />
                                        <span className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>Upload</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Informações Básicas */}
                <section>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        INFORMAÇÕES BÁSICAS
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                <Store size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                Nome do Restaurante *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                placeholder="Ex: Lanchonete Gourmet"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                                Categoria *
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                            >
                                <option value="">Selecione...</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                                Descrição
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                placeholder="Descreva seu restaurante..."
                            />
                        </div>
                    </div>
                </section>

                {/* Contato */}
                <section>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        CONTATO
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                    <Phone size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                    Telefone *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                    style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                    <Mail size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                    E-mail *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                    style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                    placeholder="restaurante@email.com"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Endereço */}
                <section>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        ENDEREÇO
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                    <MapPin size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                    Rua
                                </label>
                                <input
                                    type="text"
                                    value={formData.street}
                                    onChange={(e) => handleChange('street', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                    style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                    placeholder="Rua/Avenida"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Número</label>
                                <input
                                    type="text"
                                    value={formData.number}
                                    onChange={(e) => handleChange('number', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                    style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Complemento</label>
                                <input
                                    type="text"
                                    value={formData.complement}
                                    onChange={(e) => handleChange('complement', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                    style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                    placeholder="Apto, sala, etc"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Bairro</label>
                                <input
                                    type="text"
                                    value={formData.neighborhood}
                                    onChange={(e) => handleChange('neighborhood', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                    style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Cidade</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                    style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Estado</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => handleChange('state', e.target.value)}
                                    maxLength={2}
                                    className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                    style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                    placeholder="SP"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>CEP</label>
                            <input
                                type="text"
                                value={formData.zipCode}
                                onChange={(e) => handleChange('zipCode', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                placeholder="00000-000"
                            />
                        </div>
                    </div>
                </section>

                {/* Delivery */}
                <section>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        DELIVERY
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                <DollarSign size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                Taxa Entrega
                            </label>
                            <input
                                type="number"
                                value={formData.deliveryFee}
                                onChange={(e) => handleChange('deliveryFee', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Pedido Mín.</label>
                            <input
                                type="number"
                                value={formData.minimumOrder}
                                onChange={(e) => handleChange('minimumOrder', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Tempo (min)</label>
                            <input
                                type="number"
                                value={formData.estimatedDeliveryTime}
                                onChange={(e) => handleChange('estimatedDeliveryTime', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                            />
                        </div>
                    </div>
                </section>

                {/* Horário de Funcionamento */}
                <section>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        HORÁRIO DE FUNCIONAMENTO
                    </h2>
                    <div className="space-y-3">
                        {operatingHours.map((hour) => (
                            <div key={hour.dayOfWeek} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                                <div className="w-24">
                                    <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                        {DAYS[hour.dayOfWeek]}
                                    </span>
                                </div>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={!hour.isClosed}
                                        onChange={(e) => handleHourChange(hour.dayOfWeek, 'isClosed', !e.target.checked)}
                                        className="w-4 h-4 rounded text-[#00A082]"
                                    />
                                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Aberto</span>
                                </label>
                                {!hour.isClosed && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="time"
                                            value={hour.open}
                                            onChange={(e) => handleHourChange(hour.dayOfWeek, 'open', e.target.value)}
                                            className="px-2 py-1 rounded text-sm"
                                            style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)' }}
                                        />
                                        <span style={{ color: 'var(--color-text-secondary)' }}>às</span>
                                        <input
                                            type="time"
                                            value={hour.close}
                                            onChange={(e) => handleHourChange(hour.dayOfWeek, 'close', e.target.value)}
                                            className="px-2 py-1 rounded text-sm"
                                            style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)' }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
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
                                Criando...
                            </>
                        ) : (
                            <>
                                <Store size={20} />
                                Criar Restaurante
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}