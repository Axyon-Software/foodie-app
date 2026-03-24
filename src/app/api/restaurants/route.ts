// src/app/api/restaurants/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const restaurantSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    logo: z.string().url().optional(),
    coverImage: z.string().url().optional(),
    cnpj: z.string().optional(),
    email: z.string().email().optional(),
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
    settings: z.object({
        acceptsReservation: z.boolean().optional(),
        deliveryRadius: z.number().optional(),
        minimumOrder: z.number().optional(),
        estimatedDeliveryTime: z.number().optional(),
        taxPercentage: z.number().optional(),
    }).optional(),
    isActive: z.boolean().optional(),
})

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)
        const restaurantId = searchParams.get('id')

        if (restaurantId) {
            const { data, error } = await supabase
                .from('restaurants')
                .select('*')
                .eq('id', restaurantId)
                .single()

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 404 })
            }

            return NextResponse.json({ restaurant: data })
        }

        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('is_active', true)
            .order('name')

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ restaurants: data || [] })
    } catch (error) {
        console.error('GET restaurants error:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        
        const result = restaurantSchema.safeParse(body)
        
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('restaurants')
            .insert({
                ...result.data,
                owner_id: user.id,
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ restaurant: data, success: true }, { status: 201 })
    } catch (error) {
        console.error('POST restaurant error:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = await createClient()
        
        const { searchParams } = new URL(request.url)
        const restaurantId = searchParams.get('id')

        if (!restaurantId) {
            return NextResponse.json({ error: 'ID do restaurante é obrigatório' }, { status: 400 })
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        
        const { data, error } = await supabase
            .from('restaurants')
            .update(body)
            .eq('id', restaurantId)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ restaurant: data, success: true })
    } catch (error) {
        console.error('PUT restaurant error:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()
        
        const { searchParams } = new URL(request.url)
        const restaurantId = searchParams.get('id')

        if (!restaurantId) {
            return NextResponse.json({ error: 'ID do restaurante é obrigatório' }, { status: 400 })
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { error } = await supabase
            .from('restaurants')
            .update({ isActive: false })
            .eq('id', restaurantId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE restaurant error:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}
