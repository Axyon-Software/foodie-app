// src/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers';

export async function signInWithEmail(formData: {
    email: string;
    password: string;
}) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        })

        if (error) {
            return { error: error.message }
        }

        redirect('/')
    } catch (error) {
        console.error('Sign in error:', error)
        return { error: 'Erro ao fazer login. Tente novamente.' }
    }
}

export async function signUpWithEmail(formData: {
    email: string;
    password: string;
    fullName: string;
}) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.fullName,
                },
            },
        })

        if (error) {
            return { error: error.message }
        }

        return { success: true, message: 'Verifique seu email para confirmar o cadastro!' }
    } catch (error) {
        console.error('Sign up error:', error)
        return { error: 'Erro ao criar conta. Tente novamente.' }
    }
}

export async function signInWithGoogle() {
    const supabase = await createClient()
    const headersList = await headers()
    const origin = headersList.get('origin') || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return { success: true }
}

export async function resetPassword(email: string) {
    const supabase = await createClient()
    const headersList = await headers()
    const origin = headersList.get('origin') || 'http://localhost:3000'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true, message: 'Email de recuperação enviado!' }
}

export async function updatePassword(password: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
        password,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true, message: 'Senha atualizada com sucesso!' }
}