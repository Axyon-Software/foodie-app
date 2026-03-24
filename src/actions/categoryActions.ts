// src/actions/categoryActions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ============================================================================
// SCHEMAS DE VALIDAÇÃO
// ============================================================================

const categorySchema = z.object({
    restaurantId: z.string().min(1, 'ID de restaurante é obrigatório'),
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    description: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    sortOrder: z.number().int().min(0).optional().default(0),
})

// ============================================================================
// FUNÇÕES DE LEITURA (GET)
// ============================================================================

export async function getCategories(restaurantId: string) {
    try {
        const categories = await prisma.category.findMany({
            where: {
                restaurant_id: restaurantId,
            },
            orderBy: {
                sort_order: 'asc', // ✅ CORRETO AGORA
            },
        })

        return { categories, error: null }
    } catch (error) {
        console.error('Error fetching categories:', error)
        return { error: 'Erro ao buscar categorias', categories: [] }
    }
}

export async function getCategory(categoryId: string) {
    try {
        const category = await prisma.category.findUnique({
            where: {
                id: categoryId,
            },
        })

        if (!category) {
            return { error: 'Categoria não encontrada', category: null }
        }

        return { category, error: null }
    } catch (error) {
        console.error('Error fetching category:', error)
        return { error: 'Erro ao buscar categoria', category: null }
    }
}

// ============================================================================
// FUNÇÕES DE CRIAÇÃO (CREATE)
// ============================================================================

export async function createCategory(formData: FormData) {
    try {
        const data = {
            restaurantId: formData.get('restaurantId') as string,
            name: formData.get('name') as string,
            description: (formData.get('description') as string) || undefined,
            icon: (formData.get('icon') as string) || undefined,
            image: (formData.get('image') as string) || undefined,
            sortOrder: formData.get('sortOrder')
                ? Number(formData.get('sortOrder'))
                : 0,
        }

        const result = categorySchema.safeParse(data)

        if (!result.success) {
            return { error: result.error.issues[0].message }
        }

        const category = await prisma.category.create({
            data: {
                restaurant_id: result.data.restaurantId,
                name: result.data.name,
                description: result.data.description,
                icon: result.data.icon,
                image: result.data.image,
                sort_order: result.data.sortOrder, // ✅ CORRETO
            },
        })

        revalidatePath('/dashboard/menu')
        return { category, success: true }
    } catch (error) {
        console.error('Error creating category:', error)
        return { error: 'Erro ao criar categoria' }
    }
}

// ============================================================================
// FUNÇÕES DE ATUALIZAÇÃO (UPDATE)
// ============================================================================

export async function updateCategory(categoryId: string, formData: FormData) {
    try {
        const data = {
            name: formData.get('name') as string,
            description: (formData.get('description') as string) || null,
            icon: (formData.get('icon') as string) || null,
            image: (formData.get('image') as string) || null,
            sort_order: formData.get('sortOrder')
                ? Number(formData.get('sortOrder'))
                : 0,
        }

        const category = await prisma.category.update({
            where: {
                id: categoryId,
            },
            data,
        })

        revalidatePath('/dashboard/menu')
        return { category, success: true }
    } catch (error) {
        console.error('Error updating category:', error)
        return { error: 'Erro ao atualizar categoria' }
    }
}

export async function reorderCategories(restaurantId: string, categoryIds: string[]) {
    try {
        await Promise.all(
            categoryIds.map((id, index) =>
                prisma.category.update({
                    where: { id },
                    data: { sort_order: index }, // ✅ CORRETO
                })
            )
        )

        revalidatePath('/dashboard/menu')
        return { success: true }
    } catch (error) {
        console.error('Error reordering categories:', error)
        return { error: 'Erro ao reordenar categorias' }
    }
}

// ============================================================================
// FUNÇÕES DE EXCLUSÃO (DELETE)
// ============================================================================

export async function deleteCategory(categoryId: string) {
    try {
        const productsCount = await prisma.product.count({
            where: {
                category_id: categoryId,
            },
        })

        if (productsCount > 0) {
            return {
                error: `Não é possível excluir. Existem ${productsCount} produto(s) nesta categoria.`
            }
        }

        await prisma.category.delete({
            where: {
                id: categoryId,
            },
        })

        revalidatePath('/dashboard/menu')
        return { success: true }
    } catch (error) {
        console.error('Error deleting category:', error)
        return { error: 'Erro ao excluir categoria' }
    }
}