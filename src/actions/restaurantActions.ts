// src/actions/restaurantActions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const restaurantSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    description: z.string().optional(),
    logo: z.string().url().optional().or(z.literal('')),
    coverImage: z.string().url().optional().or(z.literal('')),
    cnpj: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    openingHours: z.array(z.object({
        day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
    })).optional(),
    acceptsReservation: z.boolean().optional(),
    deliveryRadius: z.number().optional(),
    minimumOrder: z.number().optional(),
    estimatedDeliveryTime: z.number().optional(),
    taxPercentage: z.number().optional(),
})

export async function getRestaurant(restaurantId?: string) {
    const supabase = await createClient()
    
    let query = supabase
        .from('restaurants')
        .select('*')
    
    if (restaurantId) {
        query = query.eq('id', restaurantId).single()
    } else {
        query = query.limit(1).single()
    }
    
    const { data, error } = await query
    
    if (error) {
        return { error: error.message, restaurant: null }
    }
    
    return { restaurant: data, error: null }
}

export async function getAllRestaurants() {
    const supabase = await createClient()
    
    const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('name')
    
    if (error) {
        return { error: error.message, restaurants: [] }
    }
    
    return { restaurants: data || [], error: null }
}

export async function createRestaurant(formData: FormData) {
    const supabase = await createClient()
    
    const data = {
        name: formData.get('name'),
        description: formData.get('description') || null,
        logo: formData.get('logo') || null,
        coverImage: formData.get('coverImage') || null,
        cnpj: formData.get('cnpj') || null,
        email: formData.get('email') || null,
        phone: formData.get('phone') || null,
        whatsapp: formData.get('whatsapp') || null,
        street: formData.get('street') || null,
        number: formData.get('number') || null,
        complement: formData.get('complement') || null,
        neighborhood: formData.get('neighborhood') || null,
        city: formData.get('city') || null,
        state: formData.get('state') || null,
        zipCode: formData.get('zipCode') || null,
        openingHours: formData.get('openingHours') ? JSON.parse(formData.get('openingHours') as string) : null,
        settings: {
            acceptsReservation: formData.get('acceptsReservation') === 'true',
            deliveryRadius: Number(formData.get('deliveryRadius')) || 5,
            minimumOrder: Number(formData.get('minimumOrder')) || 0,
            estimatedDeliveryTime: Number(formData.get('estimatedDeliveryTime')) || 45,
            taxPercentage: Number(formData.get('taxPercentage')) || 0,
        },
        isActive: true,
    }
    
    const result = restaurantSchema.safeParse(data)
    
    if (!result.success) {
        return { error: result.error.issues[0].message }
    }
    
    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .insert(result.data)
        .select()
        .single()
    
    if (error) {
        return { error: error.message }
    }
    
    return { restaurant, success: true }
}

export async function updateRestaurant(restaurantId: string, formData: FormData) {
    const supabase = await createClient()
    
    const data = {
        name: formData.get('name'),
        description: formData.get('description') || null,
        logo: formData.get('logo') || null,
        coverImage: formData.get('coverImage') || null,
        cnpj: formData.get('cnpj') || null,
        email: formData.get('email') || null,
        phone: formData.get('phone') || null,
        whatsapp: formData.get('whatsapp') || null,
        street: formData.get('street') || null,
        number: formData.get('number') || null,
        complement: formData.get('complement') || null,
        neighborhood: formData.get('neighborhood') || null,
        city: formData.get('city') || null,
        state: formData.get('state') || null,
        zipCode: formData.get('zipCode') || null,
        openingHours: formData.get('openingHours') ? JSON.parse(formData.get('openingHours') as string) : null,
        settings: {
            acceptsReservation: formData.get('acceptsReservation') === 'true',
            deliveryRadius: Number(formData.get('deliveryRadius')) || 5,
            minimumOrder: Number(formData.get('minimumOrder')) || 0,
            estimatedDeliveryTime: Number(formData.get('estimatedDeliveryTime')) || 45,
            taxPercentage: Number(formData.get('taxPercentage')) || 0,
        },
    }
    
    const result = restaurantSchema.safeParse(data)
    
    if (!result.success) {
        return { error: result.error.issues[0].message }
    }
    
    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .update(result.data)
        .eq('id', restaurantId)
        .select()
        .single()
    
    if (error) {
        return { error: error.message }
    }
    
    return { restaurant, success: true }
}

export async function deleteRestaurant(restaurantId: string) {
    const supabase = await createClient()
    
    const { error } = await supabase
        .from('restaurants')
        .update({ isActive: false })
        .eq('id', restaurantId)
    
    if (error) {
        return { error: error.message }
    }
    
    return { success: true }
}

export async function toggleRestaurantStatus(restaurantId: string, isActive: boolean) {
    const supabase = await createClient()
    
    const { error } = await supabase
        .from('restaurants')
        .update({ isActive })
        .eq('id', restaurantId)
    
    if (error) {
        return { error: error.message }
    }
    
    return { success: true }
}
