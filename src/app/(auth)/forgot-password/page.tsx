'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UtensilsCrossed, ArrowLeft, Mail } from 'lucide-react'
import { resetPassword } from '@/actions/auth'
import { getAuthErrorMessage } from '@/lib/constants/auth.constants'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [success, setSuccess] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()
        setError('')
        setSuccess(false)

        if (!email || !email.includes('@')) {
            setError('Digite um email válido')
            return
        }

        setIsLoading(true)
        try {
            const response = await resetPassword(email)
            if (response?.error) {
                setError(getAuthErrorMessage(response.error))
            } else {
                setSuccess(true)
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
                        Esqueceu a senha?
                    </h1>
                    <p
                        className="text-sm text-center"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        Digite seu email e enviaremos um link para redefinir sua senha
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
                        <Mail className="mx-auto mb-2 h-8 w-8" />
                        <p className="font-medium">Email enviado!</p>
                        <p className="mt-1 text-sm">
                            Verifique sua caixa de entrada para redefinir sua senha
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
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium"
                                style={{ color: 'var(--color-text)' }}
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
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
                            {isLoading ? 'Enviando...' : 'Enviar email de recuperação'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    )
}
