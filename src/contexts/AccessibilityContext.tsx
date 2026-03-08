'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
    useRef,
} from 'react';
import {
    AccessibilitySettings,
    AccessibilityContextType,
    AccessibilityPreset,
} from '@/types/accessibility.types';
import {
    DEFAULT_ACCESSIBILITY_SETTINGS,
    ACCESSIBILITY_PRESETS,
    ACCESSIBILITY_STORAGE_KEY,
} from '@/lib/constants/accessibility.constants';

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(
    undefined
);

interface AccessibilityProviderProps {
    children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
    const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY_SETTINGS);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const announcerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);

                setSettings({ ...DEFAULT_ACCESSIBILITY_SETTINGS, ...parsed });
            }
        } catch (error) {
            console.error('Error loading accessibility settings:', error);
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            try {
                localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(settings));
            } catch (error) {
                console.error('Error saving accessibility settings:', error);
            }
        }
    }, [settings, isHydrated]);

    useEffect(() => {
        if (!isHydrated) return;

        document.documentElement.classList.toggle('a11y-high-contrast', settings.highContrast);
        document.documentElement.classList.toggle('a11y-large-text', settings.largeText);
        document.documentElement.classList.toggle('a11y-reduced-motion', settings.reducedMotion);
        document.documentElement.classList.toggle('a11y-large-targets', settings.largeClickTargets);
        document.documentElement.classList.toggle('a11y-simplified', settings.simplifiedInterface);
        document.documentElement.classList.toggle('a11y-dyslexia-friendly', settings.dyslexiaFriendly);
        document.documentElement.classList.toggle('a11y-reading-guide', settings.readingGuide);
        document.documentElement.classList.toggle('a11y-reduced-distractions', settings.reducedDistractions);

        if (settings.reducedMotion) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        } else {
            document.documentElement.style.removeProperty('--animation-duration');
        }
    }, [settings, isHydrated]);

    const updateSetting = useCallback(
        <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
            setSettings((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const applyPreset = useCallback((preset: AccessibilityPreset) => {
        setSettings(ACCESSIBILITY_PRESETS[preset]);
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_ACCESSIBILITY_SETTINGS);
    }, []);

    const announce = useCallback(
        (message: string, priority: 'polite' | 'assertive' = 'polite') => {
            if (announcerRef.current) {
                announcerRef.current.setAttribute('aria-live', priority);
                announcerRef.current.textContent = '';
                setTimeout(() => {
                    if (announcerRef.current) {
                        announcerRef.current.textContent = message;
                    }
                }, 100);
            }
        },
        []
    );

    return (
        <AccessibilityContext.Provider
            value={{
                settings,
                updateSetting,
                applyPreset,
                resetSettings,
                isPanelOpen,
                setIsPanelOpen,
                announce,
            }}
        >
            <div
                ref={announcerRef}
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            />
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
}
