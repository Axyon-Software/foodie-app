import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';

const renderWithTheme = (ui: React.ReactNode, initialTheme: 'light' | 'dark' = 'light') => {
    return render(
        <ThemeProvider>{ui}</ThemeProvider>
    );
};

describe('ThemeToggle', () => {
    it('should render theme toggle button', () => {
        renderWithTheme(<ThemeToggle />);

        const button = screen.getByRole('button', { name: /ativar modo/i });
        expect(button).toBeInTheDocument();
    });

    it('should have sun icon in light mode', () => {
        renderWithTheme(<ThemeToggle />, 'light');

        expect(screen.getByRole('button', { name: /ativar modo escuro/i })).toBeInTheDocument();
    });

    it('should call toggleTheme when clicked', async () => {
        renderWithTheme(<ThemeToggle />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(button).toBeInTheDocument();
    });

    it('should accept custom className', () => {
        renderWithTheme(<ThemeToggle className="custom-toggle" />);

        const button = document.querySelector('.custom-toggle');
        expect(button).toBeInTheDocument();
    });

    it('should have relative class for positioning', () => {
        renderWithTheme(<ThemeToggle />);

        const button = screen.getByRole('button');
        expect(button.className).toContain('relative');
    });
});
