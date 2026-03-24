import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from '../../contexts/AccessibilityContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AccessibilityProvider>{children}</AccessibilityProvider>
);

describe('useAccessibility', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should start with default settings', () => {
        const { result } = renderHook(() => useAccessibility(), { wrapper });

        expect(result.current.settings.highContrast).toBe(false);
        expect(result.current.settings.largeText).toBe(false);
        expect(result.current.settings.reducedMotion).toBe(false);
        expect(result.current.settings.keyboardNavigation).toBe(true);
    });

    it('should update individual setting', () => {
        const { result } = renderHook(() => useAccessibility(), { wrapper });

        act(() => {
            result.current.updateSetting('highContrast', true);
        });

        expect(result.current.settings.highContrast).toBe(true);
    });

    it('should apply blind preset', () => {
        const { result } = renderHook(() => useAccessibility(), { wrapper });

        act(() => {
            result.current.applyPreset('blind');
        });

        expect(result.current.settings.highContrast).toBe(true);
        expect(result.current.settings.largeText).toBe(true);
        expect(result.current.settings.reducedMotion).toBe(true);
        expect(result.current.settings.keyboardNavigation).toBe(true);
    });

    it('should apply lowVision preset', () => {
        const { result } = renderHook(() => useAccessibility(), { wrapper });

        act(() => {
            result.current.applyPreset('lowVision');
        });

        expect(result.current.settings.highContrast).toBe(true);
        expect(result.current.settings.largeText).toBe(true);
        expect(result.current.settings.dyslexiaFriendly).toBe(true);
    });

    it('should apply motor preset', () => {
        const { result } = renderHook(() => useAccessibility(), { wrapper });

        act(() => {
            result.current.applyPreset('motor');
        });

        expect(result.current.settings.largeText).toBe(true);
        expect(result.current.settings.largeClickTargets).toBe(true);
        expect(result.current.settings.extendedTimeout).toBe(true);
    });

    it('should apply hearing preset', () => {
        const { result } = renderHook(() => useAccessibility(), { wrapper });

        act(() => {
            result.current.applyPreset('hearing');
        });

        expect(result.current.settings.visualAlerts).toBe(true);
    });

    it('should apply cognitive preset', () => {
        const { result } = renderHook(() => useAccessibility(), { wrapper });

        act(() => {
            result.current.applyPreset('cognitive');
        });

        expect(result.current.settings.simplifiedInterface).toBe(true);
        expect(result.current.settings.dyslexiaFriendly).toBe(true);
        expect(result.current.settings.readingGuide).toBe(true);
        expect(result.current.settings.reducedDistractions).toBe(true);
    });

    it('should reset to default settings', () => {
        const { result } = renderHook(() => useAccessibility(), { wrapper });

        act(() => {
            result.current.updateSetting('highContrast', true);
            result.current.updateSetting('largeText', true);
        });

        expect(result.current.settings.highContrast).toBe(true);

        act(() => {
            result.current.resetSettings();
        });

        expect(result.current.settings.highContrast).toBe(false);
        expect(result.current.settings.largeText).toBe(false);
    });

    it('should control panel open state', () => {
        const { result } = renderHook(() => useAccessibility(), { wrapper });

        expect(result.current.isPanelOpen).toBe(false);

        act(() => {
            result.current.setIsPanelOpen(true);
        });

        expect(result.current.isPanelOpen).toBe(true);
    });

    it('should announce messages', () => {
        const { result } = renderHook(() => useAccessibility(), { wrapper });

        expect(() => {
            result.current.announce('Test message');
        }).not.toThrow();
    });

    it('should persist settings to localStorage', () => {
        const { result } = renderHook(() => useAccessibility(), { wrapper });

        act(() => {
            result.current.updateSetting('highContrast', true);
        });

        expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should load settings from localStorage', () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
            JSON.stringify({ highContrast: true, largeText: true })
        );

        const { result } = renderHook(() => useAccessibility(), { wrapper });

        expect(result.current.settings.highContrast).toBe(true);
    });
});
