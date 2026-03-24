// src/actions/restaurantActions.ts
'use server'

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import {
    CreateRestaurantForm,
    RestaurantProfile,
    RestaurantTable,
    BankInfo,
    RestaurantStatus,
    OperatingHours
} from '@/types/restaurant-management.types'

// ============================================================================
// SCHEMAS DE VALIDAÇÃO
// ============================================================================

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

// ============================================================================
// FUNÇÕES DE LEITURA (GET)
// ============================================================================

export async function getRestaurant(restaurantId?: string) {
    const supabase = await createClient()

    if (restaurantId) {
        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('id', restaurantId)
            .single()

        if (error) {
            return { error: error.message, restaurant: null }
        }

        return { restaurant: data, error: null }
    } else {
        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .limit(1)
            .single()

        if (error) {
            return { error: error.message, restaurant: null }
        }

        return { restaurant: data, error: null }
    }
}

export async function getRestaurantProfile(): Promise<{ data?: RestaurantProfile; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Usuário não autenticado' }
        }

        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error) {
            return { error: error.message }
        }

        return { data }
    } catch (error) {
        console.error('Error fetching restaurant:', error)
        return { error: 'Erro ao buscar restaurante' }
    }
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

// ============================================================================
// FUNÇÕES DE CRIAÇÃO (CREATE)
// ============================================================================

export async function createRestaurant(data: CreateRestaurantForm): Promise<{ data?: RestaurantProfile; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Usuário não autenticado' }
        }

        const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

        const { data: restaurant, error } = await supabase
            .from('restaurants')
            .insert({
                user_id: user.id,
                name: data.name,
                slug,
                description: data.description,
                category: data.category,
                cuisine: data.cuisine,
                phone: data.phone,
                email: data.email,
                street: data.street,
                number: data.number,
                complement: data.complement,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                zip_code: data.zipCode,
                latitude: data.latitude || 0,
                longitude: data.longitude || 0,
                delivery_fee: data.deliveryFee,
                minimum_order: data.minimumOrder,
                estimated_delivery_time: data.estimatedDeliveryTime,
                status: 'CLOSED' as RestaurantStatus,
            })
            .select()
            .single()

        if (error) {
            return { error: error.message }
        }

        return { data: restaurant }
    } catch (error) {
        console.error('Error creating restaurant:', error)
        return { error: 'Erro ao criar restaurante' }
    }
}

export async function createRestaurantFromFormData(formData: FormData) {
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

// ============================================================================
// FUNÇÕES DE ATUALIZAÇÃO (UPDATE)
// ============================================================================

export async function updateRestaurantProfile(
    data: Partial<RestaurantProfile>
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Usuário não autenticado' }
        }

        const { error } = await supabase
            .from('restaurants')
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error updating restaurant:', error)
        return { error: 'Erro ao atualizar restaurante' }
    }
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

export async function updateRestaurantStatus(
    status: RestaurantStatus
): Promise<{ success?: boolean; error?: string }> {
    return updateRestaurantProfile({ status })
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

export async function updateOperatingHours(
    hours: OperatingHours[]
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Usuário não autenticado' }
        }

        const { error } = await supabase
            .from('restaurants')
            .update({
                operating_hours: hours,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error updating hours:', error)
        return { error: 'Erro ao atualizar horário de funcionamento' }
    }
}

export async function updateBankInfo(
    info: BankInfo
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Usuário não autenticado' }
        }

        const { error } = await supabase
            .from('restaurants')
            .update({
                bank_info: info,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error updating bank info:', error)
        return { error: 'Erro ao atualizar informações bancárias' }
    }
}

// ============================================================================
// FUNÇÕES DE EXCLUSÃO (DELETE)
// ============================================================================

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

// ============================================================================
// MESAS (TABLES)
// ============================================================================

export async function getTables(): Promise<{ data?: RestaurantTable[]; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Usuário não autenticado' }
        }

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!restaurant) {
            return { data: [] }
        }

        const { data, error } = await supabase
            .from('restaurant_tables')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('number')

        if (error) {
            return { error: error.message }
        }

        return { data: data || [] }
    } catch (error) {
        console.error('Error fetching tables:', error)
        return { error: 'Erro ao buscar mesas' }
    }
}

export async function createTable(
    data: Omit<RestaurantTable, 'id'>
): Promise<{ data?: RestaurantTable; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Usuário não autenticado' }
        }

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!restaurant) {
            return { error: 'Restaurante não encontrado' }
        }

        const { data: table, error } = await supabase
            .from('restaurant_tables')
            .insert({
                ...data,
                restaurant_id: restaurant.id,
            })
            .select()
            .single()

        if (error) {
            return { error: error.message }
        }

        return { data: table }
    } catch (error) {
        console.error('Error creating table:', error)
        return { error: 'Erro ao criar mesa' }
    }
}

export async function updateTableStatus(
    tableId: string,
    status: RestaurantTable['status']
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('restaurant_tables')
            .update({ status })
            .eq('id', tableId)

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error updating table:', error)
        return { error: 'Erro ao atualizar mesa' }
    }
}

export async function deleteTable(tableId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('restaurant_tables')
            .delete()
            .eq('id', tableId)

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error deleting table:', error)
        return { error: 'Erro ao excluir mesa' }
    }
}

// ============================================================================
// AVALIAÇÕES (REVIEWS)
// ============================================================================

export async function getRestaurantReviews(
    restaurantId: string
): Promise<{ data?: any[]; error?: string }> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            return { error: error.message }
        }

        return { data: data || [] }
    } catch (error) {
        console.error('Error fetching reviews:', error)
        return { error: 'Erro ao buscar avaliações' }
    }
}

export async function respondToReview(
    reviewId: string,
    response: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('reviews')
            .update({
                response,
                responded_at: new Date().toISOString(),
            })
            .eq('id', reviewId)

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error responding to review:', error)
        return { error: 'Erro ao responder avaliação' }
    }
}

// ============================================================================
// REGISTRO DE RESTAURANTE
// ============================================================================

export type FormState = {
    error?: string
    success?: boolean
}

export async function registerRestaurant(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: "Você precisa estar logado para registrar um restaurante." }
    }

    const name = formData.get("name") as string
    let subdomain = formData.get("subdomain") as string

    if (!name || !subdomain) {
        return { error: "Nome e Subdomínio são obrigatórios." }
    }

    subdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "")

    // ✅ Gerar slug a partir do nome
    const slug = name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

    try {
        // Verificar subdomain
        const existingSubdomain = await prisma.restaurant.findUnique({
            where: { subdomain },
        })

        if (existingSubdomain) {
            return { error: "Este subdomínio já está em uso. Escolha outro." }
        }

        // Verificar slug
        const existingSlug = await prisma.restaurant.findUnique({
            where: { slug },
        })

        if (existingSlug) {
            // Adicionar número ao slug
            const timestamp = Date.now()
            const uniqueSlug = `${slug}-${timestamp}`

            await prisma.restaurant.create({
                data: {
                    name,
                    slug: uniqueSlug, // ✅ SLUG ÚNICO
                    subdomain,
                    user_id: user.id,
                },
            })
        } else {
            await prisma.restaurant.create({
                data: {
                    name,
                    slug, // ✅ SLUG OBRIGATÓRIO
                    subdomain,
                    user_id: user.id,
                },
            })
        }

        const cookieStore = await cookies()
        const restaurant = await prisma.restaurant.findUnique({
            where: { subdomain }
        })

        if (restaurant) {
            cookieStore.set("restaurantId", restaurant.id)
        }

        return { success: true }

    } catch (error) {
        console.error("Erro ao registrar restaurante:", error)
        return { error: "Ocorreu um erro interno ao criar sua conta. Tente novamente." }
    }
}