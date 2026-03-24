// src/app/api/auth/login/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        
        const result = loginSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const { email, password } = result.data
        const supabase = await createClient()

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            )
        }

        // Try to get profile, but don't fail if table doesn't exist
        let profile = null
        try {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single()
            profile = profileData
        } catch (profileError) {
            console.warn('Profile fetch error:', profileError)
            // Continue without profile
        }

        return NextResponse.json({
            user: {
                id: data.user.id,
                email: data.user.email,
                emailConfirmed: data.user.email_confirmed_at !== null,
                createdAt: data.user.created_at,
            },
            profile: profile,
            session: {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresIn: data.session.expires_in,
                expiresAt: data.session.expires_at,
            },
        })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
