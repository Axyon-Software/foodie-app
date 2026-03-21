// src/app/api/profile/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateProfileSchema = z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().optional(),
    avatarUrl: z.string().url().optional(),
})

export async function GET(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError) {
            return NextResponse.json(
                { error: 'Perfil não encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            phone: profile.phone,
            avatarUrl: profile.avatar_url,
            role: profile.role,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
        })
    } catch (error) {
        console.error('Get profile error:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        const body = await request.json()
        
        const result = updateProfileSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const { fullName, phone, avatarUrl } = result.data

        const { data, error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                phone: phone,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)
            .select()
            .single()

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Perfil atualizado com sucesso',
            profile: {
                id: data.id,
                fullName: data.full_name,
                phone: data.phone,
                avatarUrl: data.avatar_url,
            },
        })
    } catch (error) {
        console.error('Update profile error:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
