// src/types/user-profile.types.ts
import type { UserRole } from './auth.types';

export type StaffRole = 'GARCOM' | 'COZINHEIRO' | 'CAIXA' | 'GERENTE' | 'ADMIN_RESTAURANTE';

export interface UserPermissions {
    canManageMenu: boolean;
    canManageOrders: boolean;
    canManageStaff: boolean;
    canViewFinancials: boolean;
    canManageRestaurant: boolean;
    canAccessAdminPanel: boolean;
}

export const RolePermissions: Record<UserRole | StaffRole, UserPermissions> = {
    CLIENTE: {
        canManageMenu: false,
        canManageOrders: false,
        canManageStaff: false,
        canViewFinancials: false,
        canManageRestaurant: false,
        canAccessAdminPanel: false,
    },
    GERENCIADOR: {
        canManageMenu: true,
        canManageOrders: true,
        canManageStaff: true,
        canViewFinancials: true,
        canManageRestaurant: true,
        canAccessAdminPanel: true,
    },
    ADMIN: {
        canManageMenu: true,
        canManageOrders: true,
        canManageStaff: true,
        canViewFinancials: true,
        canManageRestaurant: true,
        canAccessAdminPanel: true,
    },
    EQUIPE: {
        canManageMenu: false,
        canManageOrders: true,
        canManageStaff: false,
        canViewFinancials: false,
        canManageRestaurant: false,
        canAccessAdminPanel: false,
    },
    GARCOM: {
        canManageMenu: false,
        canManageOrders: true,
        canManageStaff: false,
        canViewFinancials: false,
        canManageRestaurant: false,
        canAccessAdminPanel: false,
    },
    COZINHEIRO: {
        canManageMenu: false,
        canManageOrders: true,
        canManageStaff: false,
        canViewFinancials: false,
        canManageRestaurant: false,
        canAccessAdminPanel: false,
    },
    CAIXA: {
        canManageMenu: false,
        canManageOrders: true,
        canManageStaff: false,
        canViewFinancials: true,
        canManageRestaurant: false,
        canAccessAdminPanel: false,
    },
    GERENTE: {
        canManageMenu: true,
        canManageOrders: true,
        canManageStaff: true,
        canViewFinancials: true,
        canManageRestaurant: true,
        canAccessAdminPanel: true,
    },
    ADMIN_RESTAURANTE: {
        canManageMenu: true,
        canManageOrders: true,
        canManageStaff: true,
        canViewFinancials: true,
        canManageRestaurant: true,
        canAccessAdminPanel: true,
    },
};

export interface RestaurantStaff {
    id: string;
    userId: string;
    restaurantId: string;
    role: StaffRole;
    permissions: UserPermissions;
    assignedAreas?: string[];
    workingHours?: WorkingHours[];
    active: boolean;
}

export interface WorkingHours {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export interface UserPrivacySettings {
    showProfile: boolean;
    showOrderHistory: boolean;
    allowMarketing: boolean;
    allowNotifications: boolean;
    dataSharing: boolean;
    twoFactorEnabled: boolean;
}

export interface ClientProfile extends UserProfile {
    favoriteRestaurants: string[];
    savedAddresses: SavedAddressProfile[];
    orderHistory: OrderSummary[];
    preferences: UserPreferences;
    privacySettings: UserPrivacySettings;
}

export interface SavedAddressProfile {
    id: string;
    label: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
    instructions?: string;
}

export interface OrderSummary {
    id: string;
    restaurantId: string;
    restaurantName: string;
    total: number;
    status: string;
    createdAt: string;
    items: { name: string; quantity: number }[];
}

export interface UserPreferences {
    dietaryRestrictions: string[];
    favoriteCuisines: string[];
    notificationOrderUpdates: boolean;
    notificationPromotions: boolean;
    notificationNewsletter: boolean;
}

export interface AdminProfile extends UserProfile {
    managedRestaurants: ManagedRestaurant[];
    permissions: UserPermissions;
    stats: AdminStats;
}

export interface ManagedRestaurant {
    id: string;
    name: string;
    role: StaffRole;
    active: boolean;
}

export interface AdminStats {
    totalOrders: number;
    totalRevenue: number;
    activeRestaurants: number;
    activeStaff: number;
}

export interface StaffProfile extends UserProfile {
    assignedRestaurant: string;
    staffRole: StaffRole;
    permissions: UserPermissions;
    currentShift?: ShiftInfo;
    performanceMetrics: StaffMetrics;
}

export interface ShiftInfo {
    startTime: string;
    endTime: string;
    active: boolean;
}

export interface StaffMetrics {
    ordersProcessed: number;
    averageRating: number;
    onTimeDelivery: number;
}

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