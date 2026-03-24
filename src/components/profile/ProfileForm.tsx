// src/components/profile/ProfileForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Save, Loader2, User, Mail, Phone, Calendar, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { getProfile, updateProfile, type ProfileData } from '@/actions/profileActions'
import { profileSchema } from '@/lib/validations/profile.validations'
import { PROFILE_MESSAGES, AUTH_PROVIDER_LABELS } from '@/lib/constants/profile.constants'
import { formatPhoneInput, formatDateBR } from '@/lib/utils/format.utils'

export function ProfileForm() {
    const router = useRouter()
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [fullName, setFullName] = useState<string>('')
    const [phone, setPhone] = useState<string>('')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [hasChanges, setHasChanges] = useState<boolean>(false)

    // Load profile
    useEffect(() => {
        const loadProfile = async (): Promise<void> => {
            const result = await getProfile()

            if (result.error) {
                toast.error(PROFILE_MESSAGES.LOAD_ERROR)
                router.push('/sign-in')
                return
            }

            if (result.data) {
                setProfile(result.data)
                setFullName(result.data.fullName)
                setPhone(result.data.phone ? formatPhoneInput(result.data.phone) : '')
            }

            setIsLoading(false)
        }

        loadProfile()
    }, [router])

    // Track changes
    useEffect(() => {
        if (profile) {
            const nameChanged = fullName !== profile.fullName
            const phoneDigits = phone.replace(/\D/g, '')
            const phoneChanged = phoneDigits !== profile.phone
            setHasChanges(nameChanged || phoneChanged)
        }
    }, [fullName, phone, profile])

    const handlePhoneChange = (value: string): void => {
        setPhone(formatPhoneInput(value))
    }

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()
        setErrors({})

        const phoneDigits = phone.replace(/\D/g, '')

        // Validate
        const result = profileSchema.safeParse({
            fullName,
            phone: phoneDigits,
        })

        if (!result.success) {
            const fieldErrors: Record<string, string> = {}
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as string
                fieldErrors[field] = issue.message
            })
            setErrors(fieldErrors)
            return
        }

        // Save
        setIsSaving(true)
        try {
            const response = await updateProfile({
                fullName,
                phone: phoneDigits,
            })

            if (response.error) {
                toast.error(response.error)
            } else {
                toast.success(PROFILE_MESSAGES.SAVE_SUCCESS, { icon: '✅' })
                setProfile((prev) =>
                    prev
                        ? { ...prev, fullName, phone: phoneDigits }
                        : prev
                )
                setHasChanges(false)
            }
        } catch {
            toast.error(PROFILE_MESSAGES.SAVE_ERROR)
        } finally {
            setIsSaving(false)
        }
    }

    const getInputStyle = (hasError: boolean) => ({
        backgroundColor: 'var(--color-bg-input)',
        color: 'var(--color-text)',
        borderWidth: '1px',
        borderStyle: 'solid' as const,
        borderColor: hasError ? 'var(--color-error)' : 'var(--color-border)',
    })

    // Loading skeleton
    if (isLoading) {
        return (
            <div
                className="mx-auto max-w-2xl px-4 py-8"
                style={{ backgroundColor: 'var(--color-bg)' }}
            >
                <div className="animate-pulse">
                    <div
                        className="mb-8 h-8 w-48 rounded-lg"
                        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                    />
                    <div
                        className="mb-6 flex items-center gap-4"
                    >
                        <div
                            className="h-20 w-20 rounded-full"
                            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                        />
                        <div className="flex-1">
                            <div
                                className="mb-2 h-5 w-32 rounded"
                                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                            />
                            <div
                                className="h-4 w-48 rounded"
                                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                            />
                        </div>
                    </div>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="mb-4">
                            <div
                                className="mb-2 h-4 w-24 rounded"
                                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                            />
                            <div
                                className="h-12 w-full rounded-xl"
                                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (!profile) return null

    return (
        <div
            className="min-h-screen transition-colors"
            style={{ backgroundColor: 'var(--color-bg)' }}
        >
            <div className="mx-auto max-w-2xl px-4 py-8">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: 'var(--color-text)' }}
                    >
                        {PROFILE_MESSAGES.PAGE_TITLE}
                    </h1>
                    <p
                        className="mt-1 text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        {PROFILE_MESSAGES.PAGE_SUBTITLE}
                    </p>
                </motion.div>

                {/* Avatar Section */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="mb-8 flex items-center gap-4 rounded-2xl p-5"
                    style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    {profile.avatarUrl ? (
                        <img
                            src={profile.avatarUrl}
                            alt={profile.fullName}
                            className="h-20 w-20 rounded-full object-cover ring-4 ring-[#00A082]/20"
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#00A082] text-2xl font-bold text-white ring-4 ring-[#00A082]/20">
                            {profile.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2) || '?'}
                        </div>
                    )}

                    <div>
                        <h2
                            className="text-lg font-semibold"
                            style={{ color: 'var(--color-text)' }}
                        >
                            {profile.fullName || 'Usuário'}
                        </h2>
                        <p
                            className="text-sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {profile.email}
                        </p>
                    </div>
                </motion.div>

                {/* Personal Info Form */}
                <motion.form
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="rounded-2xl p-6"
                    style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    <h3
                        className="mb-5 flex items-center gap-2 text-base font-semibold"
                        style={{ color: 'var(--color-text)' }}
                    >
                        <User size={18} className="text-[#00A082]" />
                        {PROFILE_MESSAGES.SECTION_PERSONAL}
                    </h3>

                    <div className="flex flex-col gap-5">
                        {/* Full Name */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="fullName"
                                className="flex items-center gap-2 text-sm font-medium"
                                style={{ color: 'var(--color-text)' }}
                            >
                                <User size={14} style={{ color: 'var(--color-text-secondary)' }} />
                                {PROFILE_MESSAGES.LABEL_NAME}
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder={PROFILE_MESSAGES.PLACEHOLDER_NAME}
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-[#00A082]"
                                style={getInputStyle(!!errors.fullName)}
                            />
                            {errors.fullName && (
                                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                                    {errors.fullName}
                                </p>
                            )}
                        </div>

                        {/* Email (readonly) */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="email"
                                className="flex items-center gap-2 text-sm font-medium"
                                style={{ color: 'var(--color-text)' }}
                            >
                                <Mail size={14} style={{ color: 'var(--color-text-secondary)' }} />
                                {PROFILE_MESSAGES.LABEL_EMAIL}
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={profile.email}
                                readOnly
                                className="w-full cursor-not-allowed rounded-xl px-4 py-3 text-sm opacity-60 outline-none"
                                style={{
                                    backgroundColor: 'var(--color-bg-tertiary)',
                                    color: 'var(--color-text-secondary)',
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    borderColor: 'var(--color-border)',
                                }}
                            />
                            <p
                                className="text-xs"
                                style={{ color: 'var(--color-text-tertiary)' }}
                            >
                                {PROFILE_MESSAGES.EMAIL_READONLY_HINT}
                            </p>
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="phone"
                                className="flex items-center gap-2 text-sm font-medium"
                                style={{ color: 'var(--color-text)' }}
                            >
                                <Phone size={14} style={{ color: 'var(--color-text-secondary)' }} />
                                {PROFILE_MESSAGES.LABEL_PHONE}
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                placeholder={PROFILE_MESSAGES.PLACEHOLDER_PHONE}
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-[#00A082]"
                                style={getInputStyle(!!errors.phone)}
                            />
                            {errors.phone ? (
                                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                                    {errors.phone}
                                </p>
                            ) : (
                                <p
                                    className="text-xs"
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                >
                                    {PROFILE_MESSAGES.PHONE_HINT}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={isSaving || !hasChanges}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A082] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#008F74] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    {PROFILE_MESSAGES.SAVING_BUTTON}
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    {PROFILE_MESSAGES.SAVE_BUTTON}
                                </>
                            )}
                        </button>
                    </div>
                </motion.form>

                {/* Account Info */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-6 rounded-2xl p-6"
                    style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    <h3
                        className="mb-5 flex items-center gap-2 text-base font-semibold"
                        style={{ color: 'var(--color-text)' }}
                    >
                        <Shield size={18} className="text-[#00A082]" />
                        {PROFILE_MESSAGES.SECTION_ACCOUNT}
                    </h3>

                    <div className="flex flex-col gap-4">
                        {/* Auth Provider */}
                        <div className="flex items-center justify-between">
                            <span
                                className="flex items-center gap-2 text-sm"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                <Shield size={14} />
                                {PROFILE_MESSAGES.LABEL_AUTH_PROVIDER}
                            </span>
                            <span
                                className="rounded-full px-3 py-1 text-xs font-medium"
                                style={{
                                    backgroundColor: 'var(--color-primary-light)',
                                    color: '#00A082',
                                }}
                            >
                                {AUTH_PROVIDER_LABELS[profile.authProvider] || profile.authProvider}
                            </span>
                        </div>

                        {/* Member Since */}
                        <div
                            className="flex items-center justify-between pt-4"
                            style={{
                                borderTopWidth: '1px',
                                borderTopStyle: 'solid',
                                borderTopColor: 'var(--color-border)',
                            }}
                        >
                            <span
                                className="flex items-center gap-2 text-sm"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                <Calendar size={14} />
                                {PROFILE_MESSAGES.LABEL_MEMBER_SINCE}
                            </span>
                            <span
                                className="text-sm font-medium"
                                style={{ color: 'var(--color-text)' }}
                            >
                                {formatDateBR(profile.createdAt)}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}