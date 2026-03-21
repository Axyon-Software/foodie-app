// src/tests/unit/constants/auth.constants.test.ts
import { describe, it, expect } from 'vitest'
import {
    AUTH_MESSAGES,
    AUTH_ERRORS,
    getAuthErrorMessage,
} from '@/lib/constants/auth.constants'

describe('AUTH_MESSAGES', () => {
    it('should have all required message keys', () => {
        expect(AUTH_MESSAGES.SIGN_IN_TITLE).toBe('Bem-vindo de volta!')
        expect(AUTH_MESSAGES.SIGN_UP_TITLE).toBe('Crie sua conta')
        expect(AUTH_MESSAGES.SIGN_IN_BUTTON).toBe('Entrar')
        expect(AUTH_MESSAGES.SIGN_UP_BUTTON).toBe('Criar conta')
        expect(AUTH_MESSAGES.FORGOT_PASSWORD).toBe('Esqueceu a senha?')
    })

    it('should have sign in loading message', () => {
        expect(AUTH_MESSAGES.SIGN_IN_LOADING).toBe('Entrando...')
    })

    it('should have sign up loading message', () => {
        expect(AUTH_MESSAGES.SIGN_UP_LOADING).toBe('Criando conta...')
    })

    it('should have divider message', () => {
        expect(AUTH_MESSAGES.OR_DIVIDER).toBe('ou')
    })

    it('should have google button message', () => {
        expect(AUTH_MESSAGES.GOOGLE_BUTTON).toBe('Continuar com Google')
    })
})

describe('AUTH_ERRORS', () => {
    it('should have invalid credentials error', () => {
        expect(AUTH_ERRORS['Invalid login credentials']).toBe('Email ou senha incorretos')
    })

    it('should have email not confirmed error', () => {
        expect(AUTH_ERRORS['Email not confirmed']).toBe('Confirme seu email antes de entrar')
    })

    it('should have user already registered error', () => {
        expect(AUTH_ERRORS['User already registered']).toBe('Este email já está cadastrado')
    })

    it('should have password too short error', () => {
        expect(AUTH_ERRORS['Password should be at least 6 characters']).toBe(
            'A senha deve ter pelo menos 6 caracteres'
        )
    })

    it('should have rate limit error', () => {
        expect(AUTH_ERRORS['Email rate limit exceeded']).toBe(
            'Muitas tentativas. Aguarde um momento'
        )
    })
})

describe('getAuthErrorMessage', () => {
    it('should return translated error message for known errors', () => {
        expect(getAuthErrorMessage('Invalid login credentials')).toBe(
            'Email ou senha incorretos'
        )
    })

    it('should return default message for unknown errors', () => {
        expect(getAuthErrorMessage('Some unknown error')).toBe(
            'Ocorreu um erro. Tente novamente'
        )
    })

    it('should return default message for empty error', () => {
        expect(getAuthErrorMessage('')).toBe('Ocorreu um erro. Tente novamente')
    })
})
