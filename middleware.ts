// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type UserRole = 'CLIENTE' | 'ADMIN' | 'GERENCIADOR' | 'EQUIPE'

interface RouteConfig {
    path: string
    roles: UserRole[]
}

const routeConfigs: RouteConfig[] = [
    { path: '/admin', roles: ['ADMIN'] },
    { path: '/gerenciador', roles: ['ADMIN', 'GERENCIADOR'] },
    { path: '/equipe', roles: ['ADMIN', 'GERENCIADOR', 'EQUIPE'] },
]

async function getUserRole(
    supabase: ReturnType<typeof createServerClient>,
    userId: string
): Promise<UserRole | null> {
    try {
        const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()

        return data?.role || 'CLIENTE'
    } catch {
        // Table might not exist or other error
        return 'CLIENTE'
    }
}

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
    // Protected routes - redirect to sign-in if not authenticated
    const protectedRoutes = ['/profile', '/orders', '/addresses', '/cart', '/favorites', '/checkout']
    const isProtectedRoute = protectedRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    )

    // Role-based routes
    const isRoleBasedRoute = routeConfigs.some(config =>
        request.nextUrl.pathname.startsWith(config.path)
    )

    // Handle role-based routes
    if (isRoleBasedRoute && user) {
        const userRole = await getUserRole(supabase, user.id)
        const matchedConfig = routeConfigs.find(config =>
            request.nextUrl.pathname.startsWith(config.path)
        )

        if (matchedConfig && userRole && !matchedConfig.roles.includes(userRole)) {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    if (isProtectedRoute && !user) {
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