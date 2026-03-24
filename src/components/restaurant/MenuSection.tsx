// src/components/restaurant/MenuSection.tsx
'use client';

import { MenuItemCard } from '@/components/restaurant/MenuItemCard';

interface MenuSectionProps {
    categories: Array<{
        id: string;
        name: string;
        restaurantId: string;
        products: Array<{
            id: string;
            name: string;
            description?: string | null;
            price: number;
            imageUrl?: string | null;
            isAvailable: boolean;
            restaurantId: string;
        }>;
    }>;
}

export function MenuSection({ categories }: MenuSectionProps) {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-28 space-y-8">
            {categories.map((category) => {
                if (category.products.length === 0) return null;

                return (
                    <div key={category.id}>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{category.name}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {category.products.map((product) => (
                                <MenuItemCard
                                    key={product.id}
                                    item={{
                                        ...product,
                                        category: category.name,
                                        restaurantId: product.restaurantId,
                                        image: product.imageUrl || '/placeholder.png',
                                        description: product.description || '',
                                        popular: false,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}