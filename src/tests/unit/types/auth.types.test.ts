// src/tests/unit/types/auth.types.test.ts
import { describe, it, expect } from 'vitest'
import type { UserRole, UserProfile, AuthState, AuthFormData, SignUpFormData } from '@/types/auth.types'

describe('Auth Types', () => {
    describe('UserRole', () => {
        it('should accept CLIENTE role', () => {
            const role: UserRole = 'CLIENTE'
            expect(role).toBe('CLIENTE')
        })

        it('should accept ADMIN role', () => {
            const role: UserRole = 'ADMIN'
            expect(role).toBe('ADMIN')
        })

        it('should accept GERENCIADOR role', () => {
            const role: UserRole = 'GERENCIADOR'
            expect(role).toBe('GERENCIADOR')
        })

        it('should accept EQUIPE role', () => {
            const role: UserRole = 'EQUIPE'
            expect(role).toBe('EQUIPE')
        })
    })

    describe('UserProfile', () => {
        it('should create a valid UserProfile object', () => {
            const profile: UserProfile = {
                id: 'user-123',
                email: 'test@example.com',
                fullName: 'Test User',
                role: 'CLIENTE',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            }

            expect(profile.id).toBe('user-123')
            expect(profile.email).toBe('test@example.com')
            expect(profile.fullName).toBe('Test User')
            expect(profile.role).toBe('CLIENTE')
        })

        it('should allow optional fields', () => {
            const profile: UserProfile = {
                id: 'user-123',
                email: 'test@example.com',
                fullName: null,
                role: 'CLIENTE',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            }

            expect(profile.fullName).toBeNull()
            expect(profile.avatarUrl).toBeUndefined()
            expect(profile.phone).toBeUndefined()
        })

        it('should allow avatarUrl and phone', () => {
            const profile: UserProfile = {
                id: 'user-123',
                email: 'test@example.com',
                fullName: 'Test User',
                role: 'ADMIN',
                avatarUrl: 'https://example.com/avatar.jpg',
                phone: '11999999999',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            }

            expect(profile.avatarUrl).toBe('https://example.com/avatar.jpg')
            expect(profile.phone).toBe('11999999999')
        })
    })

    describe('AuthState', () => {
        it('should create a valid AuthState with user', () => {
            const profile: UserProfile = {
                id: 'user-123',
                email: 'test@example.com',
                fullName: 'Test User',
                role: 'CLIENTE',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            }

            const authState: AuthState = {
                user: { id: 'auth-user-123', email: 'test@example.com', email_confirmed_at: '2024-01-01', created_at: '2024-01-01' } as any,
                profile,
                isLoading: false,
                isAuthenticated: true,
            }

            expect(authState.isAuthenticated).toBe(true)
            expect(authState.isLoading).toBe(false)
            expect(authState.profile?.role).toBe('CLIENTE')
        })

        it('should create a valid AuthState without user', () => {
            const authState: AuthState = {
                user: null,
                profile: null,
                isLoading: false,
                isAuthenticated: false,
            }

            expect(authState.isAuthenticated).toBe(false)
            expect(authState.user).toBeNull()
            expect(authState.profile).toBeNull()
        })
    })

    describe('AuthFormData', () => {
        it('should create a valid AuthFormData object', () => {
            const formData: AuthFormData = {
                email: 'test@example.com',
                password: 'password123',
            }

            expect(formData.email).toBe('test@example.com')
            expect(formData.password).toBe('password123')
        })
    })

    describe('SignUpFormData', () => {
        it('should create a valid SignUpFormData object', () => {
            const formData: SignUpFormData = {
                email: 'test@example.com',
                password: 'password123',
                fullName: 'Test User',
                confirmPassword: 'password123',
            }

            expect(formData.email).toBe('test@example.com')
            expect(formData.password).toBe('password123')
            expect(formData.fullName).toBe('Test User')
            expect(formData.confirmPassword).toBe('password123')
        })
    })
})
