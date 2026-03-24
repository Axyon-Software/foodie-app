// src/app/(admin)/admin/menu/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, Loader2, Save, Upload, X, Plus, Trash2, 
    Percent, Clock, AlertTriangle, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { getCategories, createProduct } from '@/actions/menu-actions';
import { MenuCategory, CreateVariation, CreateAddon, ALLERGEN_OPTIONS } from '@/types/menu-management.types';

export default function NewProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    
    const [formData, setFormData] = useState({
        categoryId: '',
        name: '',
        description: '',
        price: '',
        image: '',
        ingredients: '',
        allergens: [] as string[],
        isPopular: false,
        stockManagement: false,
        stock: '',
        preparationTime: '15',
        calories: '',
    });

    const [variations, setVariations] = useState<CreateVariation[]>([]);
    const [addons, setAddons] = useState<CreateAddon[]>([]);
    const [isPromotional, setIsPromotional] = useState(false);
    const [promotionalPrice, setPromotionalPrice] = useState('');

    useEffect(() => {
        const loadCategories = async () => {
            const result = await getCategories();
            if (result.data && result.data.length > 0) {
                setCategories(result.data);
                setFormData(prev => ({ ...prev, categoryId: result.data![0].id }));
            }
            setIsLoading(false);
        };
        loadCategories();
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAllergenToggle = (allergen: string) => {
        setFormData(prev => ({
            ...prev,
            allergens: prev.allergens.includes(allergen)
                ? prev.allergens.filter(a => a !== allergen)
                : [...prev.allergens, allergen]
        }));
    };

    const handleAddVariation = () => {
        setVariations(prev => [...prev, {
            name: '',
            options: [{ name: '', price: 0 }],
            required: false,
            maxSelections: 1
        }]);
    };

    const handleVariationChange = (index: number, field: keyof CreateVariation, value: any) => {
        setVariations(prev => prev.map((v, i) => 
            i === index ? { ...v, [field]: value } : v
        ));
    };

    const handleOptionChange = (varIndex: number, optIndex: number, field: string, value: any) => {
        setVariations(prev => prev.map((v, i) => {
            if (i !== varIndex) return v;
            const newOptions = [...v.options];
            newOptions[optIndex] = { ...newOptions[optIndex], [field]: value };
            return { ...v, options: newOptions };
        }));
    };

    const handleAddOption = (varIndex: number) => {
        setVariations(prev => prev.map((v, i) => {
            if (i !== varIndex) return v;
            return { ...v, options: [...v.options, { name: '', price: 0 }] };
        }));
    };

    const handleRemoveOption = (varIndex: number, optIndex: number) => {
        setVariations(prev => prev.map((v, i) => {
            if (i !== varIndex) return v;
            return { ...v, options: v.options.filter((_, oi) => oi !== optIndex) };
        }));
    };

    const handleRemoveVariation = (index: number) => {
        setVariations(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddAddon = () => {
        setAddons(prev => [...prev, { name: '', price: 0 }]);
    };

    const handleAddonChange = (index: number, field: keyof CreateAddon, value: any) => {
        setAddons(prev => prev.map((a, i) => 
            i === index ? { ...a, [field]: value } : a
        ));
    };

    const handleRemoveAddon = (index: number) => {
        setAddons(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.categoryId) {
            toast.error('Selecione uma categoria');
            return;
        }
        if (!formData.name.trim()) {
            toast.error('Nome do produto é obrigatório');
            return;
        }
        if (!formData.price) {
            toast.error('Preço é obrigatório');
            return;
        }

        setIsSaving(true);

        const validVariations = variations.filter(v => v.name && v.options.some(o => o.name));
        const validAddons = addons.filter(a => a.name);

        const result = await createProduct({
            categoryId: formData.categoryId,
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            image: formData.image,
            ingredients: formData.ingredients,
            allergens: formData.allergens,
            isPopular: formData.isPopular,
            stock: formData.stock ? parseInt(formData.stock) : 0,
            stockManagement: formData.stockManagement,
            preparationTime: parseInt(formData.preparationTime) || 15,
            calories: formData.calories ? parseInt(formData.calories) : undefined,
            variations: validVariations,
            addons: validAddons,
        });

        if (result.data) {
            toast.success('Produto criado com sucesso!');
            router.push('/admin/menu');
        } else {
            toast.error(result.error || 'Erro ao criar produto');
        }

        setIsSaving(false);
    };

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
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2">
                        <ChevronLeft size={20} style={{ color: 'var(--color-text)' }} />
                    </button>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                        Novo Produto
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">
                {/* Categoria */}
                <section>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>CATEGORIA *</h2>
                    {categories.length === 0 ? (
                        <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                            <p style={{ color: 'var(--color-text-secondary)' }}>Crie uma categoria primeiro</p>
                            <button type="button" onClick={() => router.push('/admin/menu')} className="mt-2 text-[#00A082]">
                                Voltar ao menu
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleChange('categoryId', cat.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium ${formData.categoryId === cat.id ? 'bg-[#00A082] text-white' : ''}`}
                                    style={{ 
                                        backgroundColor: formData.categoryId === cat.id ? '#00A082' : 'var(--color-bg-card)',
                                        color: formData.categoryId === cat.id ? 'white' : 'var(--color-text-secondary)'
                                    }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Imagem */}
                <section>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>FOTO</h2>
                    <div 
                        className="w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                        style={{ borderColor: formData.image ? 'transparent' : 'var(--color-border)' }}
                    >
                        {formData.image ? (
                            <div className="relative w-full h-full">
                                <img src={formData.image} alt="Product" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleChange('image', '')}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Upload size={32} style={{ color: 'var(--color-text-tertiary)' }} />
                                <span className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>URL da imagem</span>
                            </>
                        )}
                    </div>
                    <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => handleChange('image', e.target.value)}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="w-full mt-2 px-4 py-2 rounded-xl outline-none"
                        style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                    />
                </section>

                {/* Informações Básicas */}
                <section>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>INFORMAÇÕES</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text)' }}>Nome *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Ex: Hambúrguer Artesanal"
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text)' }}>Descrição</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Descreva o produto..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text)' }}>Preço *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-secondary)' }}>R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => handleChange('price', e.target.value)}
                                        placeholder="0,00"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                        style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text)' }}>Tempo (min)</label>
                                <div className="relative">
                                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-secondary)' }} />
                                    <input
                                        type="number"
                                        value={formData.preparationTime}
                                        onChange={(e) => handleChange('preparationTime', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                                        style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Opções */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>OPÇÕES</h2>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isPopular}
                                onChange={(e) => handleChange('isPopular', e.target.checked)}
                                className="w-4 h-4 rounded text-[#00A082]"
                            />
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Produto popular</span>
                        </label>
                    </div>
                    
                    <div className="p-4 rounded-xl space-y-4" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                        <div>
                            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text)' }}>Ingredientes</label>
                            <textarea
                                value={formData.ingredients}
                                onChange={(e) => handleChange('ingredients', e.target.value)}
                                placeholder="Liste os ingredientes..."
                                rows={2}
                                className="w-full px-4 py-2 rounded-xl outline-none"
                                style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                            />
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                <AlertTriangle size={16} className="text-yellow-500" />
                                Alergênicos
                            </label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {ALLERGEN_OPTIONS.map(allergen => (
                                    <button
                                        key={allergen}
                                        type="button"
                                        onClick={() => handleAllergenToggle(allergen)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${formData.allergens.includes(allergen) ? 'bg-yellow-500 text-white' : ''}`}
                                        style={{ 
                                            backgroundColor: formData.allergens.includes(allergen) ? '#EAB308' : 'var(--color-bg-secondary)',
                                            color: formData.allergens.includes(allergen) ? 'white' : 'var(--color-text-secondary)'
                                        }}
                                    >
                                        {allergen}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text)' }}>Calorias (opcional)</label>
                            <input
                                type="number"
                                value={formData.calories}
                                onChange={(e) => handleChange('calories', e.target.value)}
                                placeholder="kcal"
                                className="w-full px-4 py-2 rounded-xl outline-none"
                                style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                            />
                        </div>
                    </div>
                </section>

                {/* Variações */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>VARIAÇÕES</h2>
                        <button type="button" onClick={handleAddVariation} className="text-[#00A082] text-sm font-medium flex items-center gap-1">
                            <Plus size={16} /> Adicionar
                        </button>
                    </div>
                    <div className="space-y-3">
                        {variations.map((variation, vIndex) => (
                            <div key={vIndex} className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={variation.name}
                                        onChange={(e) => handleVariationChange(vIndex, 'name', e.target.value)}
                                        placeholder="Ex: Tamanho"
                                        className="flex-1 px-3 py-2 rounded-lg outline-none text-sm"
                                        style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                    />
                                    <label className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                        <input
                                            type="checkbox"
                                            checked={variation.required}
                                            onChange={(e) => handleVariationChange(vIndex, 'required', e.target.checked)}
                                            className="w-3 h-3 rounded"
                                        />
                                        Obrigatório
                                    </label>
                                    <button type="button" onClick={() => handleRemoveVariation(vIndex)} className="p-1 text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {variation.options.map((option, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={option.name}
                                                onChange={(e) => handleOptionChange(vIndex, oIndex, 'name', e.target.value)}
                                                placeholder="Opção"
                                                className="flex-1 px-3 py-1.5 rounded-lg outline-none text-sm"
                                                style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                            />
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={option.price}
                                                onChange={(e) => handleOptionChange(vIndex, oIndex, 'price', parseFloat(e.target.value) || 0)}
                                                placeholder="+R$ 0"
                                                className="w-20 px-2 py-1.5 rounded-lg outline-none text-sm"
                                                style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                            />
                                            {variation.options.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveOption(vIndex, oIndex)} className="p-1 text-red-500">
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => handleAddOption(vIndex)} className="text-xs text-[#00A082]">
                                        + Adicionar opção
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Adicionais */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>ADICIONAIS</h2>
                        <button type="button" onClick={handleAddAddon} className="text-[#00A082] text-sm font-medium flex items-center gap-1">
                            <Plus size={16} /> Adicionar
                        </button>
                    </div>
                    <div className="space-y-2">
                        {addons.map((addon, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                                <input
                                    type="text"
                                    value={addon.name}
                                    onChange={(e) => handleAddonChange(index, 'name', e.target.value)}
                                    placeholder="Ex: Bacon"
                                    className="flex-1 px-3 py-2 rounded-lg outline-none text-sm"
                                    style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={addon.price}
                                    onChange={(e) => handleAddonChange(index, 'price', parseFloat(e.target.value) || 0)}
                                    placeholder="+R$ 0"
                                    className="w-24 px-3 py-2 rounded-lg outline-none text-sm"
                                    style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                                />
                                <button type="button" onClick={() => handleRemoveAddon(index)} className="p-2 text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSaving || categories.length === 0}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-semibold transition-colors disabled:opacity-50"
                        style={{ backgroundColor: '#00A082', color: 'white' }}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Criar Produto
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}