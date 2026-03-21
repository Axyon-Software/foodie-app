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

interface AuthContextType extends AuthState {
    signIn: (email: string, password: string) => Promise<{ error?: string }>
    signUp: (
        email: string,
        password: string,
        fullName: string
    ) => Promise<{ error?: string; success?: boolean }>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>
    updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: string }>
    hasRole: (roles: UserRole | UserRole[]) => boolean
    refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function fetchUserProfile(supabase: ReturnType<typeof createClient>, userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error || !data) {
        return null
    }

    return {
        id: data.id,
        email: data.email || '',
        fullName: data.full_name,
        role: data.role || 'CLIENTE',
        avatarUrl: data.avatar_url,
        phone: data.phone,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
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
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (user) {
            const profile = await fetchUserProfile(supabase, user.id)
            setState({
                user,
                profile,
                isLoading: false,
                isAuthenticated: true,
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
        refreshUser()

        const supabase = createClient()
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const profile = await fetchUserProfile(supabase, session.user.id)
                setState({
                    user: session.user,
                    profile,
                    isLoading: false,
                    isAuthenticated: true,
                })
            } else {
                setState({
                    user: null,
                    profile: null,
                    isLoading: false,
                    isAuthenticated: false,
                })
            }
        })

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

        if (error) {
            return { error: error.message }
        }

        return {}
    }

    const signUp = async (
        email: string,
        password: string,
        fullName: string
    ) => {
        const supabase = createClient()
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        })

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    }

    const signOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        setState({
            user: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
        })
    }

    const resetPassword = async (email: string) => {
        const supabase = createClient()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    }

    const updateProfile = async (data: Partial<UserProfile>) => {
        if (!state.user) {
            return { error: 'Usuário não autenticado' }
        }

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

        if (error) {
            return { error: error.message }
        }

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
