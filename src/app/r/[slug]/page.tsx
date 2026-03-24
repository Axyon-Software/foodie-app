// src/app/r/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RestaurantHeader } from "@/components/restaurant/RestaurantHeader";
import { MenuSection } from "@/components/restaurant/MenuSection";

export default async function RestaurantPage({
                                                 params,
                                             }: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const restaurantData = await prisma.restaurant.findUnique({
        where: { subdomain: slug },
        include: {
            categories: {
                include: {
                    products: {
                        where: { is_available: true },
                        orderBy: { name: "asc" },
                    },
                },
                orderBy: { sort_order: "asc" },
            },
        },
    });

    if (!restaurantData) {
        notFound();
    }

    // ✅ MAPEAR PARA O FORMATO QUE OS COMPONENTES ESPERAM
    const restaurant = {
        ...restaurantData,
        categories: restaurantData.categories.map(category => ({
            id: category.id,
            name: category.name,
            restaurantId: category.restaurant_id, // ✅ Converte snake → camel
            products: category.products.map(product => ({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                imageUrl: product.image, // ✅ image → imageUrl
                isAvailable: product.is_available, // ✅ is_available → isAvailable
                restaurantId: product.restaurant_id, // ✅ restaurant_id → restaurantId
            }))
        }))
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            <RestaurantHeader restaurant={restaurantData} />
            <MenuSection categories={restaurant.categories} />
        </div>
    );
}