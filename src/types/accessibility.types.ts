export interface AccessibilitySettings {
    // Visual
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;

    // Motor
    keyboardNavigation: boolean;
    largeClickTargets: boolean;
    extendedTimeout: boolean;

    // Hearing
    visualAlerts: boolean;

    // Cognitive
    simplifiedInterface: boolean;
    dyslexiaFriendly: boolean;
    readingGuide: boolean;
    reducedDistractions: boolean;
}

export type AccessibilityPreset = 'default' | 'blind' | 'lowVision' | 'motor' | 'hearing' | 'cognitive';

export interface AccessibilityContextType {
    settings: AccessibilitySettings;
    updateSetting: <K extends keyof AccessibilitySettings>(
        key: K,
        value: AccessibilitySettings[K]
    ) => void;
    applyPreset: (preset: AccessibilityPreset) => void;
    resetSettings: () => void;
    isPanelOpen: boolean;
    setIsPanelOpen: (open: boolean) => void;
    announce: (message: string, priority?: 'polite' | 'assertive') => void;
}
