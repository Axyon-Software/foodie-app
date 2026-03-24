// src/app/dashboard/orders/page.tsx
import { KanbanBoard } from '@/components/kitchen/KanbanBoard'
import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Receipt, Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import { OrderStatus } from '@prisma/client'

async function getRestaurantStats(restaurantId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = await prisma.order.findMany({
        where: {
            restaurant_id: restaurantId,
            created_at: { gte: today },
        },
        select: {
            total: true,
            status: true,
            created_at: true,
            ready_at: true,
            preparation_started_at: true,
        },
    })

    const pendingCount = await prisma.order.count({
        where: { restaurant_id: restaurantId, status: OrderStatus.PENDING },
    })

    const preparingCount = await prisma.order.count({
        where: { restaurant_id: restaurantId, status: OrderStatus.PREPARING },
    })

    const totalToday = todayOrders.length
    const revenueToday = todayOrders
        .filter(o => o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + o.total, 0)

    const completedOrders = todayOrders.filter(
        o => o.ready_at && o.preparation_started_at
    )
    const avgPrepTime =
        completedOrders.length > 0
            ? Math.round(
                completedOrders.reduce((sum, o) => {
                    const diff = (o.ready_at!.getTime() - o.preparation_started_at!.getTime()) / 60000
                    return sum + diff
                }, 0) / completedOrders.length
            )
            : 0

    return { totalToday, revenueToday, pendingCount, preparingCount, avgPrepTime }
}

export default async function OrdersPage() {
    const session = await getServerSession()

    if (!session?.user) {
        redirect('/sign-in')
    }

    const restaurant = await prisma.restaurant.findFirst({
        where: { user_id: session.user.id },
        select: { id: true, name: true }
    })

    if (!restaurant) {
        redirect('/register')
    }

    const stats = await getRestaurantStats(restaurant.id)

    return (
        <div>
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <Receipt className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-gray-500">Pedidos Hoje</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalToday}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-gray-500">Faturamento</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        R$ {stats.revenueToday.toFixed(2).replace('.', ',')}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            stats.pendingCount > 0
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-gray-50 text-gray-400'
                        }`}>
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-gray-500">Pendentes</span>
                    </div>
                    <p className={`text-2xl font-bold ${stats.pendingCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                        {stats.pendingCount}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-gray-500">Tempo Médio</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {stats.avgPrepTime > 0 ? `${stats.avgPrepTime} min` : '--'}
                    </p>
                </div>
            </div>

            {/* Kanban Board */}
            <KanbanBoard restaurantId={restaurant.id} />
        </div>
    )
}
