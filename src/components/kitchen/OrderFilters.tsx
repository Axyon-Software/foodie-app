'use client';

import { useState } from 'react';

export interface OrderFiltersState {
  status?: string;
  searchQuery: string;
  orderType?: string;
  sortBy: 'newest' | 'oldest' | 'priority';
}

export interface OrderFiltersProps {
  filters: OrderFiltersState;
  onFilterChange: (filters: OrderFiltersState) => void;
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'PREPARING', label: 'Preparando' },
  { value: 'READY', label: 'Pronto' },
];

const ORDER_TYPE_OPTIONS = [
  { value: 'ALL', label: 'Todos Tipos' },
  { value: 'DINE_IN', label: 'Mesa' },
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'TAKEOUT', label: 'Retirada' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais Recentes' },
  { value: 'oldest', label: 'Mais Antigos' },
  { value: 'priority', label: 'Prioridade' },
];

export function OrderFilters({ filters, onFilterChange }: OrderFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusChange = (status: string) => {
    onFilterChange({
      ...filters,
      status: status === 'ALL' ? undefined : status,
    });
  };

  const handleOrderTypeChange = (orderType: string) => {
    onFilterChange({
      ...filters,
      orderType: orderType === 'ALL' ? undefined : orderType,
    });
  };

  const handleSortChange = (sortBy: 'newest' | 'oldest' | 'priority') => {
    onFilterChange({
      ...filters,
      sortBy,
    });
  };

  const handleSearchChange = (searchQuery: string) => {
    onFilterChange({
      ...filters,
      searchQuery,
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      searchQuery: '',
      sortBy: 'newest',
    });
  };

  const hasActiveFilters =
    filters.status ||
    filters.orderType ||
    filters.searchQuery ||
    filters.sortBy !== 'newest';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Search Bar */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Buscar por cliente ou número do pedido..."
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
        {filters.searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Quick Status Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
              (option.value === 'ALL' && !filters.status) || filters.status === option.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Expand/Collapse Advanced Filters */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-2"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        Filtros Avançados
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </button>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Pedido
            </label>
            <div className="flex flex-wrap gap-2">
              {ORDER_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOrderTypeChange(option.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    (option.value === 'ALL' && !filters.orderType) ||
                    filters.orderType === option.value
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value as 'newest' | 'oldest' | 'priority')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    filters.sortBy === option.value
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
