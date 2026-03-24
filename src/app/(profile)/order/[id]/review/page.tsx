// src/app/(profile)/order/[id]/review/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { submitOrderReview } from '@/actions/order-management';

export default function OrderReviewPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Selecione uma nota');
            return;
        }

        setIsSubmitting(true);
        const result = await submitOrderReview(orderId, rating, comment);

        if (result.success || result.data) {
            toast.success('Avaliação enviada!');
            setSubmitted(true);
        } else {
            toast.error(result.error || 'Erro ao enviar avaliação');
        }
        setIsSubmitting(false);
    };

    const ratingLabels = ['', 'Ruim', 'Regular', 'Bom', 'Muito Bom', 'Excelente'];

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ backgroundColor: 'var(--color-bg)' }}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4"
                >
                    <span className="text-4xl">🎉</span>
                </motion.div>
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Obrigado!</h2>
                <p className="text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>Sua avaliação foi registrada com sucesso.</p>
                <button onClick={() => router.push(`/order/${orderId}`)} className="px-6 py-3 bg-[#00A082] text-white rounded-full font-medium">
                    Voltar ao Pedido
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg)' }}>
            {/* Header */}
            <div className="p-4 border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2">
                        <ChevronLeft size={20} style={{ color: 'var(--color-text)' }} />
                    </button>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Avaliar Pedido</h1>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Rating */}
                <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>Como foi sua experiência?</h2>
                    <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>Selecione de 1 a 5 estrelas</p>
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                                key={star}
                                whileTap={{ scale: 0.9 }}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="p-2"
                            >
                                <Star
                                    size={36}
                                    className={
                                        (hoverRating || rating) >= star
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                    }
                                />
                            </motion.button>
                        ))}
                    </div>
                    {(hoverRating > 0 || rating > 0) && (
                        <p className="mt-3 font-medium" style={{ color: 'var(--color-text)' }}>
                            {ratingLabels[hoverRating || rating]}
                        </p>
                    )}
                </div>

                {/* Comment */}
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <label className="flex items-center gap-2 mb-3 font-medium" style={{ color: 'var(--color-text)' }}>
                        <MessageCircle size={18} style={{ color: 'var(--color-text-secondary)' }} />
                        Comentário (opcional)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        placeholder="Conte como foi sua experiência..."
                        className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                        style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                    />
                    <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>{comment.length}/500 caracteres</p>
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || rating === 0}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-semibold transition-colors disabled:opacity-50"
                        style={{ backgroundColor: '#00A082', color: 'white' }}
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send size={20} />
                                Enviar Avaliação
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}