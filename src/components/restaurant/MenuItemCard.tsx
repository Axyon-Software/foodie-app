// src/components/restaurant/MenuItemCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { MenuItem } from '@/types';
import { formatPrice } from '@/lib/utils/format.utils';
import MenuItemModal from './MenuItemModal';

interface MenuItemCardProps {
    item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = (): void => {
        setIsModalOpen(true);
    };

    const handleCloseModal = (): void => {
        setIsModalOpen(false);
    };

    return (
        <>
            <article
                onClick={handleOpenModal}
                className="flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer group hover:shadow-md"
                style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)'
                }}
            >
                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                        <h3
                            className="font-semibold text-lg"
                            style={{ color: 'var(--color-text)' }}
                        >
                            {item.name}
                        </h3>
                        {item.popular && (
                            <span className="shrink-0 bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-medium">
                🔥 Popular
              </span>
                        )}
                    </div>

                    <p
                        className="text-sm mt-1 line-clamp-2"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        {item.description}
                    </p>

                    <p className="text-[#00A082] font-bold text-lg mt-3">
                        {formatPrice(item.price)}
                    </p>
                </div>

                {/* Imagem + Botão */}
                <div className="relative shrink-0">
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden">
                        <Image
                            src={item.image || '/placeholder.png'}
                            alt={item.name}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal();
                        }}
                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#00A082] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#008F74] transition-colors"
                        aria-label={`Adicionar ${item.name} ao carrinho`}
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </article>

            {/* Modal */}
            <MenuItemModal
                item={item}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </>
    );
}