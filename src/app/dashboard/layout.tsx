// app/dashboard/layout.tsx

import Link from "next/link";
import {
    LayoutDashboard,
    UtensilsCrossed,
    Receipt,
    Settings,
    Store
} from "lucide-react";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Menu Lateral (Sidebar) */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                {/* Logo / Header da Sidebar */}
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <Store className="w-6 h-6 text-emerald-600 mr-2" />
                    <span className="font-bold text-lg text-gray-900">Foodie Admin</span>
                </div>

                {/* Links de Navegação */}
                <nav className="flex-1 p-4 space-y-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-md font-medium transition-colors"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Visão Geral
                    </Link>

                    <Link
                        href="/dashboard/menu"
                        className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md font-medium transition-colors"
                    >
                        <UtensilsCrossed className="w-5 h-5" />
                        Cardápio
                    </Link>

                    <Link
                        href="/dashboard/orders"
                        className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md font-medium transition-colors"
                    >
                        <Receipt className="w-5 h-5" />
                        Pedidos
                    </Link>

                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md font-medium transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                        Configurações
                    </Link>
                </nav>

                {/* Footer da Sidebar (Perfil do usuário mockado por enquanto) */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                            R
                        </div>
                        <div className="text-sm">
                            <p className="font-medium text-gray-900">Restaurante</p>
                            <p className="text-gray-500 text-xs">Plano Grátis</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Área Principal (Onde o conteúdo das páginas vai aparecer) */}
            <main className="flex-1 overflow-y-auto">
                {/* Header do topo invisível só pra dar espaçamento se precisar, ou apenas o conteúdo */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}