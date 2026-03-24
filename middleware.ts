// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // 1. Criar cliente Supabase e gerenciar cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 2. Refresh da sessão (CRÍTICO: não remover)
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // 3. Rotas protegidas do Dashboard/Admin
    // Só acessa se estiver autenticado
    const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

    if (isDashboardRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/sign-in'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
    }

    // 4. Rotas de Auth
    // Se já está logado, redireciona para home
    const isAuthRoute = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')

    if (isAuthRoute && user) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    // 5. Rotas de Cliente (Profile, Pedidos, Endereços)
    const protectedClientRoutes = ['/profile', '/orders', '/addresses']
    const isProtectedClientRoute = protectedClientRoutes.some(route =>
        pathname.startsWith(route)
    )

    if (isProtectedClientRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/sign-in'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
    }

    // 6. Rotas públicas (/r/[slug], /register, /)
    // Liberadas para todos, Next.js resolve o roteamento via app/r/[slug]/page.tsx
    // Nenhuma ação necessária aqui!

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes
         * - _next/static, _next/image (arquivos estáticos)
         * - favicon.ico
         * - arquivos de imagem/fonte/manifest
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|js|css)$).*)',
    ],
}