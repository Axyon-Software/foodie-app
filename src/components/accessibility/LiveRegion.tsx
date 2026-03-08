'use client';

import React, { ReactNode, useRef, useState, useCallback } from 'react';

interface LiveRegionProps {
    children: ReactNode;
    announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

export function LiveRegion({ children, announce }: LiveRegionProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
        >
            {children}
        </div>
    );
}

interface ScreenReaderAnnouncerResult {
    announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

export function useScreenReaderAnnouncer(): ScreenReaderAnnouncerResult {
    const announcerRef = useRef<HTMLDivElement | null>(null);

    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        if (announcerRef.current) {
            announcerRef.current.setAttribute('aria-live', priority);
            announcerRef.current.textContent = '';

            setTimeout(() => {
                if (announcerRef.current) {
                    announcerRef.current.textContent = message;
                }
            }, 100);
        }
    }, []);

    return { announce };
}

export function ScreenReaderAnnouncer() {
    return (
        <div
            ref={(el) => {
                if (el) announcerRef.current = el;
            }}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
        />
    );
}

const announcerRef = { current: null as HTMLDivElement | null };

export { announcerRef };
