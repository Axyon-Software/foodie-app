// Arquivo: actions/category.ts
"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
    const name = formData.get("name") as string;

    // 👇 Correção do Next.js 15: await no cookies()
    const cookieStore = await cookies();
    const restaurantId = cookieStore.get("restaurantId")?.value;

    if (!name || !restaurantId) {
        return { error: "Erro: Nome da categoria ou restaurante não encontrado." };
    }

    try {
        await prisma.category.create({
            data: {
                name,
                restaurantId,
            },
        });

        revalidatePath("/dashboard/menu");
        return { success: true };

    } catch (error) {
        console.error("Erro ao criar categoria:", error);
        return { error: "Erro interno ao criar categoria." };
    }
}