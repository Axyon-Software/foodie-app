// src/actions/delivery-actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { DeliveryZone, DeliveryFeeResult, DeliveryDriver, Delivery, DeliveryProof, GeoPoint, CreateDeliveryZoneRequest, UpdateDriverLocationRequest, DeliveryStats } from '@/types/delivery.types';

function calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
    const R = 6371;
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function isPointInCircle(point: GeoPoint, center: GeoPoint, radiusKm: number): boolean {
    return calculateDistance(point, center) <= radiusKm;
}

export async function createDeliveryZone(data: CreateDeliveryZoneRequest): Promise<{ data?: DeliveryZone; error?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: 'Usuário não autenticado' };

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!restaurant) return { error: 'Restaurante não encontrado' };

        const { data: zone, error } = await supabase
            .from('delivery_zones')
            .insert({
                restaurant_id: restaurant.id,
                name: data.name,
                type: data.type,
                center: data.center ? JSON.stringify(data.center) : null,
                radius_km: data.radiusKm,
                polygon_points: data.polygonPoints ? JSON.stringify(data.polygonPoints) : null,
                areas: data.areas ? JSON.stringify(data.areas) : null,
                delivery_fee: data.deliveryFee,
                fee_per_km: data.feePerKm,
                min_order_value: data.minOrderValue,
                estimated_time_minutes: data.estimatedTimeMinutes,
                priority: data.priority,
                is_active: true,
            })
            .select()
            .single();

        if (error) return { error: error.message };

        return { data: mapZoneFromDB(zone) };
    } catch (error) {
        console.error('Error creating zone:', error);
        return { error: 'Erro ao criar zona' };
    }
}

export async function getDeliveryZones(): Promise<{ data?: DeliveryZone[]; error?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: 'Usuário não autenticado' };

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!restaurant) return { data: [] };

        const { data, error } = await supabase
            .from('delivery_zones')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('priority', { ascending: false });

        if (error) return { error: error.message };

        return { data: (data || []).map(mapZoneFromDB) };
    } catch (error) {
        console.error('Error fetching zones:', error);
        return { error: 'Erro ao buscar zonas' };
    }
}

export async function updateDeliveryZone(zoneId: string, data: Partial<CreateDeliveryZoneRequest>): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('delivery_zones')
            .update({
                name: data.name,
                center: data.center ? JSON.stringify(data.center) : undefined,
                radius_km: data.radiusKm,
                polygon_points: data.polygonPoints ? JSON.stringify(data.polygonPoints) : undefined,
                areas: data.areas ? JSON.stringify(data.areas) : undefined,
                delivery_fee: data.deliveryFee,
                fee_per_km: data.feePerKm,
                min_order_value: data.minOrderValue,
                estimated_time_minutes: data.estimatedTimeMinutes,
                priority: data.priority,
                updated_at: new Date().toISOString(),
            })
            .eq('id', zoneId);

        if (error) return { error: error.message };
        return { success: true };
    } catch (error) {
        console.error('Error updating zone:', error);
        return { error: 'Erro ao atualizar zona' };
    }
}

export async function toggleDeliveryZone(zoneId: string, isActive: boolean): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('delivery_zones')
            .update({ is_active: isActive, updated_at: new Date().toISOString() })
            .eq('id', zoneId);

        if (error) return { error: error.message };
        return { success: true };
    } catch (error) {
        console.error('Error toggling zone:', error);
        return { error: 'Erro ao atualizar zona' };
    }
}

export async function deleteDeliveryZone(zoneId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('delivery_zones')
            .delete()
            .eq('id', zoneId);

        if (error) return { error: error.message };
        return { success: true };
    } catch (error) {
        console.error('Error deleting zone:', error);
        return { error: 'Erro ao excluir zona' };
    }
}

export async function calculateDeliveryFee(
    restaurantId: string,
    destination: GeoPoint,
    orderTotal: number
): Promise<DeliveryFeeResult> {
    try {
        const supabase = await createClient();

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('latitude, longitude')
            .eq('id', restaurantId)
            .single();

        if (!restaurant) {
            return { available: false, fee: 0, estimatedTime: 0, distanceKm: 0, reason: 'Restaurante não encontrado' };
        }

        const restaurantLocation: GeoPoint = {
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
        };

        const distanceKm = calculateDistance(restaurantLocation, destination);

        const { data: zones } = await supabase
            .from('delivery_zones')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .eq('is_active', true)
            .order('priority', { ascending: false });

        if (!zones || zones.length === 0) {
            if (distanceKm <= 10) {
                const fee = 5.99 + (distanceKm * 1.5);
                return { available: true, fee: Math.round(fee * 100) / 100, estimatedTime: Math.ceil(30 + distanceKm * 3), distanceKm: Math.round(distanceKm * 10) / 10 };
            }
            return { available: false, fee: 0, estimatedTime: 0, distanceKm: Math.round(distanceKm * 10) / 10, reason: 'Fora da área de entrega' };
        }

        for (const zone of zones) {
            let inZone = false;

            if (zone.type === 'RADIUS' && zone.center && zone.radius_km) {
                inZone = isPointInCircle(destination, zone.center, zone.radius_km);
            }

            if (inZone) {
                if (orderTotal < zone.min_order_value) {
                    return {
                        available: false,
                        fee: 0,
                        estimatedTime: 0,
                        distanceKm: Math.round(distanceKm * 10) / 10,
                        reason: `Valor mínimo: R$ ${zone.min_order_value.toFixed(2)}`,
                    };
                }

                let fee = zone.delivery_fee;
                if (zone.fee_per_km) {
                    fee += distanceKm * zone.fee_per_km;
                }

                return {
                    available: true,
                    fee: Math.round(fee * 100) / 100,
                    estimatedTime: zone.estimated_time_minutes,
                    distanceKm: Math.round(distanceKm * 10) / 10,
                    zoneId: zone.id,
                    zoneName: zone.name,
                };
            }
        }

        return { available: false, fee: 0, estimatedTime: 0, distanceKm: Math.round(distanceKm * 10) / 10, reason: 'Fora da área de entrega' };
    } catch (error) {
        console.error('Error calculating fee:', error);
        return { available: false, fee: 0, estimatedTime: 0, distanceKm: 0, reason: 'Erro ao calcular frete' };
    }
}

export async function getDrivers(): Promise<{ data?: DeliveryDriver[]; error?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: 'Usuário não autenticado' };

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!restaurant) return { data: [] };

        const { data, error } = await supabase
            .from('delivery_drivers')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('name');

        if (error) return { error: error.message };

        return { data: (data || []).map(mapDriverFromDB) };
    } catch (error) {
        console.error('Error fetching drivers:', error);
        return { error: 'Erro ao buscar entregadores' };
    }
}

export async function createDriver(driver: Omit<DeliveryDriver, 'id'>): Promise<{ data?: DeliveryDriver; error?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: 'Usuário não autenticado' };

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!restaurant) return { error: 'Restaurante não encontrado' };

        const { data: newDriver, error } = await supabase
            .from('delivery_drivers')
            .insert({
                restaurant_id: restaurant.id,
                user_id: driver.userId,
                name: driver.name,
                phone: driver.phone,
                vehicle_type: driver.vehicleType,
                vehicle_plate: driver.vehiclePlate,
                photo_url: driver.photoUrl,
                rating: 5.0,
                total_deliveries: 0,
                is_available: true,
            })
            .select()
            .single();

        if (error) return { error: error.message };

        return { data: mapDriverFromDB(newDriver) };
    } catch (error) {
        console.error('Error creating driver:', error);
        return { error: 'Erro ao criar entregador' };
    }
}

export async function updateDriverLocation(driverId: string, location: GeoPoint): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('delivery_drivers')
            .update({
                current_location: JSON.stringify(location),
                last_location_update: new Date().toISOString(),
            })
            .eq('id', driverId);

        if (error) return { error: error.message };
        return { success: true };
    } catch (error) {
        console.error('Error updating location:', error);
        return { error: 'Erro ao atualizar localização' };
    }
}

export async function assignDriver(orderId: string, driverId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('deliveries')
            .update({
                driver_id: driverId,
                status: 'ASSIGNED',
                updated_at: new Date().toISOString(),
            })
            .eq('order_id', orderId);

        if (error) return { error: error.message };

        const { error: driverError } = await supabase
            .from('delivery_drivers')
            .update({ is_available: false })
            .eq('id', driverId);

        if (driverError) console.error('Error updating driver availability:', driverError);

        return { success: true };
    } catch (error) {
        console.error('Error assigning driver:', error);
        return { error: 'Erro ao atribuir entregador' };
    }
}

export async function updateDeliveryStatus(
    deliveryId: string,
    status: Delivery['status'],
    note?: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const updateData: Record<string, unknown> = { status, updated_at: new Date().toISOString() };

        if (status === 'PICKED_UP') updateData.actual_pickup_time = new Date().toISOString();
        if (status === 'DELIVERED') updateData.actual_delivery_time = new Date().toISOString();

        const { data: delivery } = await supabase
            .from('deliveries')
            .select('timeline')
            .eq('id', deliveryId)
            .single();

        const currentTimeline = delivery?.timeline || [];
        currentTimeline.push({ status, timestamp: new Date().toISOString(), note });
        updateData.timeline = JSON.stringify(currentTimeline);

        const { error } = await supabase
            .from('deliveries')
            .update(updateData)
            .eq('id', deliveryId);

        if (error) return { error: error.message };

        if (status === 'DELIVERED') {
            const { data: deliveryData } = await supabase
                .from('deliveries')
                .select('driver_id')
                .eq('id', deliveryId)
                .single();

            if (deliveryData?.driver_id) {
                await supabase
                    .from('delivery_drivers')
                    .update({ is_available: true })
                    .eq('id', deliveryData.driver_id);
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating delivery status:', error);
        return { error: 'Erro ao atualizar status' };
    }
}

export async function submitDeliveryProof(
    deliveryId: string,
    proof: DeliveryProof
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('deliveries')
            .update({
                proof_photo_url: proof.photoUrl,
                proof_notes: proof.notes,
                proof_signed_by: proof.signedBy,
                proof_timestamp: proof.timestamp,
                updated_at: new Date().toISOString(),
            })
            .eq('id', deliveryId);

        if (error) return { error: error.message };
        return { success: true };
    } catch (error) {
        console.error('Error submitting proof:', error);
        return { error: 'Erro ao enviar comprovante' };
    }
}

export async function getDeliveryByOrder(orderId: string): Promise<{ data?: Delivery; error?: string }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('deliveries')
            .select('*, delivery_drivers(*)')
            .eq('order_id', orderId)
            .single();

        if (error) return { error: 'Entrega não encontrada' };

        return { data: mapDeliveryFromDB(data) };
    } catch (error) {
        console.error('Error fetching delivery:', error);
        return { error: 'Erro ao buscar entrega' };
    }
}

export async function getDeliveryStats(): Promise<{ data?: DeliveryStats; error?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: 'Usuário não autenticado' };

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!restaurant) return { error: 'Restaurante não encontrado' };

        const { data: deliveries } = await supabase
            .from('deliveries')
            .select('status, delivery_fee, distance_km, estimated_delivery_time, actual_delivery_time')
            .eq('restaurant_id', restaurant.id);

        const all = deliveries || [];

        return {
            data: {
                totalDeliveries: all.length,
                pendingDeliveries: all.filter(d => d.status === 'PENDING').length,
                activeDeliveries: all.filter(d => ['ASSIGNED', 'PICKED_UP', 'DELIVERING'].includes(d.status)).length,
                completedDeliveries: all.filter(d => d.status === 'DELIVERED').length,
                averageDeliveryTime: 35,
                averageDistance: all.length > 0 ? all.reduce((sum, d) => sum + (d.distance_km || 0), 0) / all.length : 0,
                totalFees: all.reduce((sum, d) => sum + (d.delivery_fee || 0), 0),
                onTimeRate: 0.85,
            },
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { error: 'Erro ao buscar estatísticas' };
    }
}

function mapZoneFromDB(row: Record<string, unknown>): DeliveryZone {
    return {
        id: row.id as string,
        restaurantId: row.restaurant_id as string,
        name: row.name as string,
        type: row.type as DeliveryZone['type'],
        center: typeof row.center === 'string' ? JSON.parse(row.center) : row.center as GeoPoint | undefined,
        radiusKm: row.radius_km as number | undefined,
        polygonPoints: typeof row.polygon_points === 'string' ? JSON.parse(row.polygon_points) : row.polygon_points as GeoPoint[] | undefined,
        areas: typeof row.areas === 'string' ? JSON.parse(row.areas) : row.areas as string[] | undefined,
        deliveryFee: Number(row.delivery_fee),
        feePerKm: row.fee_per_km as number | undefined,
        minOrderValue: Number(row.min_order_value),
        estimatedTimeMinutes: Number(row.estimated_time_minutes),
        isActive: row.is_active as boolean,
        priority: Number(row.priority),
    };
}

function mapDriverFromDB(row: Record<string, unknown>): DeliveryDriver {
    return {
        id: row.id as string,
        userId: row.user_id as string,
        name: row.name as string,
        phone: row.phone as string,
        vehicleType: row.vehicle_type as DeliveryDriver['vehicleType'],
        vehiclePlate: row.vehicle_plate as string | undefined,
        photoUrl: row.photo_url as string | undefined,
        rating: Number(row.rating),
        totalDeliveries: Number(row.total_deliveries),
        isAvailable: row.is_available as boolean,
        currentLocation: typeof row.current_location === 'string' ? JSON.parse(row.current_location) : row.current_location as GeoPoint | undefined,
        lastLocationUpdate: row.last_location_update as string | undefined,
    };
}

function mapDeliveryFromDB(row: Record<string, unknown>): Delivery {
    return {
        id: row.id as string,
        orderId: row.order_id as string,
        restaurantId: row.restaurant_id as string,
        driverId: row.driver_id as string | undefined,
        driver: row.delivery_drivers ? mapDriverFromDB(row.delivery_drivers as Record<string, unknown>) : undefined,
        status: row.status as Delivery['status'],
        pickupAddress: typeof row.pickup_address === 'string' ? JSON.parse(row.pickup_address) : row.pickup_address as Delivery['pickupAddress'],
        deliveryAddress: typeof row.delivery_address === 'string' ? JSON.parse(row.delivery_address) : row.delivery_address as Delivery['deliveryAddress'],
        pickupLocation: typeof row.pickup_location === 'string' ? JSON.parse(row.pickup_location) : row.pickup_location as GeoPoint,
        deliveryLocation: typeof row.delivery_location === 'string' ? JSON.parse(row.delivery_location) : row.delivery_location as GeoPoint,
        currentLocation: typeof row.current_location === 'string' ? JSON.parse(row.current_location) : row.current_location as GeoPoint | undefined,
        distanceKm: Number(row.distance_km),
        deliveryFee: Number(row.delivery_fee),
        estimatedPickupTime: row.estimated_pickup_time as string | undefined,
        estimatedDeliveryTime: row.estimated_delivery_time as string | undefined,
        actualPickupTime: row.actual_pickup_time as string | undefined,
        actualDeliveryTime: row.actual_delivery_time as string | undefined,
        proofPhotoUrl: row.proof_photo_url as string | undefined,
        proofNotes: row.proof_notes as string | undefined,
        proofSignedBy: row.proof_signed_by as string | undefined,
        proofTimestamp: row.proof_timestamp as string | undefined,
        timeline: typeof row.timeline === 'string' ? JSON.parse(row.timeline) : (row.timeline as Delivery['timeline']) || [],
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
    };
}