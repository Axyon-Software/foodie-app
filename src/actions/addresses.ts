// src/actions/addresses.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export interface AddressData {
    id: string
    label: string
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    isDefault: boolean
    createdAt: string
}

export async function getAddresses(): Promise<{ data?: AddressData[]; error?: string }> {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Usuário não autenticado' }
    }

    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

    if (error) {
        return { error: 'Erro ao carregar endereços' }
    }

    const addresses: AddressData[] = (data || []).map((addr) => ({
        id: addr.id,
        label: addr.label,
        street: addr.street,
        number: addr.number,
        complement: addr.complement || '',
        neighborhood: addr.neighborhood,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zip_code,
        isDefault: addr.is_default,
        createdAt: addr.created_at,
    }))

    return { data: addresses }
}

export async function createAddress(formData: {
    label: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    isDefault?: boolean
}): Promise<{ data?: AddressData; error?: string }> {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        console.error('[createAddress] Erro de autenticação:', authError?.message)
        return { error: 'Usuário não autenticado' }
    }

    console.log('[createAddress] Usuário autenticado:', user.id, user.email)

    // If setting as default, unset other defaults first
    if (formData.isDefault) {
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id)
    }

    // Check if this is the first address (auto-set as default)
    const { count, error: countError } = await supabase
        .from('addresses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    console.log('[createAddress] Contagem de endereços:', count, 'Erro:', countError?.message)

    const isFirstAddress = (count || 0) === 0

    const insertData = {
        user_id: user.id,
        label: formData.label,
        street: formData.street,
        number: formData.number,
        complement: formData.complement || '',
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        is_default: formData.isDefault || isFirstAddress,
    }

    console.log('[createAddress] Tentando inserir:', JSON.stringify(insertData))

    const { data, error } = await supabase
        .from('addresses')
        .insert(insertData)
        .select()
        .single()

    if (error) {
        console.error('[createAddress] Erro detalhado:', JSON.stringify({
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        }))
        return { error: 'Erro ao salvar endereço' }
    }

    console.log('[createAddress] Endereço salvo com sucesso:', data.id)

    return {
        data: {
            id: data.id,
            label: data.label,
            street: data.street,
            number: data.number,
            complement: data.complement || '',
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            zipCode: data.zip_code,
            isDefault: data.is_default,
            createdAt: data.created_at,
        },
    }
}

export async function updateAddress(
    addressId: string,
    formData: {
        label: string
        street: string
        number: string
        complement?: string
        neighborhood: string
        city: string
        state: string
        zipCode: string
    }
): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Usuário não autenticado' }
    }

    const { error } = await supabase
        .from('addresses')
        .update({
            label: formData.label,
            street: formData.street,
            number: formData.number,
            complement: formData.complement || '',
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
        })
        .eq('id', addressId)
        .eq('user_id', user.id)

    if (error) {
        return { error: 'Erro ao atualizar endereço' }
    }

    return { success: true }
}

export async function deleteAddress(
    addressId: string
): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Usuário não autenticado' }
    }

    const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id)

    if (error) {
        return { error: 'Erro ao excluir endereço' }
    }

    return { success: true }
}

export async function setDefaultAddress(
    addressId: string
): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Usuário não autenticado' }
    }

    // Unset all defaults
    await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)

    // Set new default
    const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', user.id)

    if (error) {
        return { error: 'Erro ao definir endereço padrão' }
    }

    return { success: true }
}