// app/dashboard/page.tsx

import { Receipt, UtensilsCrossed, TrendingUp } from "lucide-react";

export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Visão Geral</h1>

            {/* Grid de Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* Card 1 */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 font-medium">Pedidos Hoje</h3>
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <Receipt className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-500 mt-2">Sua loja acabou de nascer!</p>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 font-medium">Itens no Cardápio</h3>
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                            <UtensilsCrossed className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-emerald-600 font-medium mt-2 cursor-pointer hover:underline">
                        + Adicionar primeiro item
                    </p>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 font-medium">Faturamento</h3>
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">R$ 0,00</p>
                    <p className="text-sm text-gray-500 mt-2">Vamos começar a vender!</p>
                </div>

            </div>

            {/* Seção de Dicas */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl p-8 text-white shadow-md">
                <h2 className="text-xl font-bold mb-2">Bem-vindo ao Foodie App! 🎉</h2>
                <p className="text-emerald-50 mb-4 max-w-2xl">
                    Seu painel de controle está pronto. O próximo passo é cadastrar suas categorias (ex: Lanches, Bebidas) e seus produtos para que seus clientes possam começar a fazer pedidos.
                </p>
                <button className="bg-white text-emerald-700 px-6 py-2 rounded-lg font-bold hover:bg-emerald-50 transition-colors">
                    Configurar meu Cardápio
                </button>
            </div>
        </div>
    );
}