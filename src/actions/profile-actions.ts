// src/actions/profile-actions.ts
'use server';

import { createClient } from '@/lib/supabase/client';
import { UserPrivacySettings, UserPreferences, SavedAddressProfile } from '@/types/user-profile.types';

export async function getUserPrivacySettings(): Promise<{ data?: UserPrivacySettings; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Usuário não autenticado' };
        }

        const { data, error } = await supabase
            .from('user_privacy_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            return { error: error.message };
        }

        if (!data) {
            const defaultSettings: UserPrivacySettings = {
                showProfile: true,
                showOrderHistory: true,
                allowMarketing: true,
                allowNotifications: true,
                dataSharing: false,
                twoFactorEnabled: false,
            };

            await supabase
                .from('user_privacy_settings')
                .insert({ user_id: user.id, ...defaultSettings });

            return { data: defaultSettings };
        }

        return { data };
    } catch (error) {
        console.error('Error fetching privacy settings:', error);
        return { error: 'Erro ao buscar configurações de privacidade' };
    }
}

export async function updateUserPrivacySettings(
    settings: Partial<UserPrivacySettings>
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Usuário não autenticado' };
        }

        const { error } = await supabase
            .from('user_privacy_settings')
            .update({
                ...settings,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);

        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating privacy settings:', error);
        return { error: 'Erro ao atualizar configurações de privacidade' };
    }
}

export async function getUserPreferences(): Promise<{ data?: UserPreferences; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Usuário não autenticado' };
        }

        const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            return { error: error.message };
        }

        if (!data) {
            const defaultPreferences: UserPreferences = {
                dietaryRestrictions: [],
                favoriteCuisines: [],
                notificationOrderUpdates: true,
                notificationPromotions: true,
                notificationNewsletter: true,
            };

            await supabase
                .from('user_preferences')
                .insert({ user_id: user.id, ...defaultPreferences });

            return { data: defaultPreferences };
        }

        return { data };
    } catch (error) {
        console.error('Error fetching preferences:', error);
        return { error: 'Erro ao buscar preferências' };
    }
}

export async function updateUserPreferences(
    preferences: Partial<UserPreferences>
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Usuário não autenticado' };
        }

        const { error } = await supabase
            .from('user_preferences')
            .update({
                ...preferences,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);

        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating preferences:', error);
        return { error: 'Erro ao atualizar preferências' };
    }
}

export async function getFavoriteRestaurants(): Promise<{ data?: string[]; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Usuário não autenticado' };
        }

        const { data, error } = await supabase
            .from('user_favorites')
            .select('restaurant_id')
            .eq('user_id', user.id);

        if (error) {
            return { error: error.message };
        }

        return { data: data?.map(f => f.restaurant_id) || [] };
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return { error: 'Erro ao buscar favoritos' };
    }
}

export async function addFavoriteRestaurant(
    restaurantId: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Usuário não autenticado' };
        }

        const { error } = await supabase
            .from('user_favorites')
            .insert({
                user_id: user.id,
                restaurant_id: restaurantId,
            });

        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error adding favorite:', error);
        return { error: 'Erro ao adicionar favorito' };
    }
}

export async function removeFavoriteRestaurant(
    restaurantId: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Usuário não autenticado' };
        }

        const { error } = await supabase
            .from('user_favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('restaurant_id', restaurantId);

        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error removing favorite:', error);
        return { error: 'Erro ao remover favorito' };
    }
}

export async function getUserAddresses(): Promise<{ data?: SavedAddressProfile[]; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Usuário não autenticado' };
        }

        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false });

        if (error) {
            return { error: error.message };
        }

        return { 
            data: data?.map(addr => ({
                id: addr.id,
                label: addr.label,
                street: addr.street,
                number: addr.number,
                complement: addr.complement,
                neighborhood: addr.neighborhood,
                city: addr.city,
                state: addr.state,
                zipCode: addr.zip_code,
                isDefault: addr.is_default,
                instructions: addr.instructions,
            })) || [] 
        };
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return { error: 'Erro ao buscar endereços' };
    }
}