// src/components/orders/OrderReview.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createOrderReview, type ReviewData } from '@/actions/orders'

interface OrderReviewProps {
    orderId: string
    restaurantId: string
    existingReview?: ReviewData | null
    onReviewSubmitted?: () => void
}

export function OrderReview({ orderId, restaurantId, existingReview, onReviewSubmitted }: OrderReviewProps) {
    const [rating, setRating] = useState(existingReview?.rating || 0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState(existingReview?.comment || '')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(!!existingReview)

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Selecione uma nota de 1 a 5')
            return
        }
        setIsSubmitting(true)
        try {
            const result = await createOrderReview({ orderId, restaurantId, rating, comment: comment.trim() || undefined })
            if (result.error) {
                toast.error(result.error)
                return
            }
            toast.success('Avaliação enviada com sucesso')
            setIsSubmitted(true)
            onReviewSubmitted?.()
        } catch {
            toast.error('Erro ao enviar avaliação')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3 mb-3">
                    <Star size={24} className="text-[#FFAA00]" fill="#FFAA00" />
                    <h2 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Sua avaliação</h2>
                </div>
                <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={20} fill={star <= rating ? '#FFAA00' : 'none'} style={{ color: star <= rating ? '#FFAA00' : 'var(--color-border)' }} />
                    ))}
                </div>
                {comment && <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>&ldquo;{comment}&rdquo;</p>}
            </div>
        )
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3 mb-4">
                <Star size={24} className="text-[#FFAA00]" />
                <h2 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Avaliar pedido</h2>
            </div>
            <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoveredRating(star)} onMouseLeave={() => setHoveredRating(0)} className="transition-transform hover:scale-110">
                        <Star size={32} fill={star <= (hoveredRating || rating) ? '#FFAA00' : 'none'} style={{ color: star <= (hoveredRating || rating) ? '#FFAA00' : 'var(--color-border)' }} />
                    </button>
                ))}
                {rating > 0 && (
                    <span className="ml-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        {rating === 1 && 'Ruim'}{rating === 2 && 'Regular'}{rating === 3 && 'Bom'}{rating === 4 && 'Muito bom'}{rating === 5 && 'Excelente'}
                    </span>
                )}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Conte como foi sua experiência (opcional)" maxLength={500} rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none mb-4"
                style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)' }} />
            <button onClick={handleSubmit} disabled={isSubmitting || rating === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A082] py-3 text-sm font-semibold text-white hover:bg-[#008F74] disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Enviar avaliação</>}
            </button>
        </motion.div>
    )
}
