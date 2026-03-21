// src/tests/hooks/useAuth.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'

vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
            onAuthStateChange: vi.fn(() => ({ 
                data: { 
                    subscription: { 
                        unsubscribe: vi.fn() 
                    } 
                } 
            })),
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: null, error: null })),
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
                    update: vi.fn(() => ({
                        select: vi.fn(() => ({
                            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
                        })),
                    })),
                })),
            })),
        })),
    })),
}))

describe('useAuth', () => {
    it('should throw error when used outside AuthProvider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
        
        expect(() => {
            renderHook(() => useAuth())
        }).toThrow('useAuth must be used within an AuthProvider')
        
        consoleError.mockRestore()
    })

    it('should be a function', () => {
        expect(typeof useAuth).toBe('function')
    })
})
