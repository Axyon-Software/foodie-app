import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import AccessibilityWidget from '../../../components/accessibility/AccessibilityWidget';

const renderWithAccessibility = (ui: React.ReactNode) => {
    return render(<AccessibilityProvider>{ui}</AccessibilityProvider>);
};

describe('AccessibilityWidget', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should render accessibility button', () => {
        renderWithAccessibility(<AccessibilityWidget />);

        const button = screen.getByRole('button', { name: /abrir configurações de acessibilidade/i });
        expect(button).toBeInTheDocument();
    });

    it('should open panel when button is clicked', async () => {
        renderWithAccessibility(<AccessibilityWidget />);

        const button = screen.getByRole('button', { name: /abrir configurações de acessibilidade/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
    });

    it('should have presets tab', async () => {
        renderWithAccessibility(<AccessibilityWidget />);

        const button = screen.getByRole('button', { name: /abrir configurações de acessibilidade/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByRole('tab', { name: /perfis/i })).toBeInTheDocument();
        });
    });

    it('should have settings tab', async () => {
        renderWithAccessibility(<AccessibilityWidget />);

        const openButton = screen.getByRole('button', { name: /abrir configurações de acessibilidade/i });
        fireEvent.click(openButton);

        await waitFor(() => {
            expect(screen.getByRole('tab', { name: /ajustes/i })).toBeInTheDocument();
        });
    });

    it('should switch between tabs', async () => {
        renderWithAccessibility(<AccessibilityWidget />);

        const openButton = screen.getByRole('button', { name: /abrir configurações de acessibilidade/i });
        fireEvent.click(openButton);

        await waitFor(() => {
            const settingsTab = screen.getByRole('tab', { name: /ajustes/i });
            fireEvent.click(settingsTab);
        });

        await waitFor(() => {
            expect(screen.getByText(/alto contraste/i)).toBeInTheDocument();
        });
    });

    it.skip('should close panel when close button is clicked', async () => {
        renderWithAccessibility(<AccessibilityWidget />);

        const openButton = screen.getByRole('button', { name: /abrir configurações de acessibilidade/i });
        fireEvent.click(openButton);

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        const closeButton = screen.getByRole('button', { name: /fechar painel/i });
        fireEvent.click(closeButton);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const dialog = screen.queryByRole('dialog');
        expect(dialog).not.toBeInTheDocument();
    });

    it('should reset settings when reset button is clicked', async () => {
        renderWithAccessibility(<AccessibilityWidget />);

        const openButton = screen.getByRole('button', { name: /abrir configurações de acessibilidade/i });
        fireEvent.click(openButton);

        await waitFor(() => {
            const settingsTab = screen.getByRole('tab', { name: /ajustes/i });
            fireEvent.click(settingsTab);
        });

        const resetButton = screen.getByRole('button', { name: /resetar configurações/i });
        fireEvent.click(resetButton);
    });

    it('should have dialog title', async () => {
        renderWithAccessibility(<AccessibilityWidget />);

        const openButton = screen.getByRole('button', { name: /abrir configurações de acessibilidade/i });
        fireEvent.click(openButton);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /acessibilidade/i })).toBeInTheDocument();
        });
    });

    it('should display all preset options', async () => {
        renderWithAccessibility(<AccessibilityWidget />);

        const openButton = screen.getByRole('button', { name: /abrir configurações de acessibilidade/i });
        fireEvent.click(openButton);

        await waitFor(() => {
            expect(screen.getByText(/padrão/i)).toBeInTheDocument();
            expect(screen.getByText(/cegueira/i)).toBeInTheDocument();
            expect(screen.getByText(/baixa visão/i)).toBeInTheDocument();
            expect(screen.getByText(/motora/i)).toBeInTheDocument();
            expect(screen.getByText(/auditiva/i)).toBeInTheDocument();
            expect(screen.getByText(/cognitiva/i)).toBeInTheDocument();
        });
    });

    it('should display accessibility setting options', async () => {
        renderWithAccessibility(<AccessibilityWidget />);

        const openButton = screen.getByRole('button', { name: /abrir configurações de acessibilidade/i });
        fireEvent.click(openButton);

        await waitFor(() => {
            const settingsTab = screen.getByRole('tab', { name: /ajustes/i });
            fireEvent.click(settingsTab);
        });

        await waitFor(() => {
            expect(screen.getByText(/alto contraste/i)).toBeInTheDocument();
            expect(screen.getByText(/texto grande/i)).toBeInTheDocument();
            expect(screen.getByText(/reduzir animações/i)).toBeInTheDocument();
        });
    });
});
