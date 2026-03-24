// src/types/menu-management.types.ts
export type ProductCategory = 
    | 'entradas'
    | 'pratos_principais'
    | 'bebidas'
    | 'sobremesas'
    | 'combos'
    | 'acompanhamentos'
    | 'porcoes';

export interface MenuCategory {
    id: string;
    restaurantId: string;
    name: string;
    description?: string;
    order: number;
    isActive: boolean;
    createdAt: string;
}

export interface Product {
    id: string;
    restaurantId: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    image: string;
    images: string[];
    ingredients?: string;
    allergens: string[];
    isActive: boolean;
    isAvailable: boolean;
    isPopular: boolean;
    isPromotional: boolean;
    promotionalPrice?: number;
    promotionalStartDate?: string;
    promotionalEndDate?: string;
    stock?: number;
    stockManagement: boolean;
    preparationTime: number;
    calories?: number;
    availableHours: WeeklySchedule[];
    variations: ProductVariation[];
    addons: ProductAddon[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductVariation {
    id: string;
    productId: string;
    name: string;
    options: VariationOption[];
    required: boolean;
    maxSelections: number;
}

export interface VariationOption {
    id: string;
    name: string;
    price: number;
    isAvailable: boolean;
}

export interface ProductAddon {
    id: string;
    productId: string;
    name: string;
    price: number;
    isAvailable: boolean;
}

export interface WeeklySchedule {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

export interface CreateProductForm {
    categoryId: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    ingredients?: string;
    allergens: string[];
    isPopular: boolean;
    stock?: number;
    stockManagement: boolean;
    preparationTime: number;
    calories?: number;
    variations: CreateVariation[];
    addons: CreateAddon[];
}

export interface CreateVariation {
    name: string;
    options: { name: string; price: number }[];
    required: boolean;
    maxSelections: number;
}

export interface CreateAddon {
    name: string;
    price: number;
}

export interface CreateCategoryForm {
    name: string;
    description?: string;
    order?: number;
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
    entradas: 'Entradas',
    pratos_principais: 'Pratos Principais',
    bebidas: 'Bebidas',
    sobremesas: 'Sobremesas',
    combos: 'Combos',
    acompanhamento: 'Acompanhamentos',
    porcoes: 'Porções',
};

export const ALLERGEN_OPTIONS = [
    'Glúten',
    'Lactose',
    'Ovos',
    'Amendoim',
    'Nozes',
    'Mariscos',
    'Soja',
    'Mostarda',
    'Sésamo',
    'Sulfitos',
];

export const PRODUCT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    OUT_OF_STOCK: 'out_of_stock',
} as const;
