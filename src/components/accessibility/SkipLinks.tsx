'use client';

import { useAccessibility } from '@/contexts/AccessibilityContext';

export default function SkipLinks() {
    const { settings } = useAccessibility();

    if (!settings.keyboardNavigation) return null;

    return (
        <nav aria-label="Links de navegação rápida" className="skip-links">
            <a
                href="#main-content"
                className="skip-link"
                onClick={(e) => {
                    e.preventDefault();
                    const main = document.getElementById('main-content');
                    if (main) {
                        main.focus();
                        main.scrollIntoView({ behavior: 'smooth' });
                    }
                }}
            >
                Ir para o conteúdo principal
            </a>
            <a
                href="#main-nav"
                className="skip-link"
                onClick={(e) => {
                    e.preventDefault();
                    const nav = document.getElementById('main-nav');
                    if (nav) {
                        nav.focus();
                        nav.scrollIntoView({ behavior: 'smooth' });
                    }
                }}
            >
                Ir para navegação
            </a>
            <a
                href="#search-input"
                className="skip-link"
                onClick={(e) => {
                    e.preventDefault();
                    const search = document.getElementById('search-input');
                    if (search) {
                        search.focus();
                        search.scrollIntoView({ behavior: 'smooth' });
                    }
                }}
            >
                Ir para busca
            </a>
        </nav>
    );
}
