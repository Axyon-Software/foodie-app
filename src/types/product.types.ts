// src/types/product.types.ts

export type ProductBadge = 'vegetarian' | 'vegan' | 'gluten_free' | 'spicy' | 'popular' | 'new' | 'discount';

export interface ProductVariation {
    id: string;
    name: string;
    price: number;
    description?: string;
    isDefault?: boolean;
}

export interface ProductExtra {
    id: string;
    name: string;
    price: number;
    maxQuantity?: number;
}

export interface ProductOption {
    id: string;
    name: string;
    type: 'single' | 'multiple';
    required: boolean;
    variations: ProductVariation[];
    extras?: ProductExtra[];
}

export interface Product {
    id: string;
    restaurantId: string;
    categoryId: string;
    
    // Basic info
    name: string;
    description?: string;
    price: number;
    image?: string;
    
    // Status
    isActive: boolean;
    isAvailable: boolean;
    
    // Badges
    badges: ProductBadge[];
    
    // Options (variations, extras)
    options?: ProductOption[];
    
    // Additional
    preparationTime?: number; // in minutes
    calories?: number;
    
    // Timestamps
    createdAt?: string;
    updatedAt?: string;
}

export interface Category {
    id: string;
    restaurantId: string;
    name: string;
    description?: string;
    icon?: string;
    image?: string;
    sortOrder: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CategoryFormData {
    name: string;
    description?: string;
    icon?: string;
    image?: string;
    sortOrder?: number;
    isActive?: boolean;
}

export interface ProductFormData {
    restaurantId: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    isActive?: boolean;
    isAvailable?: boolean;
    badges?: ProductBadge[];
    options?: ProductOption[];
    preparationTime?: number;
    calories?: number;
}

export interface ProductFilters {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    badges?: ProductBadge[];
    isAvailable?: boolean;
}
