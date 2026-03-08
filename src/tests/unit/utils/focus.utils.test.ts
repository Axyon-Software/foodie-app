import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trapFocus, restoreFocus, getNextFocusable, announceToScreenReader } from '@/lib/utils/focus.utils';

describe('focus.utils', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    describe('trapFocus', () => {
        it('should trap focus within element', () => {
            document.body.innerHTML = `
                <div id="modal">
                    <button>First</button>
                    <button>Last</button>
                </div>
            `;

            const modal = document.getElementById('modal') as HTMLElement;
            const cleanup = trapFocus(modal);

            expect(document.activeElement?.textContent).toBe('First');

            cleanup();
        });

        it('should cycle focus from last to first', () => {
            document.body.innerHTML = `
                <div id="modal">
                    <button id="btn1">First</button>
                    <button id="btn2">Middle</button>
                    <button id="btn3">Last</button>
                </div>
            `;

            const modal = document.getElementById('modal') as HTMLElement;
            const lastButton = document.getElementById('btn3') as HTMLButtonElement;

            lastButton.focus();
            trapFocus(modal);

            const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
            document.activeElement?.dispatchEvent(event);

            expect(document.activeElement?.textContent).toBe('First');
        });

        it('should cycle focus from first to last with shift', () => {
            document.body.innerHTML = `
                <div id="modal">
                    <button id="btn1">First</button>
                    <button id="btn2">Last</button>
                </div>
            `;

            const modal = document.getElementById('modal') as HTMLElement;
            const firstButton = document.getElementById('btn1') as HTMLButtonElement;

            firstButton.focus();
            trapFocus(modal);

            const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
            document.activeElement?.dispatchEvent(event);

            expect(document.activeElement?.textContent).toBe('Last');
        });
    });

    describe('restoreFocus', () => {
        it('should restore focus to previous element', () => {
            const previousElement = document.createElement('button');
            document.body.appendChild(previousElement);
            previousElement.focus();

            const newElement = document.createElement('input');
            document.body.appendChild(newElement);
            newElement.focus();

            restoreFocus(previousElement);

            expect(document.activeElement).toBe(previousElement);
        });

        it('should handle null element', () => {
            expect(() => restoreFocus(null)).not.toThrow();
        });
    });

    describe('getNextFocusable', () => {
        it('should get next focusable element', () => {
            document.body.innerHTML = `
                <button id="btn1">First</button>
                <button id="btn2">Second</button>
                <button id="btn3">Third</button>
            `;

            const firstButton = document.getElementById('btn1') as HTMLButtonElement;
            firstButton.focus();

            const nextButton = getNextFocusable('next', firstButton);

            expect(nextButton?.id).toBe('btn2');
        });

        it('should get previous focusable element', () => {
            document.body.innerHTML = `
                <button id="btn1">First</button>
                <button id="btn2">Second</button>
                <button id="btn3">Third</button>
            `;

            const secondButton = document.getElementById('btn2') as HTMLButtonElement;
            secondButton.focus();

            const prevButton = getNextFocusable('prev', secondButton);

            expect(prevButton?.id).toBe('btn1');
        });

        it('should wrap around to first element', () => {
            document.body.innerHTML = `
                <button id="btn1">First</button>
                <button id="btn2">Second</button>
            `;

            const lastButton = document.getElementById('btn2') as HTMLButtonElement;
            lastButton.focus();

            const nextButton = getNextFocusable('next', lastButton);

            expect(nextButton?.id).toBe('btn1');
        });
    });

    describe('announceToScreenReader', () => {
        it('should not throw when called', () => {
            expect(() => announceToScreenReader('Test message')).not.toThrow();
        });

        it('should support polite priority without throwing', () => {
            expect(() => announceToScreenReader('Polite message', 'polite')).not.toThrow();
        });

        it('should support assertive priority without throwing', () => {
            expect(() => announceToScreenReader('Assertive message', 'assertive')).not.toThrow();
        });
    });
});
