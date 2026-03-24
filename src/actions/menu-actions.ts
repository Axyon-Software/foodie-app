// src/actions/menu-actions.ts
'use server';

import { createClient } from '@/lib/supabase/client';
import { CreateProductForm, CreateCategoryForm, Product, MenuCategory, ProductVariation, ProductAddon } from '@/types/menu-management.types';

export async function getRestaurantMenu(): Promise<{ data?: { categories: MenuCategory[]; products: Product[] }; error?: string }> {
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
            return { data: { categories: [], products: [] } };
        }

        const [categoriesResult, productsResult] = await Promise.all([
            supabase
                .from('menu_categories')
                .select('*')
                .eq('restaurant_id', restaurant.id)
                .order('order'),
            supabase
                .from('menu_items')
                .select('*')
                .eq('restaurant_id', restaurant.id)
                .order('name'),
        ]);

        return {
            data: {
                categories: (categoriesResult.data || []) as MenuCategory[],
                products: (productsResult.data || []) as Product[],
            },
        };
    } catch (error) {
        console.error('Error fetching menu:', error);
        return { error: 'Erro ao buscar cardápio' };
    }
}

export async function getCategories(): Promise<{ data?: MenuCategory[]; error?: string }> {
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
            .from('menu_categories')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('order');

        if (error) {
            return { error: error.message };
        }

        return { data: data || [] };
    } catch (error) {
        console.error('Error fetching categories:', error);
        return { error: 'Erro ao buscar categorias' };
    }
}

export async function createCategory(data: CreateCategoryForm): Promise<{ data?: MenuCategory; error?: string }> {
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

        const { data: category, error } = await supabase
            .from('menu_categories')
            .insert({
                restaurant_id: restaurant.id,
                name: data.name,
                description: data.description,
                order: data.order || 0,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            return { error: error.message };
        }

        return { data: category as MenuCategory };
    } catch (error) {
        console.error('Error creating category:', error);
        return { error: 'Erro ao criar categoria' };
    }
}

export async function updateCategory(
    categoryId: string,
    data: Partial<CreateCategoryForm>
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = createClient();

        const { error } = await supabase
            .from('menu_categories')
            .update({
                name: data.name,
                description: data.description,
                order: data.order,
                updated_at: new Date().toISOString(),
            })
            .eq('id', categoryId);

        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating category:', error);
        return { error: 'Erro ao atualizar categoria' };
    }
}

export async function deleteCategory(categoryId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = createClient();

        const { error } = await supabase
            .from('menu_categories')
            .delete()
            .eq('id', categoryId);

        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting category:', error);
        return { error: 'Erro ao excluir categoria' };
    }
}

export async function createProduct(data: CreateProductForm): Promise<{ data?: Product; error?: string }> {
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

        const { data: product, error } = await supabase
            .from('menu_items')
            .insert({
                restaurant_id: restaurant.id,
                category_id: data.categoryId,
                name: data.name,
                description: data.description,
                price: data.price,
                image: data.image || '',
                ingredients: data.ingredients,
                allergens: data.allergens,
                is_popular: data.isPopular,
                stock: data.stock || 0,
                stock_management: data.stockManagement,
                preparation_time: data.preparationTime || 15,
                calories: data.calories,
                is_active: true,
                is_available: true,
                is_promotional: false,
            })
            .select()
            .single();

        if (error) {
            return { error: error.message };
        }

        if (data.variations?.length) {
            for (const variation of data.variations) {
                const { data: varData, error: varError } = await supabase
                    .from('product_variations')
                    .insert({
                        product_id: product.id,
                        name: variation.name,
                        required: variation.required,
                        max_selections: variation.maxSelections,
                    })
                    .select()
                    .single();

                if (!varError && varData) {
                    await supabase.from('variation_options').insert(
                        variation.options.map(opt => ({
                            variation_id: varData.id,
                            name: opt.name,
                            price: opt.price,
                            is_available: true,
                        }))
                    );
                }
            }
        }

        if (data.addons?.length) {
            await supabase.from('product_addons').insert(
                data.addons.map(addon => ({
                    product_id: product.id,
                    name: addon.name,
                    price: addon.price,
                    is_available: true,
                }))
            );
        }

        return { data: product as Product };
    } catch (error) {
        console.error('Error creating product:', error);
        return { error: 'Erro ao criar produto' };
    }
}

export async function updateProduct(
    productId: string,
    data: Partial<Product>
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = createClient();

        const { error } = await supabase
            .from('menu_items')
            .update({
                name: data.name,
                description: data.description,
                price: data.price,
                image: data.image,
                ingredients: data.ingredients,
                allergens: data.allergens,
                is_popular: data.isPopular,
                is_active: data.isActive,
                is_available: data.isAvailable,
                is_promotional: data.isPromotional,
                promotional_price: data.promotionalPrice,
                promotional_start_date: data.promotionalStartDate,
                promotional_end_date: data.promotionalEndDate,
                stock: data.stock,
                stock_management: data.stockManagement,
                preparation_time: data.preparationTime,
                calories: data.calories,
                updated_at: new Date().toISOString(),
            })
            .eq('id', productId);

        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating product:', error);
        return { error: 'Erro ao atualizar produto' };
    }
}

export async function toggleProductAvailability(
    productId: string,
    isAvailable: boolean
): Promise<{ success?: boolean; error?: string }> {
    return updateProduct(productId, { isAvailable } as Partial<Product>);
}

export async function toggleProductPopular(
    productId: string,
    isPopular: boolean
): Promise<{ success?: boolean; error?: string }> {
    return updateProduct(productId, { isPopular } as Partial<Product>);
}

export async function setProductPromotion(
    productId: string,
    promotionalPrice: number,
    startDate?: string,
    endDate?: string
): Promise<{ success?: boolean; error?: string }> {
    return updateProduct(productId, {
        isPromotional: true,
        promotionalPrice,
        promotionalStartDate: startDate,
        promotionalEndDate: endDate,
    } as Partial<Product>);
}

export async function removeProductPromotion(
    productId: string
): Promise<{ success?: boolean; error?: string }> {
    return updateProduct(productId, {
        isPromotional: false,
        promotionalPrice: undefined,
        promotionalStartDate: undefined,
        promotionalEndDate: undefined,
    } as Partial<Product>);
}

export async function deleteProduct(productId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = createClient();

        await supabase.from('product_variations').delete().eq('product_id', productId);
        await supabase.from('product_addons').delete().eq('product_id', productId);

        const { error } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', productId);

        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting product:', error);
        return { error: 'Erro ao excluir produto' };
    }
}

export async function getProductVariations(productId: string): Promise<{ data?: ProductVariation[]; error?: string }> {
    try {
        const supabase = createClient();

        const { data: variations, error } = await supabase
            .from('product_variations')
            .select('*')
            .eq('product_id', productId);

        if (error) {
            return { error: error.message };
        }

        const variationsWithOptions = await Promise.all(
            (variations || []).map(async (v) => {
                const { data: options } = await supabase
                    .from('variation_options')
                    .select('*')
                    .eq('variation_id', v.id);

                return { ...v, options: options || [] };
            })
        );

        return { data: variationsWithOptions as ProductVariation[] };
    } catch (error) {
        console.error('Error fetching variations:', error);
        return { error: 'Erro ao buscar variações' };
    }
}

export async function getProductAddons(productId: string): Promise<{ data?: ProductAddon[]; error?: string }> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('product_addons')
            .select('*')
            .eq('product_id', productId);

        if (error) {
            return { error: error.message };
        }

        return { data: data || [] };
    } catch (error) {
        console.error('Error fetching addons:', error);
        return { error: 'Erro ao buscar adicionais' };
    }
}
