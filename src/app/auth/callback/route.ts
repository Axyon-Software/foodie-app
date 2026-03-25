// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // ✅ Adiciona auth=success para o AuthContext forçar refresh
            const redirectUrl = new URL(next, origin)
            redirectUrl.searchParams.set('auth', 'success')
            return NextResponse.redirect(redirectUrl.toString())
        }
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}