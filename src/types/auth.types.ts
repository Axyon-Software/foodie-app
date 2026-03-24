// src/types/auth.types.ts
import type { User } from '@supabase/supabase-js';

export type UserRole = 'CLIENTE' | 'ADMIN' | 'GERENCIADOR' | 'EQUIPE';

export interface AuthFormData {
    email: string;
    password: string;
}

export interface SignUpFormData extends AuthFormData {
    fullName: string;
    confirmPassword: string;
}

export interface AuthError {
    message: string;
    field?: string;
}

export type AuthMode = 'sign-in' | 'sign-up';

export interface UserProfile {
    id: string;
    email: string;
    fullName: string | null;
    role: UserRole;
    avatarUrl?: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}