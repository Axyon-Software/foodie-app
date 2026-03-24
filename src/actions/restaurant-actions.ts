// src/actions/restaurant-actions.ts
'use server';

import { createClient } from '@/lib/supabase/client';
import { CreateRestaurantForm, RestaurantProfile, RestaurantTable, BankInfo, RestaurantStatus, OperatingHours } from '@/types/restaurant-management.types';

export async function getRestaurantProfile(): Promise<{ data?: RestaurantProfile; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Usuário não autenticado' };
        }

        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) {
            return { error: error.message };
        }

        return { data };
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        return { error: 'Erro ao buscar restaurante' };
    }
}

export async function createRestaurant(data: CreateRestaurantForm): Promise<{ data?: RestaurantProfile; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Usuário não autenticado' };
        }

        const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const { data: restaurant, error } = await supabase
            .from('restaurants')
            .insert({
                user_id: user.id,
                name: data.name,
                slug,
                description: data.description,
                category: data.category,
                cuisine: data.cuisine,
                phone: data.phone,
                email: data.email,
                street: data.street,
                number: data.number,
                complement: data.complement,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                zip_code: data.zipCode,
                latitude: data.latitude || 0,
                longitude: data.longitude || 0,
                delivery_fee: data.deliveryFee,
                minimum_order: data.minimumOrder,
                estimated_delivery_time: data.estimatedDeliveryTime,
                status: 'CLOSED',
            })
            .select()
            .single();

        if (error) {
            return { error: error.message };
        }

        return { data: restaurant };
    } catch (error) {
        console.error('Error creating restaurant:', error);
        return { error: 'Erro ao criar restaurante' };
    }
}

export async function updateRestaurantProfile(
    data: Partial<RestaurantProfile>
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Usuário não autenticado' };
        }

        const { error } = await supabase
            .from('restaurants')
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);

        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating restaurant:', error);
        return { error: 'Erro ao atualizar restaurante' };
    }
}

export async function updateRestaurantStatus(
    status: RestaurantStatus
): Promise<{ success?: boolean; error?: string }> {
    return updateRestaurantProfile({ status });
}

export async function updateOperatingHours(
    hours: OperatingHours[]
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Usuário não autenticado' };
        }

        const { error } = await supabase
            .from('restaurants')
            .update({
                operating_hours: hours,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);

        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating hours:', error);
        return { error: 'Erro ao atualizar horário de funcionamento' };
    }
}

export async function getTables(): Promise<{ data?: RestaurantTable[]; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Usuário não autenticado' };
        }

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!restaurant) {
            return { data: [] };
        }

        const { data, error } = await supabase
            .from('restaurant_tables')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('number');

        if (error) {
            return { error: error.message };
        }

        return { data: data || [] };
    } catch (error) {
        console.error('Error fetching tables:', error);
        return { error: 'Erro ao buscar mesas' };
    }
}

export async function createTable(
    data: Omit<RestaurantTable, 'id'>
): Promise<{ data?: RestaurantTable; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Usuário não autenticado' };
        }

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!restaurant) {
            return { error: 'Restaurante não encontrado' };
        }

        const { data: table, error } = await supabase
            .from('restaurant_tables')
            .insert({
                ...data,
                restaurant_id: restaurant.id,
            })
            .select()
            .single();

        if (error) {
            return { error: error.message };
        }

        return { data: table };
    } catch (error) {
        console.error('Error creating table:', error);
        return { error: 'Erro ao criar mesa' };
    }
}

export async function updateTableStatus(
    tableId: string,
    status: RestaurantTable['status']
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = createClient();

        const { error } = await supabase
            .from('restaurant_tables')
            .update({ status })
            .eq('id', tableId);

        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating table:', error);
        return { error: 'Erro ao atualizar mesa' };
    }
}

export async function deleteTable(tableId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = createClient();

        const { error } = await supabase
            .from('restaurant_tables')
            .delete()
            .eq('id', tableId);

        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting table:', error);
        return { error: 'Erro ao excluir mesa' };
    }
}

export async function updateBankInfo(
    info: BankInfo
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Usuário não autenticado' };
        }

        const { error } = await supabase
            .from('restaurants')
            .update({
                bank_info: info,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);

        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating bank info:', error);
        return { error: 'Erro ao atualizar informações bancárias' };
    }
}

export async function getRestaurantReviews(
    restaurantId: string
): Promise<{ data?: any[]; error?: string }> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            return { error: error.message };
        }

        return { data: data || [] };
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return { error: 'Erro ao buscar avaliações' };
    }
}

export async function respondToReview(
    reviewId: string,
    response: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = createClient();

        const { error } = await supabase
            .from('reviews')
            .update({
                response,
                responded_at: new Date().toISOString(),
            })
            .eq('id', reviewId);

        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error responding to review:', error);
        return { error: 'Erro ao responder avaliação' };
    }
}