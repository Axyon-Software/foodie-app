// src/components/layout/Header.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, MapPin, User, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { UserMenu } from '@/components/layout/UserMenu'
import { createClient } from '@/lib/supabase/client'

interface UserData {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
}

export default function Header() {
    const router = useRouter()
    const pathname = usePathname()
    const { items, totalItems, setIsCartOpen } = useCart()
    const [user, setUser] = useState<UserData | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [mounted, setMounted] = useState<boolean>(false)

    // Page detection - use useMemo to avoid recalculation
    const isHomePage = useMemo(() => pathname === '/', [pathname])
    const isAuthPage = useMemo(() => pathname.startsWith('/sign') || pathname.startsWith('/forgot') || pathname.startsWith('/reset'), [pathname])
    const isSubPage = useMemo(() => !isHomePage && !isAuthPage, [isHomePage, isAuthPage])

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    // Fetch user session
    useEffect(() => {
        if (!mounted) return

        const supabase = createClient()

        const fetchUser = async (): Promise<void> => {
            const { data: { user: authUser } } = await supabase.auth.getUser()

            if (authUser) {
                setUser({
                    id: authUser.id,
                    email: authUser.email || '',
                    fullName: authUser.user_metadata?.full_name || '',
                    avatarUrl: authUser.user_metadata?.avatar_url || '',
                })
            } else {
                setUser(null)
            }
            setIsLoading(false)
        }

        fetchUser()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email || '',
                        fullName: session.user.user_metadata?.full_name || '',
                        avatarUrl: session.user.user_metadata?.avatar_url || '',
                    })
                } else {
                    setUser(null)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [mounted])

    // Don't show header on auth pages - but wait for mount
    if (!mounted || isAuthPage) return null

    const handleGoBack = (): void => {
        router.back()
    }

    const handleCartClick = (): void => {
        if (items.length > 0) {
            setIsCartOpen(true)
        } else {
            router.push('/cart')
        }
    }

    const handleSignIn = (): void => {
        router.push('/sign-in')
    }

    return (
        <header
            className="sticky top-0 z-50 border-b transition-colors"
            style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
            }}
        >
            <div className="mx-auto max-w-7xl px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex items-center gap-3">
                        {isSubPage && (
                            <button
                                onClick={handleGoBack}
                                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                                aria-label="Voltar"
                            >
                                <ArrowLeft size={20} style={{ color: 'var(--color-text)' }} />
                            </button>
                        )}

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-[#00A082]">
                                🍽️ Foodie
                            </span>
                        </Link>
                    </div>

                    {/* Center - Address (home only, desktop) */}
                    {isHomePage && (
                        <button
                            className="hidden items-center gap-2 rounded-full px-4 py-2 transition-colors hover:opacity-80 md:flex"
                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                        >
                            <MapPin size={20} className="text-[#00A082]" />
                            <div className="text-left">
                                <p
                                    className="text-xs"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                >
                                    Entregar em
                                </p>
                                <p
                                    className="max-w-[200px] truncate text-sm font-medium"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    Rua das Flores, 123
                                </p>
                            </div>
                        </button>
                    )}

                    {/* Right Section */}
                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Cart Button */}
                        <button
                            onClick={handleCartClick}
                            className="relative rounded-full p-3 transition-colors hover:opacity-80"
                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                            aria-label={mounted ? `Carrinho com ${totalItems} itens` : 'Carrinho'}
                        >
                            <ShoppingBag size={24} style={{ color: 'var(--color-text)' }} />

                            <AnimatePresence>
                                {mounted && totalItems > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#00A082] text-[10px] font-bold text-white"
                                    >
                                        {totalItems > 99 ? '99+' : totalItems}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>

                        {/* User Section */}
                        {!isLoading && (
                            <>
                                {user ? (
                                    <UserMenu
                                        userName={user.fullName}
                                        userEmail={user.email}
                                        userAvatar={user.avatarUrl}
                                    />
                                ) : (
                                    <button
                                        onClick={handleSignIn}
                                        className="flex items-center gap-2 rounded-full px-3 py-3 transition-colors hover:opacity-80 md:px-4"
                                        style={{
                                            backgroundColor: 'var(--color-bg-secondary)',
                                            color: 'var(--color-text)',
                                        }}
                                        aria-label="Fazer login"
                                    >
                                        <User size={24} />
                                        <span className="hidden text-sm font-medium md:inline">
                                            Entrar
                                        </span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}