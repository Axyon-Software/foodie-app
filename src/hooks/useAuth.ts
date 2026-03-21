'use client'

import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'
import type { UserRole, UserProfile } from '@/types/auth.types'

interface UseAuthReturn {
    user: UserProfile | null
    isLoading: boolean
    isAuthenticated: boolean
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
    isAdmin: boolean
    isGerenciador: boolean
    isEquipe: boolean
    isCliente: boolean
    refreshUser: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    const {
        profile,
        isLoading,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        hasRole,
        refreshUser,
    } = context

    return {
        user: profile,
        isLoading,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        hasRole,
        isAdmin: hasRole('ADMIN'),
        isGerenciador: hasRole('GERENCIADOR'),
        isEquipe: hasRole('EQUIPE'),
        isCliente: hasRole('CLIENTE'),
        refreshUser,
    }
}
