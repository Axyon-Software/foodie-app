// src/app/dashboard/orders/page.tsx
import { KanbanBoard } from '@/components/kitchen/KanbanBoard'
import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma' // ✅ Importar prisma

export default async function OrdersPage() {
    const session = await getServerSession()

    // ✅ Se não tem sessão, redireciona para login
    if (!session?.user) {
        redirect('/sign-in')
    }

    // ✅ Busca o restaurante do usuário no banco
    const restaurant = await prisma.restaurant.findFirst({
        where: { owner_id: session.user.id },
        select: { id: true }
    })

    // ✅ Se o usuário não tem restaurante, redireciona (ou trata o erro)
    if (!restaurant) {
        // Opcional: redirecionar para /register ou mostrar mensagem
        redirect('/register')
    }

    // ✅ Agora você tem o restaurant.id para usar no Kanban
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Pedidos da Cozinha</h1>
            <KanbanBoard restaurantId={restaurant.id} />
        </div>
    )
}