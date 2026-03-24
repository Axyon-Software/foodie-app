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

    // ✅ Correção: Busca no campo 'subdomain' usando o valor de 'slug'
    const restaurant = await prisma.restaurant.findUnique({
        where: { subdomain: slug },
        include: {
            categories: {
                include: {
                    products: {
                        where: { isAvailable: true },
                        orderBy: { name: "asc" },
                    },
                },
                orderBy: { name: "asc" }, // Ou displayOrder se tiver no schema
            },
        },
    });

    if (!restaurant) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            <RestaurantHeader restaurant={restaurant} />
            <MenuSection categories={restaurant.categories} />
        </div>
    );
}