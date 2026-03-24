// src/app/(profile)/preferences/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Utensils, Check, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getUserPreferences, updateUserPreferences } from '@/actions/profileActions';
import { UserPreferences } from '@/types/user-profile.types';

const CUISINES = [
    'Brasileira', 'Italiana', 'Japonesa', 'Mexicana', 'Chinesa', 
    'Americana', 'Francesa', 'Indiana', 'Thai', 'Árabe', 'Coreana'
];

const DIETARY_RESTRICTIONS = [
    'Vegetariano', 'Vegano', 'Sem Glúten', 'Sem Lactose', 
    'Low Carb', 'Keto', 'Paleo', 'Orgânico'
];

interface ToggleProps {
    enabled: boolean;
    onChange: () => void;
    label: string;
    description: string;
}

function Toggle({ enabled, onChange, label, description }: ToggleProps) {
    return (
        <motion.div 
            whileTap={{ scale: 0.99 }}
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
            <div>
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
            </div>
            <button
                onClick={onChange}
                className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-[#00A082]' : 'bg-gray-300'}`}
            >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'left-7' : 'left-1'}`} />
            </button>
        </motion.div>
    );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selected 
                    ? 'bg-[#00A082] text-white' 
                    : 'border'
            }`}
            style={{ 
                borderColor: selected ? 'transparent' : 'var(--color-border)',
                backgroundColor: selected ? '#00A082' : 'transparent',
                color: selected ? 'white' : 'var(--color-text-secondary)'
            }}
        >
            {children}
        </motion.button>
    );
}

export default function PreferencesPage() {
    const router = useRouter();
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadPreferences = async () => {
            const result = await getUserPreferences();
            if (result.data) {
                setPreferences(result.data);
            }
            setIsLoading(false);
        };
        loadPreferences();
    }, []);

    const handleToggle = async (key: keyof UserPreferences) => {
        if (!preferences) return;
        
        const newValue = !preferences[key as keyof typeof preferences];
        setIsSaving(true);

        const result = await updateUserPreferences({ [key]: newValue });
        
        if (result.success) {
            setPreferences({ ...preferences, [key]: newValue });
            toast.success('Preferência atualizada');
        } else {
            toast.error(result.error || 'Erro ao salvar');
        }
        
        setIsSaving(false);
    };

    const handleCuisineToggle = async (cuisine: string) => {
        if (!preferences) return;
        
        const newCuisines = preferences.favoriteCuisines.includes(cuisine)
            ? preferences.favoriteCuisines.filter(c => c !== cuisine)
            : [...preferences.favoriteCuisines, cuisine];

        setIsSaving(true);
        const result = await updateUserPreferences({ favoriteCuisines: newCuisines });
        
        if (result.success) {
            setPreferences({ ...preferences, favoriteCuisines: newCuisines });
            toast.success('Cozinha favorita atualizada');
        }
        setIsSaving(false);
    };

    const handleDietaryToggle = async (restriction: string) => {
        if (!preferences) return;
        
        const newRestrictions = preferences.dietaryRestrictions.includes(restriction)
            ? preferences.dietaryRestrictions.filter(r => r !== restriction)
            : [...preferences.dietaryRestrictions, restriction];

        setIsSaving(true);
        const result = await updateUserPreferences({ dietaryRestrictions: newRestrictions });
        
        if (result.success) {
            setPreferences({ ...preferences, dietaryRestrictions: newRestrictions });
            toast.success('Restrição alimentar atualizada');
        }
        setIsSaving(false);
    };

    if (isLoading || !preferences) {
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
                        <Settings size={20} className="text-[#00A082]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                            Preferências
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Personalize sua experiência
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Notification Preferences */}
                <section>
                    <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--color-text-secondary)' }}>
                        NOTIFICAÇÕES
                    </h2>
                    <div className="space-y-3">
                        <Toggle
                            enabled={preferences.notificationOrderUpdates}
                            onChange={() => handleToggle('notificationOrderUpdates')}
                            label="Atualizações de Pedidos"
                            description="Receba notificações sobre o status dos pedidos"
                        />
                        <Toggle
                            enabled={preferences.notificationPromotions}
                            onChange={() => handleToggle('notificationPromotions')}
                            label="Promoções e Ofertas"
                            description="Receba notificações sobre promoções"
                        />
                        <Toggle
                            enabled={preferences.notificationNewsletter}
                            onChange={() => handleToggle('notificationNewsletter')}
                            label="Newsletter"
                            description="Receba newsletters com novidades"
                        />
                    </div>
                </section>

                {/* Favorite Cuisines */}
                <section>
                    <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--color-text-secondary)' }}>
                        COZINHAS PREFERIDAS
                    </h2>
                    <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        Selecione seus tipos de culinária favoritos
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {CUISINES.map(cuisine => (
                            <Chip
                                key={cuisine}
                                selected={preferences.favoriteCuisines.includes(cuisine)}
                                onClick={() => handleCuisineToggle(cuisine)}
                            >
                                {cuisine}
                            </Chip>
                        ))}
                    </div>
                </section>

                {/* Dietary Restrictions */}
                <section>
                    <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--color-text-secondary)' }}>
                        RESTRIÇÕES ALIMENTARES
                    </h2>
                    <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        Selecione suas restrições alimentares
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {DIETARY_RESTRICTIONS.map(restriction => (
                            <Chip
                                key={restriction}
                                selected={preferences.dietaryRestrictions.includes(restriction)}
                                onClick={() => handleDietaryToggle(restriction)}
                            >
                                {restriction}
                            </Chip>
                        ))}
                    </div>
                </section>

                {/* Language */}
                <section>
                    <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--color-text-secondary)' }}>
                        IDIOMA
                    </h2>
                    <motion.button
                        whileTap={{ scale: 0.99 }}
                        className="w-full flex items-center justify-between p-4 rounded-2xl"
                        style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg">🇧🇷</span>
                            <span className="font-medium" style={{ color: 'var(--color-text)' }}>Português (Brasil)</span>
                        </div>
                        <Check size={20} className="text-[#00A082]" />
                    </motion.button>
                </section>
            </div>
        </div>
    );
}