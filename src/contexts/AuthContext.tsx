// src/contexts/AuthContext.tsx
'use client'

import {
    createContext,
    useCallback,
    useEffect,
    useState,
    type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AuthState, UserProfile, UserRole } from '@/types/auth.types'
import type { User } from '@supabase/supabase-js'
import {
    signUpWithEmail as serverSignUp,
    resetPassword as serverResetPassword,
} from '@/actions/auth'

interface AuthContextType extends AuthState {
    signIn: (email: string, password: string) => Promise<{ error?: string }>
    signUp: (
        email: string,
        password: string,
        fullName: string
    ) => Promise<{ error?: string; success?: boolean }>
    signOut: () => Promise<void>
    resetPassword: (
        email: string
    ) => Promise<{ error?: string; success?: boolean }>
    updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: string }>
    hasRole: (roles: UserRole | UserRole[]) => boolean
    refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

function buildProfileFromUser(user: User): UserProfile {
    return {
        id: user.id,
        email: user.email || '',
        fullName:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            '',
        role: 'CLIENTE',
        avatarUrl: user.user_metadata?.avatar_url || undefined,
        phone: undefined,
        createdAt: user.created_at,
        updatedAt: user.updated_at || user.created_at,
    }
}

async function fetchUserProfile(
    supabase: ReturnType<typeof createClient>,
    user: User
): Promise<UserProfile> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error || !data) {
            return buildProfileFromUser(user)
        }

        return {
            id: data.id,
            email: data.email || user.email || '',
            fullName:
                data.full_name ||
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                '',
            role: data.role || 'CLIENTE',
            avatarUrl: data.avatar_url || user.user_metadata?.avatar_url,
            phone: data.phone,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        }
    } catch {
        // ✅ Qualquer erro — usa dados básicos do usuário
        return buildProfileFromUser(user)
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        isLoading: true,
        isAuthenticated: false,
    })

    const refreshUser = useCallback(async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            // ✅ Seta autenticado imediatamente com dados básicos
            // sem esperar o perfil do banco
            const basicProfile = buildProfileFromUser(user)
            setState({
                user,
                profile: basicProfile,
                isLoading: false,
                isAuthenticated: true,
            })

            // ✅ Depois busca o perfil completo em background
            fetchUserProfile(supabase, user).then((profile) => {
                setState({
                    user,
                    profile,
                    isLoading: false,
                    isAuthenticated: true,
                })
            })
        } else {
            setState({
                user: null,
                profile: null,
                isLoading: false,
                isAuthenticated: false,
            })
        }
    }, [])

    useEffect(() => {
        const supabase = createClient()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session?.user) {
                    // ✅ Seta autenticado imediatamente com dados básicos
                    const basicProfile = buildProfileFromUser(session.user)
                    setState({
                        user: session.user,
                        profile: basicProfile,
                        isLoading: false,
                        isAuthenticated: true,
                    })

                    // ✅ setTimeout quebra o deadlock do onAuthStateChange
                    // Busca o perfil completo fora do ciclo do evento
                    setTimeout(() => {
                        fetchUserProfile(supabase, session.user!).then((profile) => {
                            setState({
                                user: session.user!,
                                profile,
                                isLoading: false,
                                isAuthenticated: true,
                            })
                        })
                    }, 0)
                } else {
                    setState({
                        user: null,
                        profile: null,
                        isLoading: false,
                        isAuthenticated: false,
                    })
                }
            }
        )

        refreshUser()

        // ✅ Detecta retorno do OAuth
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            if (params.get('auth') === 'success') {
                refreshUser()
                const url = new URL(window.location.href)
                url.searchParams.delete('auth')
                window.history.replaceState({}, '', url.toString())
            }
        }

        return () => {
            subscription.unsubscribe()
        }
    }, [refreshUser])

    const signIn = async (email: string, password: string) => {
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) return { error: error.message }
        return {}
    }

    const signUp = async (
        email: string,
        password: string,
        fullName: string
    ) => {
        return (await serverSignUp({ email, password, fullName })) ?? {}
    }

    const signOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
    }

    const resetPassword = async (email: string) => {
        return (await serverResetPassword(email)) ?? {}
    }

    const updateProfile = async (data: Partial<UserProfile>) => {
        if (!state.user) return { error: 'Usuário não autenticado' }

        const supabase = createClient()
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: data.fullName,
                avatar_url: data.avatarUrl,
                phone: data.phone,
                role: data.role,
                updated_at: new Date().toISOString(),
            })
            .eq('id', state.user.id)

        if (error) return { error: error.message }

        await refreshUser()
        return {}
    }

    const hasRole = (roles: UserRole | UserRole[]): boolean => {
        if (!state.profile) return false
        const roleArray = Array.isArray(roles) ? roles : [roles]
        return roleArray.includes(state.profile.role)
    }

    return (
        <AuthContext.Provider
            value={{
                ...state,
                signIn,
                signUp,
                signOut,
                resetPassword,
                updateProfile,
                hasRole,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}