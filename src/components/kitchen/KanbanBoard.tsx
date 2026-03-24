// src/components/kitchen/KanbanBoard.tsx
'use client'

import { useKitchenOrders, Order, OrderStatus } from '@/hooks/useKitchenOrders'
import { updateOrderStatus, cancelOrderByRestaurant, getOrdersForRestaurant, type OrderData, type OrderFilters } from '@/actions/orders'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Clock, ChefHat, Package, CheckCircle, Filter, Printer, X, Bell, Search, XCircle, ChevronDown } from 'lucide-react'
import { ORDER_STATUS_CONFIG, RESTAURANT_FILTER_OPTIONS } from '@/lib/constants/order.constants'
import { formatPrice } from '@/lib/utils/format.utils'
import { toast } from 'sonner'

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
        nextStatus: 'CONFIRMED'
    },
    {
        id: 'CONFIRMED',
        title: '✅ Confirmados',
        color: 'bg-green-50 border-green-200',
        icon: CheckCircle,
        nextAction: 'Iniciar Preparo',
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
    onCancel: () => void
    onPrint: () => void
    moveLabel: string
    isUpdating: boolean
}

export function KanbanBoard({ restaurantId }: Props) {
    const { orders, refresh } = useKitchenOrders(restaurantId)
    const [updating, setUpdating] = useState<string | null>(null)
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<OrderFilters>({})
    const [searchTerm, setSearchTerm] = useState('')
    const [notification, setNotification] = useState<{ orderId: string; customerName: string } | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
    }, [])

    // Listen for new orders notification
    useEffect(() => {
        const pendingOrders = orders.filter(o => o.status === 'PENDING')
        if (pendingOrders.length > 0 && notification === null) {
            const latest = pendingOrders[0]
            setNotification({ orderId: latest.id, customerName: latest.customerName })
            audioRef.current?.play().catch(() => {})
            toast.success(`🔔 Novo pedido #${latest.id.slice(-4)}!`, {
                description: `${latest.customerName} - ${latest.orderType === 'DINE_IN' ? 'Mesa ' + latest.tableNumber : 'Delivery'}`,
                duration: 5000,
            })
        }
    }, [orders])

    const handleMove = async (orderId: string, newStatus: OrderStatus) => {
        setUpdating(orderId)
        try {
            await updateOrderStatus({ orderId, newStatus, restaurantId })
            refresh()
            toast.success(`Pedido atualizado para ${ORDER_STATUS_CONFIG[newStatus]?.label || newStatus}`)
        } catch (error) {
            toast.error('Erro ao mover pedido')
        } finally {
            setUpdating(null)
        }
    }

    const handleCancel = async (orderId: string) => {
        const reason = prompt('Motivo do cancelamento:')
        if (!reason) return

        setUpdating(orderId)
        try {
            await cancelOrderByRestaurant({ orderId, restaurantId, reason })
            refresh()
            toast.success('Pedido cancelado')
        } catch (error) {
            toast.error('Erro ao cancelar pedido')
        } finally {
            setUpdating(null)
        }
    }

    const handlePrint = (order: Order) => {
        const printContent = `
COMANDA DE PEDIDO
================
Pedido: #${order.id.slice(-6)}
Data: ${new Date(order.createdAt).toLocaleString('pt-BR')}
Cliente: ${order.customerName}
Tipo: ${order.orderType === 'DINE_IN' ? `Mesa ${order.tableNumber}` : order.orderType === 'DELIVERY' ? 'Delivery' : 'Retirada'}

ITENS:
${order.items.map((item: any) => `  ${item.qty}x ${item.name} - R$ ${(item.price * item.qty).toFixed(2)}`).join('\n')}

${order.items.some((i: any) => i.notes) ? `OBS: ${order.items.map((i: any) => i.notes).filter(Boolean).join(', ')}` : ''}

----------------
TOTAL: R$ ${order.total.toFixed(2)}
================
        `.trim()

        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head><title>Comanda #${order.id.slice(-6)}</title>
                <style>
                    body { font-family: monospace; font-size: 14px; padding: 20px; }
                    pre { white-space: pre-wrap; }
                </style>
                </head>
                <body><pre>${printContent}</pre>
                <script>window.print(); window.close();</script>
                </body>
                </html>
            `)
            printWindow.document.close()
        }
    }

    // Filter and search
    const filteredOrders = orders.filter(order => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            const matchesSearch =
                order.id.toLowerCase().includes(term) ||
                order.customerName.toLowerCase().includes(term) ||
                order.items.some((i: any) => i.name?.toLowerCase().includes(term))
            if (!matchesSearch) return false
        }

        if (filters.status && filters.status !== 'ALL' && order.status !== filters.status) return false
        if (filters.orderType && filters.orderType !== 'ALL' && order.orderType !== filters.orderType) return false
        if (filters.minValue !== undefined && order.total < filters.minValue) return false
        if (filters.maxValue !== undefined && order.total > filters.maxValue) return false

        return true
    })

    const groupedOrders: GroupedOrders = {
        PENDING: filteredOrders.filter(o => o.status === 'PENDING'),
        CONFIRMED: filteredOrders.filter(o => o.status === 'CONFIRMED'),
        PREPARING: filteredOrders.filter(o => o.status === 'PREPARING'),
        READY: filteredOrders.filter(o => o.status === 'READY'),
        DELIVERED: filteredOrders.filter(o => o.status === 'DELIVERED'),
        CANCELLED: filteredOrders.filter(o => o.status === 'CANCELLED')
    }

    const getOrdersByStatus = (status: OrderStatus): Order[] => {
        return groupedOrders[status] || []
    }

    const hasActiveFilters = filters.status || filters.orderType || filters.minValue !== undefined || filters.maxValue !== undefined

    const clearFilters = () => {
        setFilters({})
        setSearchTerm('')
    }

    return (
        <div className="h-screen bg-gray-100 p-4 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestão de Pedidos</h1>
                    <p className="text-sm text-gray-500">
                        {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} encontrado{filteredOrders.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Search */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar pedido..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent outline-none text-sm w-40"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')}>
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        )}
                    </div>

                    {/* Filter button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            hasActiveFilters
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filtros
                        {hasActiveFilters && (
                            <span className="bg-white text-emerald-600 text-xs px-1.5 py-0.5 rounded-full font-bold">
                                !
                            </span>
                        )}
                    </button>

                    {/* Clear filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm"
                        >
                            <XCircle className="w-4 h-4" />
                            Limpar
                        </button>
                    )}

                    {/* Fullscreen */}
                    <button
                        onClick={() => document.documentElement.requestFullscreen()}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                    >
                        Tela Cheia
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-wrap gap-4 items-end">
                    {/* Status Filter */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Status</label>
                        <select
                            value={filters.status || 'ALL'}
                            onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                            className="border rounded-lg px-3 py-2 text-sm bg-white"
                        >
                            {RESTAURANT_FILTER_OPTIONS.statuses.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Order Type Filter */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Tipo de Pedido</label>
                        <select
                            value={filters.orderType || 'ALL'}
                            onChange={(e) => setFilters(f => ({ ...f, orderType: e.target.value }))}
                            className="border rounded-lg px-3 py-2 text-sm bg-white"
                        >
                            {RESTAURANT_FILTER_OPTIONS.orderTypes.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date From */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Data Início</label>
                        <input
                            type="date"
                            value={filters.dateFrom || ''}
                            onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                            className="border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    {/* Date To */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Data Fim</label>
                        <input
                            type="date"
                            value={filters.dateTo || ''}
                            onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                            className="border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    {/* Min Value */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Valor Mín</label>
                        <input
                            type="number"
                            placeholder="R$ 0"
                            value={filters.minValue ?? ''}
                            onChange={(e) => setFilters(f => ({ ...f, minValue: e.target.value ? Number(e.target.value) : undefined }))}
                            className="border rounded-lg px-3 py-2 text-sm w-24"
                        />
                    </div>

                    {/* Max Value */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Valor Máx</label>
                        <input
                            type="number"
                            placeholder="R$ 999"
                            value={filters.maxValue ?? ''}
                            onChange={(e) => setFilters(f => ({ ...f, maxValue: e.target.value ? Number(e.target.value) : undefined }))}
                            className="border rounded-lg px-3 py-2 text-sm w-24"
                        />
                    </div>
                </div>
            )}

            {/* Board */}
            <div className="flex-1 grid grid-cols-4 gap-4 overflow-hidden">
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
                                        onCancel={() => handleCancel(order.id)}
                                        onPrint={() => handlePrint(order)}
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

function OrderCard({ order, onMove, onCancel, onPrint, moveLabel, isUpdating }: OrderCardProps) {
    const tempoEspera = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
    const atrasado = tempoEspera > 30

    const getOrderTypeBadge = () => {
        if (order.orderType === 'DINE_IN') return { label: `Mesa ${order.tableNumber}`, className: 'bg-purple-100 text-purple-700' }
        if (order.orderType === 'DELIVERY') return { label: 'Delivery', className: 'bg-orange-100 text-orange-700' }
        return { label: 'Retirada', className: 'bg-gray-100 text-gray-700' }
    }

    const badge = getOrderTypeBadge()

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
                <span className={`text-xs px-2 py-1 rounded-full ${badge.className}`}>
                    {badge.label}
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

            {/* Actions */}
            <div className="flex gap-2 mt-3">
                <button
                    onClick={onMove}
                    disabled={isUpdating}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300
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

                <button
                    onClick={onPrint}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Imprimir comanda"
                >
                    <Printer className="w-4 h-4 text-gray-600" />
                </button>

                <button
                    onClick={onCancel}
                    disabled={isUpdating}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    title="Cancelar pedido"
                >
                    <XCircle className="w-4 h-4 text-red-500" />
                </button>
            </div>
        </div>
    )
}
