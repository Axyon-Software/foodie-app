'use client';

import React, { useEffect } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

export default function ReadingGuide() {
    const { settings } = useAccessibility();

    if (!settings.readingGuide) return null;

    return (
        <div
            className="reading-guide"
            style={{
                top: 'var(--reading-guide-position, 20%)',
            }}
            aria-hidden="true"
        >
            <div className="reading-guide-line" />
        </div>
    );
}

export function ReadingGuideController() {
    const { settings } = useAccessibility();

    useEffect(() => {
        if (!settings.readingGuide) return;

        const handleMouseMove = (e: MouseEvent) => {
            const position = (e.clientY / window.innerHeight) * 100;
            document.documentElement.style.setProperty('--reading-guide-position', `${position}%`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [settings.readingGuide]);

    if (!settings.readingGuide) return null;

    return null;
}