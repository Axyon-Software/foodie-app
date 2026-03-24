'use client'

import { useKitchenOrders, Order, OrderStatus } from '@/hooks/useKitchenOrders'
import { updateOrderStatus } from '@/actions/orders'
import { useState } from 'react'
import { Clock, ChefHat, Package, CheckCircle } from 'lucide-react'

// Tipo para o groupedOrders
type GroupedOrders = {
    [key in OrderStatus]?: Order[]
}

type Props = {
    restaurantId: string
}

const COLUMNS: Array<{
    id: OrderStatus
    title: string
    color: string
    icon: typeof Clock
    nextAction: string
    nextStatus: OrderStatus
}> = [
    {
        id: 'PENDING',
        title: '🔔 Novos Pedidos',
        color: 'bg-amber-50 border-amber-200',
        icon: Clock,
        nextAction: 'Aceitar',
        nextStatus: 'PREPARING'
    },
    {
        id: 'PREPARING',
        title: '👨‍🍳 Em Preparo',
        color: 'bg-blue-50 border-blue-200',
        icon: ChefHat,
        nextAction: 'Marcar Pronto',
        nextStatus: 'READY'
    },
    {
        id: 'READY',
        title: '📦 Prontos',
        color: 'bg-emerald-50 border-emerald-200',
        icon: Package,
        nextAction: 'Entregue',
        nextStatus: 'DELIVERED'
    }
]

interface OrderCardProps {
    order: Order
    onMove: () => void
    moveLabel: string
    isUpdating: boolean
}

export function KanbanBoard({ restaurantId }: Props) {
    const { orders, refresh } = useKitchenOrders(restaurantId)
    const [updating, setUpdating] = useState<string | null>(null)

    const handleMove = async (orderId: string, newStatus: OrderStatus) => {
        setUpdating(orderId)
        try {
            await updateOrderStatus({ orderId, newStatus, restaurantId })
            refresh()
        } catch (error) {
            alert('Erro ao mover pedido')
        } finally {
            setUpdating(null)
        }
    }

    const groupedOrders: GroupedOrders = {
        PENDING: orders.filter(o => o.status === 'PENDING'),
        CONFIRMED: orders.filter(o => o.status === 'CONFIRMED'),
        PREPARING: orders.filter(o => o.status === 'PREPARING'),
        READY: orders.filter(o => o.status === 'READY'),
        DELIVERED: orders.filter(o => o.status === 'DELIVERED'),
        CANCELLED: orders.filter(o => o.status === 'CANCELLED')
    }

    const getOrdersByStatus = (status: OrderStatus): Order[] => {
        return groupedOrders[status] || []
    }

    return (
        <div className="h-screen bg-gray-100 p-4 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Cozinha Digital</h1>
                    <p className="text-sm text-gray-500">Clique para mover pedidos</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => document.documentElement.requestFullscreen()}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                    >
                        Tela Cheia
                    </button>
                </div>
            </div>

            {/* Board */}
            <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
                {COLUMNS.map((col) => {
                    const columnOrders = getOrdersByStatus(col.id)

                    return (
                        <div
                            key={col.id}
                            className={`${col.color} rounded-xl border-2 flex flex-col h-full`}
                        >
                            {/* Column Header */}
                            <div className="p-4 border-b border-inherit flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <col.icon className="w-5 h-5" />
                                    <h2 className="font-bold text-gray-800">{col.title}</h2>
                                </div>
                                <span className="bg-white px-2 py-1 rounded-full text-sm font-bold text-gray-600">
                                    {columnOrders.length}
                                </span>
                            </div>

                            {/* Orders List */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {columnOrders.map((order) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        onMove={() => handleMove(order.id, col.nextStatus)}
                                        moveLabel={col.nextAction}
                                        isUpdating={updating === order.id}
                                    />
                                ))}

                                {columnOrders.length === 0 && (
                                    <div className="text-center text-gray-400 py-8 italic">
                                        Nenhum pedido aqui
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function OrderCard({ order, onMove, moveLabel, isUpdating }: OrderCardProps) {
    const tempoEspera = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
    const atrasado = tempoEspera > 30

    return (
        <div className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${
            atrasado ? 'border-red-500 animate-pulse' : 'border-gray-300'
        } hover:shadow-md transition-shadow`}>
            {/* Header do Card */}
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-xs font-bold text-gray-500">#{order.id.slice(-6)}</span>
                    <h3 className="font-bold text-gray-800">{order.customerName}</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                    order.orderType === 'DINE_IN' ? 'bg-purple-100 text-purple-700' :
                        order.orderType === 'DELIVERY' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                }`}>
                    {order.orderType === 'DINE_IN' ? `Mesa ${order.tableNumber}` :
                        order.orderType === 'DELIVERY' ? 'Delivery' : 'Retirada'}
                </span>
            </div>

            {/* Tempo de espera */}
            <div className={`text-sm mb-3 flex items-center gap-1 ${
                atrasado ? 'text-red-600 font-bold' : 'text-gray-500'
            }`}>
                <Clock className="w-4 h-4" />
                {tempoEspera} min
                {atrasado && <span className="text-xs">(Atrasado!)</span>}
            </div>

            {/* Itens */}
            <div className="space-y-1 mb-3">
                {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="text-sm text-gray-700 flex justify-between">
                        <span>{item.qty}x {item.name}</span>
                        <span className="text-gray-500">R$ {item.price.toFixed(2)}</span>
                    </div>
                ))}
            </div>

            {/* Observações */}
            {order.items.some((i: any) => i.notes) && (
                <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 mb-3">
                    <strong>Obs:</strong> {order.items.map((i: any) => i.notes).filter(Boolean).join(', ')}
                </div>
            )}

            {/* Total */}
            <div className="border-t pt-2 flex justify-between items-center font-bold text-gray-800">
                <span>Total</span>
                <span>R$ {order.total.toFixed(2)}</span>
            </div>

            {/* Botão de Ação */}
            <button
                onClick={onMove}
                disabled={isUpdating}
                className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300
                   text-white py-2 rounded-lg font-medium transition-colors flex items-center
                   justify-center gap-2"
            >
                {isUpdating ? (
                    <span className="animate-spin">⏳</span>
                ) : (
                    <>
                        {moveLabel}
                        <CheckCircle className="w-4 h-4" />
                    </>
                )}
            </button>
        </div>
    )
}