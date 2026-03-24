// Arquivo: app/dashboard/menu/CategoryItem.tsx
"use client";

import { useState, useRef } from "react";
import { createProduct } from "@/actions/product";
import { GripVertical, Plus, X, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

// Botão com estado de carregamento pro formulário de produto
function SubmitProductButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 flex items-center justify-center min-w-[100px]"
        >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
        </button>
    );
}

// O componente recebe a categoria e seus produtos (se tiver)
export function CategoryItem({ category }: { category: any }) {
    const [isAdding, setIsAdding] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // Função que intercepta o envio do formulário
    async function handleAddProduct(formData: FormData) {
        formData.append("categoryId", category.id); // Injeta o ID da categoria no form
        await createProduct(formData);
        setIsAdding(false); // Fecha o form
        formRef.current?.reset(); // Limpa os campos
    }

    return (
        <li className="border-b border-gray-100 last:border-0 bg-white">
            {/* Cabeçalho da Categoria */}
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 group transition-colors">
                <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-gray-300 cursor-grab" />
                    <span className="font-bold text-gray-800 text-lg">{category.name}</span>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-sm text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-md hover:bg-emerald-100"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? "Cancelar" : "Adicionar Produto"}
                </button>
            </div>

            {/* Lista de Produtos já cadastrados nessa categoria */}
            {category.products && category.products.length > 0 && (
                <div className="px-12 pb-4 space-y-3">
                    {category.products.map((product: any) => (
                        <div key={product.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <h4 className="font-medium text-gray-900">{product.name}</h4>
                                <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                            </div>
                            <span className="font-semibold text-gray-900 bg-white px-2 py-1 rounded border border-gray-200 text-sm">
                R$ {product.price.toFixed(2).replace(".", ",")}
              </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Formulário Inline de Novo Produto (Só aparece se clicar em Adicionar) */}
            {isAdding && (
                <div className="px-12 pb-4">
                    <form ref={formRef} action={handleAddProduct} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                        <h4 className="font-medium text-gray-900 text-sm mb-2">Novo Produto em {category.name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Nome do produto (ex: X-Bacon)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <input
                                type="text"
                                name="price"
                                required
                                placeholder="Preço (ex: 29,90)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <textarea
                            name="description"
                            placeholder="Descrição (ex: Pão brioche, blend 160g, queijo prato, bacon crocante)"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                        />
                        <div className="flex justify-end">
                            <SubmitProductButton />
                        </div>
                    </form>
                </div>
            )}
        </li>
    );
}