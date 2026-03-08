'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Eye, Hand, Brain, RotateCcw, Check, Volume2 } from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import {
    ACCESSIBILITY_LABELS,
    ACCESSIBILITY_DESCRIPTIONS,
    ACCESSIBILITY_PRESETS,
    DEFAULT_ACCESSIBILITY_SETTINGS,
} from '@/lib/constants/accessibility.constants';
import { AccessibilityPreset } from '@/types/accessibility.types';

function isPresetActive(
    preset: AccessibilityPreset,
    settings: Record<string, unknown>
): boolean {
    const currentSettings = settings as Record<string, unknown>;

    if (preset === 'default') {
        const defaultSettings = DEFAULT_ACCESSIBILITY_SETTINGS as unknown as Record<string, unknown>;
        return Object.keys(defaultSettings).every(
            key => currentSettings[key] === defaultSettings[key]
        );
    }

    const presetSettings = ACCESSIBILITY_PRESETS[preset] as unknown as Record<string, unknown>;
    if (!presetSettings) return false;

    return Object.keys(presetSettings).every(
        key => currentSettings[key] === presetSettings[key]
    );
}

const presetOptions: { value: AccessibilityPreset; label: string; icon: React.ReactNode }[] = [
    { value: 'default', label: 'Padrão', icon: <Settings size={16} /> },
    { value: 'blind', label: 'Cegueira', icon: <Eye size={16} /> },
    { value: 'lowVision', label: 'Baixa Visão', icon: <Eye size={16} /> },
    { value: 'motor', label: 'Motora', icon: <Hand size={16} /> },
    { value: 'hearing', label: 'Auditiva', icon: <Volume2 size={16} /> },
    { value: 'cognitive', label: 'Cognitiva', icon: <Brain size={16} /> },
];

export default function AccessibilityWidget() {
    const {
        settings,
        updateSetting,
        applyPreset,
        resetSettings,
        isPanelOpen,
        setIsPanelOpen,
        announce,
    } = useAccessibility();

    const [activeTab, setActiveTab] = useState<'presets' | 'settings'>('presets');

    const handlePresetClick = (preset: AccessibilityPreset) => {
        applyPreset(preset);
        const label = presetOptions.find(p => p.value === preset)?.label;
        announce(`Perfil de acessibilidade ${label} aplicado`);
    };

    const handleSettingToggle = (key: string) => {
        const currentSettings = settings as unknown as Record<string, boolean>;
        const newValue = !currentSettings[key];

        updateSetting(key as any, newValue);

        const label = ACCESSIBILITY_LABELS[key as keyof typeof ACCESSIBILITY_LABELS];
        announce(`${label} ${newValue ? 'ativado' : 'desativado'}`);
    };

    return (
        <>
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPanelOpen(true)}
                className="fixed bottom-24 right-4 z-50 p-3 rounded-full shadow-lg a11y-widget-button"
                style={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '2px solid var(--color-border)',
                }}
                aria-label="Abrir configurações de acessibilidade"
                title="Acessibilidade"
            >
                <AccessibilityIcon />
            </motion.button>

            <AnimatePresence>
                {isPanelOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed bottom-24 right-4 w-80 max-h-[70vh] overflow-hidden rounded-2xl shadow-2xl z-50"
                        style={{
                            backgroundColor: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                        }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="a11y-title"
                    >
                        <div
                            className="flex items-center justify-between p-4 border-b"
                            style={{ borderColor: 'var(--color-border)' }}
                        >
                            <h2 id="a11y-title" className="text-lg font-semibold">
                                Acessibilidade
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={resetSettings}
                                    className="p-2 rounded-lg transition-colors hover:bg-opacity-10 hover:bg-gray-500"
                                    aria-label="Resetar configurações"
                                    title="Resetar"
                                >
                                    <RotateCcw size={18} />
                                </button>
                                <button
                                    onClick={() => setIsPanelOpen(false)}
                                    className="p-2 rounded-lg transition-colors hover:bg-opacity-10 hover:bg-gray-500"
                                    aria-label="Fechar painel"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div
                            className="flex border-b"
                            style={{ borderColor: 'var(--color-border)' }}
                            role="tablist"
                        >
                            {(['presets', 'settings'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    role="tab"
                                    aria-selected={activeTab === tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                                        activeTab === tab ? 'border-b-2' : ''
                                    }`}
                                    style={{
                                        borderColor: activeTab === tab ? 'var(--color-primary)' : 'transparent',
                                        color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                    }}
                                >
                                    {tab === 'presets' ? 'Perfis' : 'Ajustes'}
                                </button>
                            ))}
                        </div>

                        <div className="overflow-y-auto max-h-[calc(70vh-120px)] p-4">
                            {activeTab === 'presets' ? (
                                <div className="space-y-2" role="radiogroup" aria-label="Selecionar perfil de acessibilidade">
                                    {presetOptions.map((preset) => (
                                        <button
                                            key={preset.value}
                                            role="radio"
                                            aria-checked={isPresetActive(preset.value, settings as unknown as Record<string, unknown>)}
                                            onClick={() => handlePresetClick(preset.value)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-90"
                                            style={{
                                                backgroundColor: 'var(--color-bg-secondary)',
                                            }}
                                        >
                                            <span style={{ color: 'var(--color-primary)' }}>
                                                {preset.icon}
                                            </span>
                                            <span className="flex-1 text-left font-medium">
                                                {preset.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(settings).map(([key, value]) => {
                                        const labelKey = key as keyof typeof ACCESSIBILITY_LABELS;
                                        const isChecked = Boolean(value);
                                        return (
                                            <label
                                                key={key}
                                                className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:opacity-90"
                                                style={{
                                                    backgroundColor: 'var(--color-bg-secondary)',
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleSettingToggle(key)}
                                                    className="sr-only"
                                                />
                                                <span
                                                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                                        isChecked ? 'a11y-checkbox-checked' : 'a11y-checkbox'
                                                    }`}
                                                    style={{
                                                        backgroundColor: isChecked ? 'var(--color-primary)' : 'transparent',
                                                        border: `2px solid ${isChecked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                                    }}
                                                    role="checkbox"
                                                    aria-checked={isChecked}
                                                >
                                                    {isChecked && <Check size={14} className="text-white" />}
                                                </span>
                                                <div className="flex-1">
                                                    <span className="font-medium block">
                                                        {ACCESSIBILITY_LABELS[labelKey]}
                                                    </span>
                                                    <span
                                                        className="text-xs mt-0.5 block"
                                                        style={{ color: 'var(--color-text-secondary)' }}
                                                    >
                                                        {ACCESSIBILITY_DESCRIPTIONS[labelKey]}
                                                    </span>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function AccessibilityIcon() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="10" r="3" />
            <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
            <path d="M12 14v-2" />
            <path d="M12 6v2" />
        </svg>
    );
}