// src/actions/profileActions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { UserPrivacySettings, UserPreferences, SavedAddressProfile } from '@/types/user-profile.types'

// ============================================================================
// TIPOS
// ============================================================================

export interface ProfileData {
    id: string
    fullName: string
    email: string
    phone: string
    avatarUrl: string
    authProvider: string
    createdAt: string
}

// ============================================================================
// PERFIL BÁSICO
// ============================================================================

export async function getProfile(): Promise<{ data?: ProfileData; error?: string }> {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Usuário não autenticado' }
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profileError) {
        return { error: 'Erro ao carregar perfil' }
    }

    const authProvider = user.app_metadata?.provider || 'email'

    return {
        data: {
            id: user.id,
            fullName: profile.full_name || '',
            email: user.email || '',
            phone: profile.phone || '',
            avatarUrl: profile.avatar_url || '',
            authProvider,
            createdAt: user.created_at,
        },
    }
}

export async function getUserProfile() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Usuário não autenticado', data: null }
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) {
            return { error: error.message, data: null }
        }

        return { data, error: null }
    } catch (error) {
        console.error('Error fetching profile:', error)
        return { error: 'Erro ao buscar perfil', data: null }
    }
}

export async function updateProfile(formData: {
    fullName?: string
    full_name?: string
    phone?: string
    avatar_url?: string
}): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Usuário não autenticado' }
    }

    // Normalizar dados (aceita ambos os formatos)
    const fullName = formData.fullName || formData.full_name
    const updates: any = {}

    if (fullName) updates.full_name = fullName
    if (formData.phone) updates.phone = formData.phone
    if (formData.avatar_url) updates.avatar_url = formData.avatar_url

    updates.updated_at = new Date().toISOString()

    const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

    if (updateError) {
        return { error: 'Erro ao atualizar perfil' }
    }

    // Atualizar metadata do auth
    if (fullName) {
        await supabase.auth.updateUser({
            data: {
                full_name: fullName,
            },
        })
    }

    return { success: true }
}

export async function updateUserProfile(updates: {
    full_name?: string
    phone?: string
    avatar_url?: string
}) {
    return updateProfile(updates)
}

// ============================================================================
// CONFIGURAÇÕES DE PRIVACIDADE
// ============================================================================

export async function getUserPrivacySettings(): Promise<{ data?: UserPrivacySettings; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Usuário não autenticado' }
        }

        const { data, error } = await supabase
            .from('user_privacy_settings')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error && error.code !== 'PGRST116') {
            return { error: error.message }
        }

        if (!data) {
            const defaultSettings: UserPrivacySettings = {
                showProfile: true,
                showOrderHistory: true,
                allowMarketing: true,
                allowNotifications: true,
                dataSharing: false,
                twoFactorEnabled: false,
            }

            await supabase
                .from('user_privacy_settings')
                .insert({ user_id: user.id, ...defaultSettings })

            return { data: defaultSettings }
        }

        return { data }
    } catch (error) {
        console.error('Error fetching privacy settings:', error)
        return { error: 'Erro ao buscar configurações de privacidade' }
    }
}

export async function updateUserPrivacySettings(
    settings: Partial<UserPrivacySettings>
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Usuário não autenticado' }
        }

        const { error } = await supabase
            .from('user_privacy_settings')
            .update({
                ...settings,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error updating privacy settings:', error)
        return { error: 'Erro ao atualizar configurações de privacidade' }
    }
}

// ============================================================================
// PREFERÊNCIAS DO USUÁRIO
// ============================================================================

export async function getUserPreferences(): Promise<{ data?: UserPreferences; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Usuário não autenticado' }
        }

        const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error && error.code !== 'PGRST116') {
            return { error: error.message }
        }

        if (!data) {
            const defaultPreferences: UserPreferences = {
                dietaryRestrictions: [],
                favoriteCuisines: [],
                notificationOrderUpdates: true,
                notificationPromotions: true,
                notificationNewsletter: true,
            }

            await supabase
                .from('user_preferences')
                .insert({ user_id: user.id, ...defaultPreferences })

            return { data: defaultPreferences }
        }

        return { data }
    } catch (error) {
        console.error('Error fetching preferences:', error)
        return { error: 'Erro ao buscar preferências' }
    }
}

export async function updateUserPreferences(
    preferences: Partial<UserPreferences>
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Usuário não autenticado' }
        }

        const { error } = await supabase
            .from('user_preferences')
            .update({
                ...preferences,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error updating preferences:', error)
        return { error: 'Erro ao atualizar preferências' }
    }
}

// ============================================================================
// RESTAURANTES FAVORITOS
// ============================================================================

export async function getFavoriteRestaurants(): Promise<{ data?: string[]; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Usuário não autenticado' }
        }

        const { data, error } = await supabase
            .from('user_favorites')
            .select('restaurant_id')
            .eq('user_id', user.id)

        if (error) {
            return { error: error.message }
        }

        return { data: data?.map(f => f.restaurant_id) || [] }
    } catch (error) {
        console.error('Error fetching favorites:', error)
        return { error: 'Erro ao buscar favoritos' }
    }
}

export async function addFavoriteRestaurant(
    restaurantId: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Usuário não autenticado' }
        }

        const { error } = await supabase
            .from('user_favorites')
            .insert({
                user_id: user.id,
                restaurant_id: restaurantId,
            })

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error adding favorite:', error)
        return { error: 'Erro ao adicionar favorito' }
    }
}

export async function removeFavoriteRestaurant(
    restaurantId: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Usuário não autenticado' }
        }

        const { error } = await supabase
            .from('user_favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('restaurant_id', restaurantId)

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error removing favorite:', error)
        return { error: 'Erro ao remover favorito' }
    }
}

// ============================================================================
// ENDEREÇOS
// ============================================================================

export async function getUserAddresses(): Promise<{ data?: SavedAddressProfile[]; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Usuário não autenticado' }
        }

        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })

        if (error) {
            return { error: error.message }
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
        }
    } catch (error) {
        console.error('Error fetching addresses:', error)
        return { error: 'Erro ao buscar endereços' }
    }
}