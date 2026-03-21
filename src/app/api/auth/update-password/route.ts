// src/app/api/auth/update-password/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updatePasswordSchema = z.object({
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        
        const result = updatePasswordSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const { password } = result.data
        const supabase = await createClient()

        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password,
        })

        if (updateError) {
            return NextResponse.json(
                { error: updateError.message },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Senha atualizada com sucesso',
        })
    } catch (error) {
        console.error('Update password error:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
