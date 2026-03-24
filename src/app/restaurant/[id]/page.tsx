// src/app/restaurant/[id]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Star, Clock, Bike } from 'lucide-react';
import { getRestaurantById, getMenuCategoriesByRestaurant } from '@/data/mock';
import { formatPrice } from '@/lib/utils/format.utils';
import { MenuItemCard } from '@/components/restaurant/MenuItemCard';
import CartSidebar from '@/components/cart/CartSidebar';

interface RestaurantPageProps {
    params: Promise<{ id: string }>;
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
    const { id } = await params;
    const restaurant = getRestaurantById(id);

    if (!restaurant) {
        notFound();
    }

    const menuCategories = getMenuCategoriesByRestaurant(id);

    return (
        <div
            className="min-h-screen transition-colors"
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
            {/* Hero Image */}
            <div className="relative h-48 md:h-72">
                <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                {/* Restaurant Info (overlay) */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h1 className="mb-2 text-3xl font-bold md:text-4xl">
                        {restaurant.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <Star size={18} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{restaurant.rating}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <Clock size={18} />
                            <span>{restaurant.deliveryTime}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <Bike size={18} />
                            <span>{formatPrice(restaurant.deliveryFee)}</span>
                        </div>

                        <span className="rounded-full bg-white/20 px-3 py-1">
                            {restaurant.category}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-7xl px-4 py-6">
                <div className="flex gap-8">
                    {/* Menu */}
                    <div className="flex-1">
                        {/* Category Navigation */}
                        <nav
                            className="sticky top-16 z-10 mb-6 border-b py-4 transition-colors"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                borderColor: 'var(--color-border)',
                            }}
                        >
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {menuCategories.map((category) => (
                                    <a
                                        key={category.name}
                                        href={`#${category.name.replace(/\s+/g, '-')}`}
                                        className="whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                                        style={{
                                            backgroundColor: 'var(--color-bg-card)',
                                            borderColor: 'var(--color-border)',
                                            color: 'var(--color-text)',
                                        }}
                                    >
                                        {category.name}
                                    </a>
                                ))}
                            </div>
                        </nav>

                        {/* Menu Items by Category */}
                        {menuCategories.map((category) => (
                            <section
                                key={category.name}
                                id={category.name.replace(/\s+/g, '-')}
                                className="mb-8"
                            >
                                <h2
                                    className="mb-4 text-xl font-bold"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    {category.name}
                                </h2>
                                <div className="grid gap-4">
                                    {category.items.map((item) => (
                                        <MenuItemCard key={item.id} item={item} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Cart Sidebar - Desktop */}
                    <aside className="hidden w-96 lg:block">
                        <div className="sticky top-20">
                            <CartSidebar />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}