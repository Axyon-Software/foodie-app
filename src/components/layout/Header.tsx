// src/components/layout/Header.tsx
'use client'

import { useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, MapPin, User, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { UserMenu } from '@/components/layout/UserMenu'

export default function Header() {
    const router = useRouter()
    const pathname = usePathname()
    const { items, totalItems, setIsCartOpen } = useCart()

    // ✅ Usa o AuthContext — fonte única da verdade
    const { user, isLoading, isAuthenticated } = useAuth()

    const isHomePage = useMemo(() => pathname === '/', [pathname])
    const isAuthPage = useMemo(
        () =>
            pathname.startsWith('/sign') ||
            pathname.startsWith('/forgot') ||
            pathname.startsWith('/reset'),
        [pathname]
    )
    const isSubPage = useMemo(
        () => !isHomePage && !isAuthPage,
        [isHomePage, isAuthPage]
    )

    if (isAuthPage) return null

    const handleGoBack = (): void => router.back()

    const handleCartClick = (): void => {
        if (items.length > 0) {
            setIsCartOpen(true)
        } else {
            router.push('/cart')
        }
    }

    const handleSignIn = (): void => router.push('/sign-in')

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
                                <ArrowLeft
                                    size={20}
                                    style={{ color: 'var(--color-text)' }}
                                />
                            </button>
                        )}

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
                        <ThemeToggle />

                        {/* Cart Button */}
                        <button
                            onClick={handleCartClick}
                            className="relative rounded-full p-3 transition-colors hover:opacity-80"
                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                            aria-label={`Carrinho com ${totalItems} itens`}
                        >
                            <ShoppingBag
                                size={24}
                                style={{ color: 'var(--color-text)' }}
                            />
                            <AnimatePresence>
                                {totalItems > 0 && (
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

                        {/* User Section — ✅ via AuthContext */}
                        {!isLoading && (
                            <>
                                {isAuthenticated && user ? (
                                    <UserMenu
                                        userName={user.fullName || ''}
                                        userEmail={user.email}
                                        userAvatar={user.avatarUrl}
                                    />
                                ) : (
                                    <button
                                        onClick={handleSignIn}
                                        className="flex items-center gap-2 rounded-full px-3 py-3 transition-colors hover:opacity-80 md:px-4"
                                        style={{
                                            backgroundColor:
                                                'var(--color-bg-secondary)',
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