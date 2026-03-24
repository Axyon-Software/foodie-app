// Arquivo: actions/product.ts
"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceString = formData.get("price") as string;
    const categoryId = formData.get("categoryId") as string;

    const cookieStore = await cookies();
    const restaurantId = cookieStore.get("restaurantId")?.value;

    if (!name || !priceString || !categoryId || !restaurantId) {
        return { error: "Campos obrigatórios ausentes." };
    }

    // Converte o preço de texto (ex: "29,90") para número decimal (29.90)
    const price = parseFloat(priceString.replace(",", "."));

    try {
        await prisma.product.create({
            data: {
                name,
                description,
                price,
                categoryId,
                restaurantId,
                imageUrl: "", // Deixaremos vazio por enquanto (adicionaremos fotos no futuro)
                isAvailable: true, // O produto já nasce disponível para venda
            },
        });

        // Atualiza a tela instantaneamente
        revalidatePath("/dashboard/menu");
        return { success: true };

    } catch (error) {
        console.error("Erro ao criar produto:", error);
        return { error: "Erro interno ao criar produto." };
    }
}