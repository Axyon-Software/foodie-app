// src/components/restaurant/RestaurantHeader.tsx
import { Store } from 'lucide-react';

interface RestaurantHeaderProps {
    restaurant: {
        name: string;
        description?: string | null;
        isOpen?: boolean;
    };
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
    return (
        <div className="bg-emerald-600 h-32 md:h-48 w-full relative">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 flex items-center gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0">
                        <Store className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                        <p className="text-emerald-600 text-sm font-medium mt-1">
                            {restaurant.isOpen ? '• Aberto para pedidos' : '• Fechado no momento'}
                        </p>
                        {restaurant.description && (
                            <p className="text-gray-500 text-sm mt-1">{restaurant.description}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}