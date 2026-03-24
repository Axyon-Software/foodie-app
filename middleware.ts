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
        return 'CLIENTE'
    }
}

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
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

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // 1. Rotas do Dashboard/Admin - precisa estar autenticado
    const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

    if (isDashboardRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/sign-in'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
    }

    // 2. Rotas protegidas do cliente
    const protectedRoutes = ['/profile', '/orders', '/addresses', '/cart', '/favorites', '/checkout']
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    )

    if (isProtectedRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/sign-in'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
    }

    // 3. Rotas baseadas em role
    const isRoleBasedRoute = routeConfigs.some(config =>
        pathname.startsWith(config.path)
    )

    if (isRoleBasedRoute && user) {
        const userRole = await getUserRole(supabase, user.id)
        const matchedConfig = routeConfigs.find(config =>
            pathname.startsWith(config.path)
        )

        if (matchedConfig && userRole && !matchedConfig.roles.includes(userRole)) {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    // 4. Rotas de Auth - se já logado, vai para home
    const isAuthRoute = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')

    if (isAuthRoute && user) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|js|css)$).*)',
    ],
}