// src/app/api/auth/refresh/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const refreshSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const result = refreshSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const { refreshToken } = result.data
        const supabase = await createClient()

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
        })

        if (error || !data.session) {
            return NextResponse.json(
                { error: error?.message || 'Sessão inválida' },
                { status: 401 }
            )
        }

        return NextResponse.json({
            session: {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresIn: data.session.expires_in,
                expiresAt: data.session.expires_at,
            },
            user: data.user ? {
                id: data.user.id,
                email: data.user.email,
            } : null,
        })
    } catch (error) {
        console.error('Refresh token error:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}