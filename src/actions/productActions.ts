// src/actions/productActions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// ============================================================================
// SCHEMAS DE VALIDAÇÃO
// ============================================================================

const productBadgeSchema = z.enum(['vegetarian', 'vegan', 'gluten_free', 'spicy', 'popular', 'new', 'discount'])

const productSchema = z.object({
    restaurantId: z.string().min(1, 'ID de restaurante é obrigatório'),
    categoryId: z.string().min(1, 'ID de categoria é obrigatório'),
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    description: z.string().optional(),
    price: z.number().min(0, 'Preço deve ser positivo'),
    image: z.string().optional(),
    isActive: z.boolean().optional().default(true),
    isAvailable: z.boolean().optional().default(true),
    badges: z.array(productBadgeSchema).optional().default([]),
    options: z.any().optional(),
    preparationTime: z.number().int().min(1).optional(),
    calories: z.number().int().min(0).optional(),
})

// ============================================================================
// HELPERS
// ============================================================================

function parsePrice(value: FormDataEntryValue | null): number {
    if (!value) return 0
    const stringValue = typeof value === 'string' ? value : value.toString()
    return parseFloat(stringValue.replace(',', '.'))
}

function parseNumber(value: FormDataEntryValue | null): number | undefined {
    if (!value) return undefined
    const stringValue = typeof value === 'string' ? value : value.toString()
    const num = Number(stringValue)
    return isNaN(num) ? undefined : num
}

// ============================================================================
// FUNÇÕES DE LEITURA (GET)
// ============================================================================

export async function getProducts(restaurantId: string, categoryId?: string) {
    try {
        const products = await prisma.product.findMany({
            where: {
                restaurant_id: restaurantId,
                is_active: true,
                ...(categoryId && { category_id: categoryId }),
            },
            orderBy: {
                name: 'asc',
            },
        })

        return { products, error: null }
    } catch (error) {
        console.error('Error fetching products:', error)
        return { error: 'Erro ao buscar produtos', products: [] }
    }
}

export async function getProduct(productId: string) {
    try {
        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            },
        })

        if (!product) {
            return { error: 'Produto não encontrado', product: null }
        }

        return { product, error: null }
    } catch (error) {
        console.error('Error fetching product:', error)
        return { error: 'Erro ao buscar produto', product: null }
    }
}

export async function getAvailableProducts(restaurantId: string) {
    try {
        const products = await prisma.product.findMany({
            where: {
                restaurant_id: restaurantId,
                is_active: true,
                is_available: true,
            },
            orderBy: {
                name: 'asc',
            },
        })

        return { products, error: null }
    } catch (error) {
        console.error('Error fetching products:', error)
        return { error: 'Erro ao buscar produtos', products: [] }
    }
}

export async function searchProducts(restaurantId: string, searchTerm: string) {
    try {
        const products = await prisma.product.findMany({
            where: {
                restaurant_id: restaurantId,
                is_active: true,
                name: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            },
            orderBy: {
                name: 'asc',
            },
        })

        return { products, error: null }
    } catch (error) {
        console.error('Error searching products:', error)
        return { error: 'Erro ao buscar produtos', products: [] }
    }
}

// ============================================================================
// FUNÇÕES DE CRIAÇÃO (CREATE)
// ============================================================================

export async function createProduct(formData: FormData) {
    try {
        const badgesRaw = formData.get('badges')
        const badges = badgesRaw ? JSON.parse(badgesRaw as string) : []

        const optionsRaw = formData.get('options')
        const options = optionsRaw ? JSON.parse(optionsRaw as string) : null

        const data = {
            restaurantId: formData.get('restaurantId') as string,
            categoryId: formData.get('categoryId') as string,
            name: formData.get('name') as string,
            description: (formData.get('description') as string) || undefined,
            price: parsePrice(formData.get('price')),
            image: (formData.get('image') as string) || undefined,
            isActive: true,
            isAvailable: formData.get('isAvailable') !== 'false',
            badges,
            options,
            preparationTime: parseNumber(formData.get('preparationTime')),
            calories: parseNumber(formData.get('calories')),
        }

        const result = productSchema.safeParse(data)

        if (!result.success) {
            return { error: result.error.issues[0].message }
        }

        const product = await prisma.product.create({
            data: {
                restaurant_id: result.data.restaurantId,
                category_id: result.data.categoryId,
                name: result.data.name,
                description: result.data.description,
                price: result.data.price,
                image: result.data.image || '',
                is_active: result.data.isActive,
                is_available: result.data.isAvailable,
                badges: result.data.badges,
                options: result.data.options as Prisma.InputJsonValue,
                preparation_time: result.data.preparationTime,
                calories: result.data.calories,
            },
        })

        revalidatePath('/dashboard/menu')
        return { product, success: true }
    } catch (error) {
        console.error('Error creating product:', error)
        return { error: 'Erro ao criar produto' }
    }
}

// ============================================================================
// FUNÇÕES DE ATUALIZAÇÃO (UPDATE)
// ============================================================================

export async function updateProduct(productId: string, formData: FormData) {
    try {
        const badgesRaw = formData.get('badges')
        const badges = badgesRaw ? JSON.parse(badgesRaw as string) : []

        const optionsRaw = formData.get('options')
        const options = optionsRaw ? JSON.parse(optionsRaw as string) : null

        const data = {
            name: formData.get('name') as string,
            description: (formData.get('description') as string) || null,
            price: parsePrice(formData.get('price')),
            image: (formData.get('image') as string) || null,
            category_id: formData.get('categoryId') as string,
            is_active: formData.get('isActive') !== 'false',
            is_available: formData.get('isAvailable') !== 'false',
            badges,
            options: options as Prisma.InputJsonValue,
            preparation_time: parseNumber(formData.get('preparationTime')) || null,
            calories: parseNumber(formData.get('calories')) || null,
        }

        const product = await prisma.product.update({
            where: {
                id: productId,
            },
            data,
        })

        revalidatePath('/dashboard/menu')
        return { product, success: true }
    } catch (error) {
        console.error('Error updating product:', error)
        return { error: 'Erro ao atualizar produto' }
    }
}

export async function toggleProductAvailability(productId: string, isAvailable: boolean) {
    try {
        await prisma.product.update({
            where: {
                id: productId,
            },
            data: {
                is_available: isAvailable,
            },
        })

        revalidatePath('/dashboard/menu')
        return { success: true }
    } catch (error) {
        console.error('Error toggling availability:', error)
        return { error: 'Erro ao atualizar disponibilidade' }
    }
}

// ============================================================================
// FUNÇÕES DE EXCLUSÃO (DELETE)
// ============================================================================

export async function deleteProduct(productId: string) {
    try {
        await prisma.product.update({
            where: {
                id: productId,
            },
            data: {
                is_active: false,
            },
        })

        revalidatePath('/dashboard/menu')
        return { success: true }
    } catch (error) {
        console.error('Error deleting product:', error)
        return { error: 'Erro ao excluir produto' }
    }
}