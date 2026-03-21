// src/types/restaurant.types.ts
export type DayOfWeek = 
    | 'monday' 
    | 'tuesday' 
    | 'wednesday' 
    | 'thursday' 
    | 'friday' 
    | 'saturday' 
    | 'sunday';

export interface OpeningHours {
    day: DayOfWeek;
    isOpen: boolean;
    openTime?: string; // HH:MM format
    closeTime?: string; // HH:MM format
}

export interface RestaurantSocialMedia {
    instagram?: string;
    facebook?: string;
    twitter?: string;
}

export interface RestaurantSettings {
    acceptsReservation: boolean;
    deliveryRadius: number; // in km
    minimumOrder: number;
    estimatedDeliveryTime: number; // in minutes
    taxPercentage: number;
}

export interface Restaurant {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    coverImage?: string;
    cnpj?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    
    // Address
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
    
    // Business hours
    openingHours: OpeningHours[];
    
    // Settings
    settings: RestaurantSettings;
    
    // Status
    isActive: boolean;
    isOpen: boolean;
    rating?: number;
    reviewCount?: number;
    
    // Relations
    ownerId?: string;
    
    // Timestamps
    createdAt?: string;
    updatedAt?: string;
}

export interface RestaurantFormData {
    name: string;
    description?: string;
    logo?: string;
    coverImage?: string;
    cnpj?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
    openingHours: OpeningHours[];
    acceptsReservation?: boolean;
    deliveryRadius?: number;
    minimumOrder?: number;
    estimatedDeliveryTime?: number;
    taxPercentage?: number;
}
