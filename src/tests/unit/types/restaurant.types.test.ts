// src/tests/unit/types/restaurant.types.test.ts
import { describe, it, expect } from 'vitest'
import type { 
    Restaurant, 
    RestaurantFormData, 
    OpeningHours, 
    DayOfWeek,
    RestaurantSettings 
} from '@/types/restaurant.types'

describe('Restaurant Types', () => {
    describe('OpeningHours', () => {
        it('should create valid OpeningHours', () => {
            const hours: OpeningHours = {
                day: 'monday',
                isOpen: true,
                openTime: '08:00',
                closeTime: '22:00',
            }

            expect(hours.day).toBe('monday')
            expect(hours.isOpen).toBe(true)
            expect(hours.openTime).toBe('08:00')
            expect(hours.closeTime).toBe('22:00')
        })

        it('should allow closed day', () => {
            const hours: OpeningHours = {
                day: 'sunday',
                isOpen: false,
            }

            expect(hours.isOpen).toBe(false)
            expect(hours.openTime).toBeUndefined()
            expect(hours.closeTime).toBeUndefined()
        })
    })

    describe('DayOfWeek', () => {
        it('should accept monday', () => {
            const day: DayOfWeek = 'monday'
            expect(day).toBe('monday')
        })

        it('should accept sunday', () => {
            const day: DayOfWeek = 'sunday'
            expect(day).toBe('sunday')
        })
    })

    describe('RestaurantSettings', () => {
        it('should create valid settings', () => {
            const settings: RestaurantSettings = {
                acceptsReservation: true,
                deliveryRadius: 5,
                minimumOrder: 20,
                estimatedDeliveryTime: 45,
                taxPercentage: 10,
            }

            expect(settings.acceptsReservation).toBe(true)
            expect(settings.deliveryRadius).toBe(5)
            expect(settings.minimumOrder).toBe(20)
            expect(settings.estimatedDeliveryTime).toBe(45)
            expect(settings.taxPercentage).toBe(10)
        })

        it('should allow optional fields', () => {
            const settings: RestaurantSettings = {
                deliveryRadius: 3,
            }

            expect(settings.acceptsReservation).toBeUndefined()
            expect(settings.minimumOrder).toBeUndefined()
        })
    })

    describe('Restaurant', () => {
        it('should create valid restaurant', () => {
            const restaurant: Restaurant = {
                id: 'restaurant-123',
                name: 'Restaurante Teste',
                description: 'Um restaurante de testes',
                email: 'teste@restaurante.com',
                phone: '11999999999',
                city: 'São Paulo',
                state: 'SP',
                isActive: true,
                isOpen: true,
                rating: 4.5,
                reviewCount: 100,
                openingHours: [
                    { day: 'monday', isOpen: true, openTime: '08:00', closeTime: '22:00' },
                ],
                settings: {
                    acceptsReservation: true,
                    deliveryRadius: 5,
                    minimumOrder: 20,
                    estimatedDeliveryTime: 45,
                    taxPercentage: 10,
                },
            }

            expect(restaurant.id).toBe('restaurant-123')
            expect(restaurant.name).toBe('Restaurante Teste')
            expect(restaurant.isActive).toBe(true)
            expect(restaurant.rating).toBe(4.5)
        })

        it('should allow optional fields', () => {
            const restaurant: Restaurant = {
                id: 'restaurant-123',
                name: 'Restaurante Teste',
                isActive: true,
                isOpen: true,
                openingHours: [],
                settings: {},
            }

            expect(restaurant.description).toBeUndefined()
            expect(restaurant.logo).toBeUndefined()
            expect(restaurant.cnpj).toBeUndefined()
        })
    })
})
