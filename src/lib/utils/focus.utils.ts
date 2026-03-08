export function trapFocus(element: HTMLElement) {
    const focusableElements = element.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement?.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement?.focus();
                e.preventDefault();
            }
        }
    }

    element.addEventListener('keydown', handleKeyDown);
    firstFocusableElement?.focus();

    return () => {
        element.removeEventListener('keydown', handleKeyDown);
    };
}

export function restoreFocus(previouslyFocused: HTMLElement | null) {
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
    }
}

export function getNextFocusable(
    direction: 'next' | 'prev',
    currentElement: HTMLElement
): HTMLElement | null {
    const allFocusable = Array.from<HTMLElement>(
        document.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
    ).filter(el => !el.hasAttribute('disabled') && !el.hidden);

    const currentIndex = allFocusable.indexOf(currentElement);

    if (currentIndex === -1) return allFocusable[0] ?? null;

    const nextIndex = direction === 'next'
        ? (currentIndex + 1) % allFocusable.length
        : (currentIndex - 1 + allFocusable.length) % allFocusable.length;

    return allFocusable[nextIndex];
}

export function announceToScreenReader(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
) {
    const announcer = document.getElementById('sr-announcer');
    if (!announcer) return;

    announcer.setAttribute('aria-live', priority);
    announcer.textContent = '';

    setTimeout(() => {
        announcer.textContent = message;
    }, 100);
}
