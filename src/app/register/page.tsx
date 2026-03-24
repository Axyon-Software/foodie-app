// app/register/page.tsx

"use client";

import { useActionState } from "react"; // Se der erro na sua versão do Next, troque para: import { useFormState } from "react-dom";
import { registerRestaurant } from "@/actions/restaurantActions";
import { useFormStatus } from "react-dom";
import { Store, Link2, Loader2 } from "lucide-react";

// Componente do botão separado para ler o status de "Loading" do formulário
function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {pending ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Criando...
                </>
            ) : (
                "Criar meu Cardápio"
            )}
        </button>
    );
}

export default function RegisterPage() {
    const [state, formAction] = useActionState(registerRestaurant, {});
    // Atenção: Se usou useFormState acima, mude aqui também para useFormState

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Crie sua loja no Foodie
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Configure seu cardápio digital em segundos.
                    </p>
                </div>

                <form action={formAction} className="space-y-6">

                    {/* Se a Action retornar um erro, ele aparece aqui */}
                    {state?.error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {state.error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nome do Restaurante
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            placeholder="Ex: Burger King"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
                            Link Personalizado
                        </label>
                        <div className="flex items-center">
              <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm flex items-center gap-1">
                <Link2 className="w-4 h-4" />
              </span>
                            <input
                                type="text"
                                id="subdomain"
                                name="subdomain"
                                required
                                placeholder="burgerking"
                                className="w-full px-4 py-3 rounded-r-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Seu link será: <strong className="text-emerald-600">seu-nome.foodie.com</strong>
                        </p>
                    </div>

                    <SubmitButton />
                </form>
            </div>
        </div>
    );
}