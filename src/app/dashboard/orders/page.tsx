// src/app/dashboard/orders/page.tsx
import { KanbanBoard } from '@/components/kitchen/KanbanBoard'
import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function OrdersPage() {
    const session = await getServerSession()

    if (!session?.user) {
        redirect('/sign-in')
    }

    const restaurant = await prisma.restaurant.findFirst({
        where: { user_id: session.user.id }, // ✅ SNAKE_CASE
        select: { id: true }
    })

    if (!restaurant) {
        redirect('/register')
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Pedidos da Cozinha</h1>
            <KanbanBoard restaurantId={restaurant.id} />
        </div>
    )
}