// src/app/api/auth/me/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Usuário não autenticado', isAuthenticated: false },
                { status: 401 }
            )
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        return NextResponse.json({
            isAuthenticated: true,
            user: {
                id: user.id,
                email: user.email,
                emailConfirmed: user.email_confirmed_at !== null,
                createdAt: user.created_at,
            },
            profile: profile || null,
        })
    } catch (error) {
        console.error('Get session error:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
