// src/actions/categoryActions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const categorySchema = z.object({
    restaurantId: z.string().uuid('ID de restaurante inválido'),
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    description: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().url().optional().or(z.literal('')),
    sortOrder: z.number().int().min(0).optional().default(0),
    isActive: z.boolean().optional().default(true),
})

export async function getCategories(restaurantId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
    
    if (error) {
        return { error: error.message, categories: [] }
    }
    
    return { categories: data || [], error: null }
}

export async function getCategory(categoryId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single()
    
    if (error) {
        return { error: error.message, category: null }
    }
    
    return { category: data, error: null }
}

export async function createCategory(formData: FormData) {
    const supabase = await createClient()
    
    const data = {
        restaurant_id: formData.get('restaurantId'),
        name: formData.get('name'),
        description: formData.get('description') || null,
        icon: formData.get('icon') || null,
        image: formData.get('image') || null,
        sort_order: Number(formData.get('sortOrder')) || 0,
        is_active: true,
    }
    
    const result = categorySchema.safeParse(data)
    
    if (!result.success) {
        return { error: result.error.issues[0].message }
    }
    
    const { data: category, error } = await supabase
        .from('categories')
        .insert(result.data)
        .select()
        .single()
    
    if (error) {
        return { error: error.message }
    }
    
    return { category, success: true }
}

export async function updateCategory(categoryId: string, formData: FormData) {
    const supabase = await createClient()
    
    const data = {
        name: formData.get('name'),
        description: formData.get('description') || null,
        icon: formData.get('icon') || null,
        image: formData.get('image') || null,
        sort_order: Number(formData.get('sortOrder')) || 0,
        is_active: formData.get('isActive') !== 'false',
    }
    
    const { data: category, error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', categoryId)
        .select()
        .single()
    
    if (error) {
        return { error: error.message }
    }
    
    return { category, success: true }
}

export async function deleteCategory(categoryId: string) {
    const supabase = await createClient()
    
    const { error } = await supabase
        .from('categories')
        .update({ isActive: false })
        .eq('id', categoryId)
    
    if (error) {
        return { error: error.message }
    }
    
    return { success: true }
}

export async function reorderCategories(restaurantId: string, categoryIds: string[]) {
    const supabase = await createClient()
    
    const updates = categoryIds.map((id, index) => ({
        id,
        sort_order: index,
    }))
    
    for (const update of updates) {
        const { error } = await supabase
            .from('categories')
            .update({ sort_order: update.sort_order })
            .eq('id', update.id)
        
        if (error) {
            return { error: error.message }
        }
    }
    
    return { success: true }
}
