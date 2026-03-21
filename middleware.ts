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
    const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

    return data?.role || 'CLIENTE'
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

    // IMPORTANT: DO NOT REMOVE auth.getUser()
    // This refreshes the session if expired
    const {
        data: { user },
    } = await supabase.auth.getUser()

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
        url.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // Auth routes - redirect to home if already authenticated
    const authRoutes = ['/sign-in', '/sign-up']
    const isAuthRoute = authRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    )

    if (isAuthRoute && user) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (icons, manifest, sw)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|js)$).*)',
    ],
}