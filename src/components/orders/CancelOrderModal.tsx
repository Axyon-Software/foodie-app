// src/components/orders/CancelOrderModal.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cancelOrder } from '@/actions/orders'
import { ORDER_MESSAGES, CANCEL_REASONS_CLIENT } from '@/lib/constants/order.constants'

interface CancelOrderModalProps {
    orderId: string
    isOpen: boolean
    onClose: () => void
    onCancelled: () => void
}

export function CancelOrderModal({ orderId, isOpen, onClose, onCancelled }: CancelOrderModalProps) {
    const [selectedReason, setSelectedReason] = useState('')
    const [customReason, setCustomReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleCancel = async () => {
        const reason = selectedReason === 'Outro motivo' ? customReason : selectedReason
        if (!reason) {
            toast.error('Selecione um motivo para cancelamento')
            return
        }

        setIsSubmitting(true)
        try {
            const result = await cancelOrder({ orderId, reason })

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success(ORDER_MESSAGES.CANCEL_SUCCESS)
            onCancelled()
            onClose()
        } catch {
            toast.error(ORDER_MESSAGES.CANCEL_ERROR)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl"
                        style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                        {/* Handle */}
                        <div className="sticky top-0 z-10 flex justify-center pt-3 pb-1" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                            <div className="h-1 w-10 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
                        </div>

                        <div className="px-6 pb-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(255, 68, 68, 0.15)' }}>
                                        <AlertTriangle size={20} style={{ color: '#FF4444' }} />
                                    </div>
                                    <h2
                                        className="text-lg font-bold"
                                        style={{ color: 'var(--color-text)' }}
                                    >
                                        {ORDER_MESSAGES.CANCEL_ORDER}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="flex h-8 w-8 items-center justify-center rounded-full"
                                    style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                                >
                                    <X size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                </button>
                            </div>

                            {/* Warning */}
                            <p
                                className="text-sm mb-6"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                {ORDER_MESSAGES.CANCEL_CONFIRM}
                            </p>

                            {/* Reasons */}
                            <div className="space-y-2 mb-4">
                                {CANCEL_REASONS_CLIENT.map((reason) => (
                                    <button
                                        key={reason}
                                        onClick={() => setSelectedReason(reason)}
                                        className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors"
                                        style={{
                                            backgroundColor:
                                                selectedReason === reason
                                                    ? 'rgba(0, 160, 130, 0.1)'
                                                    : 'var(--color-bg-secondary)',
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            borderColor:
                                                selectedReason === reason
                                                    ? '#00A082'
                                                    : 'transparent',
                                            color: 'var(--color-text)',
                                        }}
                                    >
                                        <div
                                            className="flex h-5 w-5 items-center justify-center rounded-full border-2"
                                            style={{
                                                borderColor:
                                                    selectedReason === reason
                                                        ? '#00A082'
                                                        : 'var(--color-border)',
                                            }}
                                        >
                                            {selectedReason === reason && (
                                                <div className="h-2.5 w-2.5 rounded-full bg-[#00A082]" />
                                            )}
                                        </div>
                                        {reason}
                                    </button>
                                ))}
                            </div>

                            {/* Custom reason input */}
                            {selectedReason === 'Outro motivo' && (
                                <textarea
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    placeholder="Descreva o motivo..."
                                    rows={2}
                                    className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none mb-4"
                                    style={{
                                        backgroundColor: 'var(--color-bg-secondary)',
                                        color: 'var(--color-text)',
                                    }}
                                />
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={onClose}
                                    className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors"
                                    style={{
                                        backgroundColor: 'var(--color-bg-secondary)',
                                        color: 'var(--color-text)',
                                    }}
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isSubmitting || !selectedReason}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#FF4444] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#E03E3E] disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        'Confirmar cancelamento'
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
