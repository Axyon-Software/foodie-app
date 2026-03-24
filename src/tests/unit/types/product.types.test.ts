// src/tests/unit/types/product.types.test.ts
import { describe, it, expect } from 'vitest'
import type { 
    Product, 
    ProductFormData, 
    Category,
    CategoryFormData,
    ProductBadge,
    ProductVariation,
    ProductExtra,
    ProductOption
} from '@/types/product.types'

describe('Product Types', () => {
    describe('ProductBadge', () => {
        it('should accept vegetarian badge', () => {
            const badge: ProductBadge = 'vegetarian'
            expect(badge).toBe('vegetarian')
        })

        it('should accept vegan badge', () => {
            const badge: ProductBadge = 'vegan'
            expect(badge).toBe('vegan')
        })

        it('should accept gluten_free badge', () => {
            const badge: ProductBadge = 'gluten_free'
            expect(badge).toBe('gluten_free')
        })

        it('should accept spicy badge', () => {
            const badge: ProductBadge = 'spicy'
            expect(badge).toBe('spicy')
        })

        it('should accept popular badge', () => {
            const badge: ProductBadge = 'popular'
            expect(badge).toBe('popular')
        })

        it('should accept new badge', () => {
            const badge: ProductBadge = 'new'
            expect(badge).toBe('new')
        })

        it('should accept discount badge', () => {
            const badge: ProductBadge = 'discount'
            expect(badge).toBe('discount')
        })
    })

    describe('ProductVariation', () => {
        it('should create valid variation', () => {
            const variation: ProductVariation = {
                id: 'var-1',
                name: 'Grande',
                price: 10.00,
                isDefault: true,
            }

            expect(variation.name).toBe('Grande')
            expect(variation.price).toBe(10.00)
            expect(variation.isDefault).toBe(true)
        })
    })

    describe('ProductExtra', () => {
        it('should create valid extra', () => {
            const extra: ProductExtra = {
                id: 'extra-1',
                name: 'Bacon',
                price: 3.00,
                maxQuantity: 3,
            }

            expect(extra.name).toBe('Bacon')
            expect(extra.price).toBe(3.00)
            expect(extra.maxQuantity).toBe(3)
        })
    })

    describe('ProductOption', () => {
        it('should create valid option', () => {
            const option: ProductOption = {
                id: 'opt-1',
                name: 'Tamanho',
                type: 'single',
                required: true,
                variations: [
                    { name: 'Pequeno', price: 0 },
                    { name: 'Grande', price: 5 },
                ],
            }

            expect(option.name).toBe('Tamanho')
            expect(option.type).toBe('single')
            expect(option.required).toBe(true)
            expect(option.variations).toHaveLength(2)
        })

        it('should allow extras in option', () => {
            const option: ProductOption = {
                id: 'opt-1',
                name: 'Adicionais',
                type: 'multiple',
                required: false,
                variations: [],
                extras: [
                    { name: 'Queijo', price: 2 },
                    { name: 'Bacon', price: 3 },
                ],
            }

            expect(option.extras).toHaveLength(2)
        })
    })

    describe('Product', () => {
        it('should create valid product', () => {
            const product: Product = {
                id: 'product-123',
                restaurantId: 'restaurant-123',
                categoryId: 'category-123',
                name: 'Hambúrguer',
                description: 'Delicioso hambúrguer',
                price: 25.90,
                image: 'https://exemplo.com/hamburguer.jpg',
                isActive: true,
                isAvailable: true,
                badges: ['popular', 'spicy'],
                options: [],
            }

            expect(product.id).toBe('product-123')
            expect(product.name).toBe('Hambúrguer')
            expect(product.price).toBe(25.90)
            expect(product.badges).toContain('popular')
            expect(product.badges).toContain('spicy')
        })

        it('should allow optional fields', () => {
            const product: Product = {
                id: 'product-123',
                restaurantId: 'restaurant-123',
                categoryId: 'category-123',
                name: 'Product Test',
                price: 10,
                isActive: true,
                isAvailable: true,
                badges: [],
            }

            expect(product.description).toBeUndefined()
            expect(product.image).toBeUndefined()
            expect(product.options).toBeUndefined()
        })
    })

    describe('Category', () => {
        it('should create valid category', () => {
            const category: Category = {
                id: 'category-123',
                restaurantId: 'restaurant-123',
                name: 'Lanches',
                description: 'Deliciosos lanches',
                icon: 'burger',
                sortOrder: 1,
                isActive: true,
            }

            expect(category.id).toBe('category-123')
            expect(category.name).toBe('Lanches')
            expect(category.sortOrder).toBe(1)
            expect(category.isActive).toBe(true)
        })
    })
})
