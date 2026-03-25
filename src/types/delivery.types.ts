// src/types/delivery.types.ts
export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERING' | 'DELIVERED';

export type DeliveryZoneType = 'RADIUS' | 'POLYGON' | 'AREAS';

export interface GeoPoint {
    latitude: number;
    longitude: number;
}

export interface DeliveryZone {
    id: string;
    restaurantId: string;
    name: string;
    type: DeliveryZoneType;
    center?: GeoPoint;
    radiusKm?: number;
    polygonPoints?: GeoPoint[];
    areas?: string[];
    deliveryFee: number;
    feePerKm?: number;
    minOrderValue: number;
    estimatedTimeMinutes: number;
    isActive: boolean;
    priority: number;
}

export interface DeliveryFeeResult {
    available: boolean;
    fee: number;
    estimatedTime: number;
    distanceKm: number;
    zoneId?: string;
    zoneName?: string;
    reason?: string;
}

export interface DeliveryDriver {
    id: string;
    userId: string;
    name: string;
    phone: string;
    vehicleType: 'MOTO' | 'BIKE' | 'CAR';
    vehiclePlate?: string;
    photoUrl?: string;
    rating: number;
    totalDeliveries: number;
    isAvailable: boolean;
    currentLocation?: GeoPoint;
    lastLocationUpdate?: string;
}

export interface Delivery {
    id: string;
    orderId: string;
    restaurantId: string;
    driverId?: string;
    driver?: DeliveryDriver;
    status: DeliveryStatus;
    pickupAddress: DeliveryAddress;
    deliveryAddress: DeliveryAddress;
    pickupLocation: GeoPoint;
    deliveryLocation: GeoPoint;
    currentLocation?: GeoPoint;
    distanceKm: number;
    deliveryFee: number;
    estimatedPickupTime?: string;
    estimatedDeliveryTime?: string;
    actualPickupTime?: string;
    actualDeliveryTime?: string;
    proofPhotoUrl?: string;
    proofNotes?: string;
    proofSignedBy?: string;
    proofTimestamp?: string;
    timeline: DeliveryTimeline[];
    createdAt: string;
    updatedAt: string;
}

export interface DeliveryAddress {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    reference?: string;
}

export interface DeliveryTimeline {
    status: DeliveryStatus;
    timestamp: string;
    location?: GeoPoint;
    note?: string;
}

export interface DeliveryProof {
    photoUrl: string;
    notes?: string;
    signedBy?: string;
    location: GeoPoint;
    timestamp: string;
}

export interface CreateDeliveryZoneRequest {
    name: string;
    type: DeliveryZoneType;
    center?: GeoPoint;
    radiusKm?: number;
    polygonPoints?: GeoPoint[];
    areas?: string[];
    deliveryFee: number;
    feePerKm?: number;
    minOrderValue: number;
    estimatedTimeMinutes: number;
    priority: number;
}

export interface UpdateDriverLocationRequest {
    latitude: number;
    longitude: number;
}

export interface DeliveryAssignmentRequest {
    orderId: string;
    driverId?: string;
}

export interface DeliveryStats {
    totalDeliveries: number;
    pendingDeliveries: number;
    activeDeliveries: number;
    completedDeliveries: number;
    averageDeliveryTime: number;
    averageDistance: number;
    totalFees: number;
    onTimeRate: number;
}

export interface NearbyDriver {
    driver: DeliveryDriver;
    distanceKm: number;
    estimatedArrival: number;
}

export interface DeliveryNotification {
    id: string;
    type: 'NEW_ASSIGNMENT' | 'STATUS_UPDATE' | 'LOCATION_UPDATE' | 'DELIVERY_COMPLETE';
    deliveryId: string;
    message: string;
    read: boolean;
    createdAt: string;
}
