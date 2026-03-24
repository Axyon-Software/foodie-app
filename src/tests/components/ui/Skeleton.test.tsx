import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton, RestaurantCardSkeleton, MenuItemSkeleton, CategorySkeleton } from '@/components/ui/Skeleton';

describe('Skeleton', () => {
    it('should render skeleton with animate-pulse class', () => {
        render(<Skeleton />);

        const skeleton = document.querySelector('.animate-pulse');
        expect(skeleton).toBeInTheDocument();
    });

    it('should accept custom className', () => {
        render(<Skeleton className="custom-class" />);

        const skeleton = document.querySelector('.custom-class');
        expect(skeleton).toBeInTheDocument();
    });
});

describe('RestaurantCardSkeleton', () => {
    it('should render restaurant card skeleton', () => {
        render(<RestaurantCardSkeleton />);

        const container = document.querySelector('.rounded-2xl');
        expect(container).toBeInTheDocument();
    });

    it('should contain image skeleton', () => {
        render(<RestaurantCardSkeleton />);

        const skeletons = document.querySelectorAll('.animate-pulse');
        expect(skeletons.length).toBeGreaterThan(0);
    });
});

describe('MenuItemSkeleton', () => {
    it('should render menu item skeleton', () => {
        render(<MenuItemSkeleton />);

        const container = document.querySelector('.flex');
        expect(container).toBeInTheDocument();
    });

    it('should contain multiple skeleton elements', () => {
        render(<MenuItemSkeleton />);

        const skeletons = document.querySelectorAll('.animate-pulse');
        expect(skeletons.length).toBeGreaterThan(3);
    });
});

describe('CategorySkeleton', () => {
    it('should render category skeleton with 6 items', () => {
        render(<CategorySkeleton />);

        const skeletons = document.querySelectorAll('.animate-pulse');
        expect(skeletons.length).toBe(6);
    });

    it('should have shrink-0 class for horizontal scroll', () => {
        render(<CategorySkeleton />);

        const container = document.querySelector('.shrink-0');
        expect(container).toBeInTheDocument();
    });
});
