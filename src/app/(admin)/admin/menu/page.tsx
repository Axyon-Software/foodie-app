// src/app/(admin)/admin/menu/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
    Utensils, Plus, Search, ChevronLeft, MoreVertical, 
    Edit2, Trash2, ToggleLeft, ToggleRight, Star, Percent,
    GripVertical, Folder
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getRestaurantMenu, toggleProductAvailability, toggleProductPopular, setProductPromotion, deleteProduct } from '@/actions/menu-actions';
import { getCategories, createCategory, deleteCategory } from '@/actions/menu-actions';
import { Product, MenuCategory, ProductCategory } from '@/types/menu-management.types';

export default function MenuPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        const loadMenu = async () => {
            const result = await getRestaurantMenu();
            if (result.data) {
                setCategories(result.data.categories);
                setProducts(result.data.products);
            }
            setIsLoading(false);
        };
        loadMenu();
    }, []);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleToggleAvailability = async (productId: string, current: boolean) => {
        const result = await toggleProductAvailability(productId, !current);
        if (result.success) {
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, isAvailable: !current } : p));
            toast.success(!current ? 'Produto disponível' : 'Produto indisponível');
        } else {
            toast.error(result.error || 'Erro ao atualizar');
        }
    };

    const handleTogglePopular = async (productId: string, current: boolean) => {
        const result = await toggleProductPopular(productId, !current);
        if (result.success) {
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, isPopular: !current } : p));
        }
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        
        const result = await deleteProduct(productId);
        if (result.success) {
            setProducts(prev => prev.filter(p => p.id !== productId));
            toast.success('Produto excluído');
        } else {
            toast.error(result.error || 'Erro ao excluir');
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        
        const result = await createCategory({ name: newCategoryName });
        if (result.data) {
            setCategories(prev => [...prev, result.data!]);
            setNewCategoryName('');
            setShowCategoryModal(false);
            toast.success('Categoria criada');
        } else {
            toast.error(result.error || 'Erro ao criar');
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!confirm('Excluir esta categoria e todos os seus produtos?')) return;
        
        const result = await deleteCategory(categoryId);
        if (result.success) {
            setCategories(prev => prev.filter(c => c.id !== categoryId));
            setProducts(prev => prev.filter(p => p.categoryId !== categoryId));
            toast.success('Categoria excluída');
        }
    };

    const getProductsByCategory = (categoryId: string) => 
        filteredProducts.filter(p => p.categoryId === categoryId);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A082]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg)' }}>
            {/* Header */}
            <div className="p-4 border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 -ml-2">
                            <ChevronLeft size={20} style={{ color: 'var(--color-text)' }} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-[#00A082]/10 flex items-center justify-center">
                            <Utensils size={20} className="text-[#00A082]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Cardápio</h1>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {products.length} produto{products.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <Link href="/admin/menu/new">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00A082] text-white font-medium">
                            <Plus size={18} />
                            Novo
                        </button>
                    </Link>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-tertiary)' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar produtos..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none"
                        style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="p-4 pb-2">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${!selectedCategory ? 'bg-[#00A082] text-white' : ''}`}
                        style={{ backgroundColor: !selectedCategory ? '#00A082' : 'var(--color-bg-card)', color: !selectedCategory ? 'white' : 'var(--color-text-secondary)' }}
                    >
                        Todos
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 ${selectedCategory === cat.id ? 'bg-[#00A082] text-white' : ''}`}
                            style={{ backgroundColor: selectedCategory === cat.id ? '#00A082' : 'var(--color-bg-card)', color: selectedCategory === cat.id ? 'white' : 'var(--color-text-secondary)' }}
                        >
                            {cat.name}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                                className="ml-1 p-0.5 rounded hover:bg-red-500/20"
                            >
                                <Trash2 size={12} />
                            </button>
                        </button>
                    ))}
                    <button
                        onClick={() => setShowCategoryModal(true)}
                        className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border-2 border-dashed"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                    >
                        + Categoria
                    </button>
                </div>
            </div>

            {/* Products List */}
            <div className="p-4 space-y-4">
                {categories.length === 0 ? (
                    <div className="text-center py-12">
                        <Utensils size={48} className="mx-auto mb-4 text-gray-300" />
                        <p style={{ color: 'var(--color-text-secondary)' }}>Nenhum produto ainda</p>
                        <Link href="/admin/menu/new">
                            <button className="mt-4 px-6 py-2 bg-[#00A082] text-white rounded-full font-medium">
                                Adicionar Produto
                            </button>
                        </Link>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <Search size={48} className="mx-auto mb-4 text-gray-300" />
                        <p style={{ color: 'var(--color-text-secondary)' }}>Nenhum produto encontrado</p>
                    </div>
                ) : (
                    categories.map(category => {
                        const categoryProducts = getProductsByCategory(category.id);
                        if (categoryProducts.length === 0) return null;
                        
                        return (
                            <div key={category.id}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold" style={{ color: 'var(--color-text)' }}>
                                        {category.name}
                                    </h3>
                                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                        {categoryProducts.length} itens
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {categoryProducts.map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="flex gap-3 p-3 rounded-2xl"
                                            style={{ backgroundColor: 'var(--color-bg-card)' }}
                                        >
                                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
                                                {product.image ? (
                                                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                        <Utensils size={20} className="text-gray-400" />
                                                    </div>
                                                )}
                                                {product.isPromotional && (
                                                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
                                                        <Percent size={10} className="inline" /> PROMO
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-medium truncate" style={{ color: 'var(--color-text)' }}>
                                                                {product.name}
                                                            </span>
                                                            {product.isPopular && (
                                                                <Star size={12} className="text-yellow-500 fill-yellow-500 shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm truncate mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                                                            {product.description}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleToggleAvailability(product.id, product.isAvailable)}
                                                            className="p-1.5 rounded-lg"
                                                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                                                        >
                                                            {product.isAvailable ? (
                                                                <ToggleRight size={18} className="text-green-500" />
                                                            ) : (
                                                                <ToggleLeft size={18} className="text-gray-400" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => router.push(`/admin/menu/${product.id}`)}
                                                            className="p-1.5 rounded-lg"
                                                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                                                        >
                                                            <MoreVertical size={18} style={{ color: 'var(--color-text-secondary)' }} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {product.isPromotional ? (
                                                        <>
                                                            <span className="font-bold text-red-500">
                                                                R$ {product.promotionalPrice?.toFixed(2)}
                                                            </span>
                                                            <span className="text-sm line-through" style={{ color: 'var(--color-text-tertiary)' }}>
                                                                R$ {product.price.toFixed(2)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="font-bold" style={{ color: 'var(--color-text)' }}>
                                                            R$ {product.price.toFixed(2)}
                                                        </span>
                                                    )}
                                                    {!product.isAvailable && (
                                                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
                                                            Indisponível
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-sm rounded-2xl p-4"
                        style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                        <h3 className="font-bold mb-4" style={{ color: 'var(--color-text)' }}>Nova Categoria</h3>
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nome da categoria"
                            className="w-full px-4 py-3 rounded-xl mb-4 outline-none"
                            style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCategoryModal(false)}
                                className="flex-1 py-3 rounded-xl font-medium"
                                style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddCategory}
                                className="flex-1 py-3 rounded-xl font-medium bg-[#00A082] text-white"
                            >
                                Criar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}