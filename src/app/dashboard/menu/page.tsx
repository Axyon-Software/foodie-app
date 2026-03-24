// Arquivo: app/dashboard/menu/page.tsx
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { CategoryForm } from "./CategoryForm";
import { CategoryItem } from "./CategoryItem"; // 👈 Importamos o novo componente

export default async function MenuPage() {
    const cookieStore = await cookies();
    const restaurantId = cookieStore.get("restaurantId")?.value;

    // 👇 MUDANÇA AQUI: Adicionamos o 'include: { products: true }'
    const categories = await prisma.category.findMany({
        where: { restaurantId: restaurantId || "" },
        orderBy: { name: 'asc' },
        include: {
            products: {
                orderBy: { name: 'asc' } // Traz os produtos em ordem alfabética também
            }
        }
    });

    return (
        <div className="max-w-4xl pb-20">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Seu Cardápio</h1>
                <p className="text-gray-500 mt-1">
                    Gerencie suas categorias e produtos. O que você alterar aqui aparece na hora no seu site.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Categoria</h2>
                    <CategoryForm />
                </div>

                <div className="p-0">
                    {categories.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Nenhuma categoria criada ainda. Crie a primeira acima!
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {/* 👇 MUDANÇA AQUI: Usamos o novo componente para cada categoria */}
                            {categories.map((category) => (
                                <CategoryItem key={category.id} category={category} />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}