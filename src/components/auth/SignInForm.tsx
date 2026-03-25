// src/components/auth/SignInForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UtensilsCrossed } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signInSchema } from '@/lib/validations/auth.validations'
import { AUTH_MESSAGES, getAuthErrorMessage } from '@/lib/constants/auth.constants'
import { AuthInput } from '@/components/auth/AuthInput'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { AuthDivider } from '@/components/auth/AuthDivider'

export function SignInForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get('redirectTo') || '/'

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [serverError, setServerError] = useState<string>('')
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()
        setErrors({})
        setServerError('')

        const result = signInSchema.safeParse({ email, password })

        if (!result.success) {
            const fieldErrors: Record<string, string> = {}
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as string
                fieldErrors[field] = issue.message
            })
            setErrors(fieldErrors)
            return
        }

        startTransition(async () => {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                setServerError(getAuthErrorMessage(error.message))
                return
            }

            // ✅ Usar window.location para garantir reload completo
            // e o AuthContext reler o cookie corretamente
            window.location.href = redirectTo
        })
    }

    return (
        <div
            className="flex min-h-screen items-center justify-center px-4"
            style={{ backgroundColor: 'var(--color-bg)' }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md rounded-2xl p-8"
                style={{
                    backgroundColor: 'var(--color-bg-card)',
                    boxShadow: 'var(--shadow-lg)',
                }}
            >
                {/* Logo */}
                <div className="mb-6 flex flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00A082]">
                        <UtensilsCrossed size={28} className="text-white" />
                    </div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: 'var(--color-text)' }}
                    >
                        {AUTH_MESSAGES.SIGN_IN_TITLE}
                    </h1>
                    <p
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        {AUTH_MESSAGES.SIGN_IN_SUBTITLE}
                    </p>
                </div>

                {/* Google OAuth */}
                <GoogleButton />

                <div className="my-6">
                    <AuthDivider />
                </div>

                {/* Server Error */}
                {serverError && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 rounded-xl p-3 text-center text-sm"
                        style={{
                            backgroundColor: 'var(--color-error-light)',
                            color: 'var(--color-error)',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: 'var(--color-error-border)',
                        }}
                    >
                        {serverError}
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <AuthInput
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={setEmail}
                        error={errors.email}
                        autoComplete="email"
                    />

                    <AuthInput
                        id="password"
                        label="Senha"
                        type="password"
                        placeholder="Sua senha"
                        value={password}
                        onChange={setPassword}
                        error={errors.password}
                        autoComplete="current-password"
                    />

                    <div className="flex justify-end">
                        <Link
                            href="/forgot-password"
                            className="text-xs font-medium transition-colors hover:underline"
                            style={{ color: 'var(--color-primary)' }}
                        >
                            {AUTH_MESSAGES.FORGOT_PASSWORD}
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="mt-2 w-full rounded-xl bg-[#00A082] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#008F74] disabled:opacity-60"
                    >
                        {isPending
                            ? AUTH_MESSAGES.SIGN_IN_LOADING
                            : AUTH_MESSAGES.SIGN_IN_BUTTON}
                    </button>
                </form>

                <p
                    className="mt-6 text-center text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    {AUTH_MESSAGES.NO_ACCOUNT}{' '}
                    <Link
                        href="/sign-up"
                        className="font-semibold transition-colors hover:underline"
                        style={{ color: 'var(--color-primary)' }}
                    >
                        {AUTH_MESSAGES.SIGN_UP_LINK}
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}