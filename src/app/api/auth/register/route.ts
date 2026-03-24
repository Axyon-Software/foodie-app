// src/app/api/auth/register/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    role: z.enum(['CLIENTE', 'ADMIN', 'GERENCIADOR', 'EQUIPE']).optional().default('CLIENTE'),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        
        const result = registerSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const { email, password, fullName, role } = result.data
        const supabase = await createClient()

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                },
            },
        })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        if (data.user) {
            await supabase
                .from('profiles')
                .update({ role: role })
                .eq('id', data.user.id)
        }

        return NextResponse.json({
            success: true,
            message: 'Usuário criado com sucesso. Verifique seu email para confirmar o cadastro.',
            user: {
                id: data.user?.id,
                email: data.user?.email,
            },
        })
    } catch (error) {
        console.error('Register error:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
