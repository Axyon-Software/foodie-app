import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import SkipLinks from '../../../components/accessibility/SkipLinks';

const renderWithAccessibility = (ui: React.ReactNode) => {
    return render(<AccessibilityProvider>{ui}</AccessibilityProvider>);
};

describe('SkipLinks', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        document.body.innerHTML = '';
    });

    it('should render skip links when keyboard navigation is enabled', () => {
        renderWithAccessibility(
            <>
                <SkipLinks />
                <main id="main-content" tabIndex={-1}>Content</main>
            </>
        );

        expect(screen.getByText(/ir para o conteúdo principal/i)).toBeInTheDocument();
        expect(screen.getByText(/ir para navegação/i)).toBeInTheDocument();
        expect(screen.getByText(/ir para busca/i)).toBeInTheDocument();
    });

    it('should have main content link', () => {
        renderWithAccessibility(
            <>
                <SkipLinks />
                <main id="main-content">Content</main>
            </>
        );

        const link = screen.getByText(/ir para o conteúdo principal/i);
        expect(link).toHaveAttribute('href', '#main-content');
    });

    it('should have navigation link', () => {
        renderWithAccessibility(
            <>
                <SkipLinks />
                <nav id="main-nav">Navigation</nav>
            </>
        );

        const link = screen.getByText(/ir para navegação/i);
        expect(link).toHaveAttribute('href', '#main-nav');
    });

    it('should have search link', () => {
        renderWithAccessibility(
            <>
                <SkipLinks />
                <input id="search-input" />
            </>
        );

        const link = screen.getByText(/ir para busca/i);
        expect(link).toHaveAttribute('href', '#search-input');
    });

    it('should be hidden visually but accessible to screen readers', () => {
        renderWithAccessibility(
            <>
                <SkipLinks />
                <main>Content</main>
            </>
        );

        const link = screen.getByText(/ir para o conteúdo principal/i);
        expect(link).toHaveClass('skip-link');
    });

    it('should have proper aria-label', () => {
        renderWithAccessibility(
            <>
                <SkipLinks />
                <main>Content</main>
            </>
        );

        const nav = screen.getByLabelText(/links de navegação rápida/i);
        expect(nav).toBeInTheDocument();
    });
});
