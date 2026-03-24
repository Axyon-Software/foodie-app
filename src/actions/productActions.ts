// src/actions/productActions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const productBadgeSchema = z.enum(['vegetarian', 'vegan', 'gluten_free', 'spicy', 'popular', 'new', 'discount'])

const productVariationSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    price: z.number().min(0),
    description: z.string().optional(),
    isDefault: z.boolean().optional(),
})

const productExtraSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    price: z.number().min(0),
    maxQuantity: z.number().int().min(1).optional(),
})

const productOptionSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    type: z.enum(['single', 'multiple']),
    required: z.boolean(),
    variations: z.array(productVariationSchema),
    extras: z.array(productExtraSchema).optional(),
})

const productSchema = z.object({
    restaurantId: z.string().uuid('ID de restaurante inválido'),
    categoryId: z.string().uuid('ID de categoria inválido'),
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    description: z.string().optional(),
    price: z.number().min(0, 'Preço deve ser positivo'),
    image: z.string().url().optional().or(z.literal('')),
    isActive: z.boolean().optional().default(true),
    isAvailable: z.boolean().optional().default(true),
    badges: z.array(productBadgeSchema).optional().default([]),
    options: z.array(productOptionSchema).optional(),
    preparationTime: z.number().int().min(1).optional(),
    calories: z.number().int().min(0).optional(),
})

export async function getProducts(restaurantId: string, categoryId?: string) {
    const supabase = await createClient()
    
    let query = supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
    
    if (categoryId) {
        query = query.eq('category_id', categoryId)
    }
    
    const { data, error } = await query.order('name')
    
    if (error) {
        return { error: error.message, products: [] }
    }
    
    return { products: data || [], error: null }
}

export async function getProduct(productId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()
    
    if (error) {
        return { error: error.message, product: null }
    }
    
    return { product: data, error: null }
}

export async function getAvailableProducts(restaurantId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .eq('is_available', true)
        .order('name')
    
    if (error) {
        return { error: error.message, products: [] }
    }
    
    return { products: data || [], error: null }
}

export async function createProduct(formData: FormData) {
    const supabase = await createClient()
    
    const badges = formData.get('badges') 
        ? JSON.parse(formData.get('badges') as string) 
        : []
    
    const options = formData.get('options')
        ? JSON.parse(formData.get('options') as string)
        : []
    
    const data = {
        restaurant_id: formData.get('restaurantId'),
        category_id: formData.get('categoryId'),
        name: formData.get('name'),
        description: formData.get('description') || null,
        price: Number(formData.get('price')),
        image: formData.get('image') || null,
        is_active: true,
        is_available: formData.get('isAvailable') !== 'false',
        badges,
        options,
        preparation_time: formData.get('preparationTime') 
            ? Number(formData.get('preparationTime')) 
            : null,
        calories: formData.get('calories') 
            ? Number(formData.get('calories')) 
            : null,
    }
    
    const result = productSchema.safeParse(data)
    
    if (!result.success) {
        return { error: result.error.issues[0].message }
    }
    
    const { data: product, error } = await supabase
        .from('products')
        .insert(result.data)
        .select()
        .single()
    
    if (error) {
        return { error: error.message }
    }
    
    return { product, success: true }
}

export async function updateProduct(productId: string, formData: FormData) {
    const supabase = await createClient()
    
    const badges = formData.get('badges') 
        ? JSON.parse(formData.get('badges') as string) 
        : []
    
    const options = formData.get('options')
        ? JSON.parse(formData.get('options') as string)
        : []
    
    const data = {
        name: formData.get('name'),
        description: formData.get('description') || null,
        price: Number(formData.get('price')),
        image: formData.get('image') || null,
        category_id: formData.get('categoryId'),
        is_active: formData.get('isActive') !== 'false',
        is_available: formData.get('isAvailable') !== 'false',
        badges,
        options,
        preparation_time: formData.get('preparationTime') 
            ? Number(formData.get('preparationTime')) 
            : null,
        calories: formData.get('calories') 
            ? Number(formData.get('calories')) 
            : null,
    }
    
    const { data: product, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', productId)
        .select()
        .single()
    
    if (error) {
        return { error: error.message }
    }
    
    return { product, success: true }
}

export async function deleteProduct(productId: string) {
    const supabase = await createClient()
    
    const { error } = await supabase
        .from('products')
        .update({ isActive: false })
        .eq('id', productId)
    
    if (error) {
        return { error: error.message }
    }
    
    return { success: true }
}

export async function toggleProductAvailability(productId: string, isAvailable: boolean) {
    const supabase = await createClient()
    
    const { error } = await supabase
        .from('products')
        .update({ isAvailable })
        .eq('id', productId)
    
    if (error) {
        return { error: error.message }
    }
    
    return { success: true }
}

export async function searchProducts(restaurantId: string, searchTerm: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .ilike('name', `%${searchTerm}%`)
        .order('name')
    
    if (error) {
        return { error: error.message, products: [] }
    }
    
    return { products: data || [], error: null }
}
