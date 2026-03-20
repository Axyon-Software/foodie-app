'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UtensilsCrossed, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react'
import { updatePassword } from '@/actions/auth'
import { getAuthErrorMessage } from '@/lib/constants/auth.constants'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [success, setSuccess] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        const accessToken = searchParams.get('access_token')
        if (!accessToken) {
            const hasFragment = window.location.hash.includes('access_token')
            if (!hasFragment) {
                router.push('/sign-in')
            }
        }
    }, [searchParams, router])

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()
        setError('')

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            return
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem')
            return
        }

        setIsLoading(true)
        try {
            const response = await updatePassword(password)
            if (response?.error) {
                setError(getAuthErrorMessage(response.error))
            } else {
                setSuccess(true)
                setTimeout(() => {
                    router.push('/sign-in')
                }, 2000)
            }
        } catch {
            setError('Ocorreu um erro inesperado. Tente novamente.')
        } finally {
            setIsLoading(false)
        }
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
                <Link
                    href="/sign-in"
                    className="mb-6 inline-flex items-center gap-2 text-sm transition-colors hover:underline"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    <ArrowLeft size={16} />
                    Voltar para login
                </Link>

                <div className="mb-6 flex flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00A082]">
                        <UtensilsCrossed size={28} className="text-white" />
                    </div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: 'var(--color-text)' }}
                    >
                        Nova senha
                    </h1>
                    <p
                        className="text-sm text-center"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        Digite sua nova senha abaixo
                    </p>
                </div>

                {success ? (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl p-4 text-center"
                        style={{
                            backgroundColor: 'var(--color-success-light)',
                            color: 'var(--color-success)',
                        }}
                    >
                        <Lock className="mx-auto mb-2 h-8 w-8" />
                        <p className="font-medium">Senha atualizada!</p>
                        <p className="mt-1 text-sm">
                            Redirecionando para o login...
                        </p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-xl p-3 text-center text-sm"
                                style={{
                                    backgroundColor: 'var(--color-error-light)',
                                    color: 'var(--color-error)',
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    borderColor: 'var(--color-error-border)',
                                }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium"
                                style={{ color: 'var(--color-text)' }}
                            >
                                Nova senha
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-colors"
                                    style={{
                                        backgroundColor: 'var(--color-bg-input)',
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text)',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-2 block text-sm font-medium"
                                style={{ color: 'var(--color-text)' }}
                            >
                                Confirmar senha
                            </label>
                            <input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirme sua senha"
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                                style={{
                                    backgroundColor: 'var(--color-bg-input)',
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text)',
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-2 w-full rounded-xl bg-[#00A082] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#008F74] disabled:opacity-60"
                        >
                            {isLoading ? 'Salvando...' : 'Salvar nova senha'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="animate-pulse text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Carregando...
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
