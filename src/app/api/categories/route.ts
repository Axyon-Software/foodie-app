// src/app/api/categories/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const categorySchema = z.object({
    restaurantId: z.string().uuid(),
    name: z.string().min(2),
    description: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().url().optional(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
})

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)
        const restaurantId = searchParams.get('restaurantId')
        const categoryId = searchParams.get('id')

        if (categoryId) {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('id', categoryId)
                .single()

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 404 })
            }

            return NextResponse.json({ category: data })
        }

        if (!restaurantId) {
            return NextResponse.json({ error: 'ID do restaurante é obrigatório' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .eq('is_active', true)
            .order('sort_order', { ascending: true })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ categories: data || [] })
    } catch (error) {
        console.error('GET categories error:', error)
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
        
        const result = categorySchema.safeParse(body)
        
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('categories')
            .insert({
                restaurant_id: result.data.restaurantId,
                name: result.data.name,
                description: result.data.description,
                icon: result.data.icon,
                image: result.data.image,
                sort_order: result.data.sortOrder || 0,
                is_active: result.data.isActive ?? true,
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ category: data, success: true }, { status: 201 })
    } catch (error) {
        console.error('POST category error:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = await createClient()
        
        const { searchParams } = new URL(request.url)
        const categoryId = searchParams.get('id')

        if (!categoryId) {
            return NextResponse.json({ error: 'ID da categoria é obrigatório' }, { status: 400 })
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        
        const { data, error } = await supabase
            .from('categories')
            .update({
                name: body.name,
                description: body.description,
                icon: body.icon,
                image: body.image,
                sort_order: body.sortOrder,
                is_active: body.isActive,
            })
            .eq('id', categoryId)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ category: data, success: true })
    } catch (error) {
        console.error('PUT category error:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()
        
        const { searchParams } = new URL(request.url)
        const categoryId = searchParams.get('id')

        if (!categoryId) {
            return NextResponse.json({ error: 'ID da categoria é obrigatório' }, { status: 400 })
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { error } = await supabase
            .from('categories')
            .update({ isActive: false })
            .eq('id', categoryId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE category error:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}
