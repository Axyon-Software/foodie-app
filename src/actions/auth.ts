// src/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithEmail(formData: {
    email: string;
    password: string;
}) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
    })

    if (error) {
        return { error: error.message }
    }

    // redirect() lança uma exceção - NÃO colocar em try/catch
    redirect('/')
}

export async function signUpWithEmail(formData: {
    email: string;
    password: string;
    fullName: string;
}) {
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
}

export async function signInWithGoogle() {
    const supabase = await createClient()
    const headersList = await headers()
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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

    return { error: 'Erro ao iniciar login com Google' }
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/sign-in')
}

export async function resetPassword(email: string) {
    const supabase = await createClient()
    const headersList = await headers()
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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