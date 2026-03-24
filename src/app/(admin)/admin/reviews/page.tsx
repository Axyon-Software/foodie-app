// src/app/(admin)/admin/reviews/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, Send, ThumbsUp, MessageCircle, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getRestaurantReviews, respondToReview, getRestaurantProfile } from '@/actions/restaurant-actions';
import { Review } from '@/types/restaurant-management.types';

export default function ReviewsPage() {
    const router = useRouter();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [response, setResponse] = useState('');
    const [isResponding, setIsResponding] = useState(false);
    const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');

    useEffect(() => {
        const loadReviews = async () => {
            const restaurant = await getRestaurantProfile();
            if (restaurant.data) {
                const result = await getRestaurantReviews(restaurant.data.id);
                if (result.data) {
                    setReviews(result.data);
                }
            }
            setIsLoading(false);
        };
        loadReviews();
    }, []);

    const handleRespond = async (reviewId: string) => {
        if (!response.trim()) {
            toast.error('Digite uma resposta');
            return;
        }

        setIsResponding(true);
        const result = await respondToReview(reviewId, response);

        if (result.success) {
            setReviews(prev => prev.map(r => 
                r.id === reviewId ? { ...r, response } : r
            ));
            setSelectedReview(null);
            setResponse('');
            toast.success('Resposta enviada!');
        } else {
            toast.error(result.error || 'Erro ao enviar resposta');
        }

        setIsResponding(false);
    };

    const filteredReviews = filter === 'all' 
        ? reviews 
        : reviews.filter(r => r.rating === parseInt(filter));

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    const ratingCounts = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
    };

    const renderStars = (rating: number, size: number = 16) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
            ))}
        </div>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A082]"></div>
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
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Star size={20} className="text-yellow-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Avaliações</h1>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {reviews.length} avaliação{reviews.length !== 1 ? 'ões' : ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="p-4">
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-4xl font-bold" style={{ color: 'var(--color-text)' }}>{averageRating}</p>
                            {renderStars(Math.round(parseFloat(averageRating)), 20)}
                            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{reviews.length} avaliações</p>
                        </div>
                        <div className="flex-1 space-y-1">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const percentage = reviews.length > 0 ? (ratingCounts[star as keyof typeof ratingCounts] / reviews.length) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-2">
                                        <span className="text-sm w-3" style={{ color: 'var(--color-text-secondary)' }}>{star}</span>
                                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                        <div className="flex-1 h-2 rounded-full bg-gray-200">
                                            <div 
                                                className="h-2 rounded-full bg-yellow-400"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs w-8" style={{ color: 'var(--color-text-tertiary)' }}>
                                            {ratingCounts[star as keyof typeof ratingCounts]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="px-4 mb-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'all' ? 'bg-[#00A082] text-white' : ''}`}
                        style={{ backgroundColor: filter === 'all' ? '#00A082' : 'var(--color-bg-card)', color: filter === 'all' ? 'white' : 'var(--color-text-secondary)' }}
                    >
                        Todas
                    </button>
                    {[5, 4, 3, 2, 1].map((star) => (
                        <button
                            key={star}
                            onClick={() => setFilter(String(star) as typeof filter)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 ${filter === String(star) ? 'bg-[#00A082] text-white' : ''}`}
                            style={{ backgroundColor: filter === String(star) ? '#00A082' : 'var(--color-bg-card)', color: filter === String(star) ? 'white' : 'var(--color-text-secondary)' }}
                        >
                            {star} <Star size={12} className={filter === String(star) ? 'text-white' : 'text-yellow-400 fill-yellow-400'} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className="p-4 pt-0 space-y-4">
                {filteredReviews.length === 0 ? (
                    <div className="text-center py-12">
                        <Star size={48} className="mx-auto mb-4 text-gray-300" />
                        <p style={{ color: 'var(--color-text-secondary)' }}>Nenhuma avaliação encontrada</p>
                    </div>
                ) : (
                    filteredReviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 rounded-2xl"
                            style={{ backgroundColor: 'var(--color-bg-card)' }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#00A082] flex items-center justify-center text-white font-bold">
                                    {review.userName?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                                                {review.userName || 'Cliente Anônimo'}
                                            </span>
                                            <div className="flex items-center gap-2 mt-1">
                                                {renderStars(review.rating, 14)}
                                                <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                                    {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            {review.comment}
                                        </p>
                                    )}
                                    
                                    {/* Response */}
                                    {review.response && (
                                        <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                            <p className="text-xs font-medium mb-1" style={{ color: '#00A082' }}>Resposta do restaurante:</p>
                                            <p className="text-sm" style={{ color: 'var(--color-text)' }}>{review.response}</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {!review.response && (
                                        <button
                                            onClick={() => setSelectedReview(review)}
                                            className="mt-3 flex items-center gap-2 text-sm font-medium"
                                            style={{ color: '#00A082' }}
                                        >
                                            <MessageCircle size={16} />
                                            Responder
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Response Modal */}
            {selectedReview && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-4"
                        style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                        <div className="mb-4">
                            <h3 className="font-bold" style={{ color: 'var(--color-text)' }}>Responder Avaliação</h3>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                de {selectedReview.userName || 'Cliente'}
                            </p>
                        </div>
                        <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Digite sua resposta..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A082]"
                            style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => { setSelectedReview(null); setResponse(''); }}
                                className="flex-1 py-3 rounded-xl font-medium"
                                style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleRespond(selectedReview.id)}
                                disabled={isResponding}
                                className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                                style={{ backgroundColor: '#00A082', color: 'white' }}
                            >
                                {isResponding ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Enviar
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}