'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect, useTransition } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  statusOptions?: FilterOption[];
  categoryOptions?: FilterOption[];
  searchPlaceholder?: string;
}

export function FilterBar({ 
  statusOptions = [], 
  categoryOptions = [], 
  searchPlaceholder = 'Ara...' 
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');

  // Update URL when filters change
  const applyFilters = useCallback((newSearch: string, newStatus: string, newCategory: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newSearch) params.set('q', newSearch);
    else params.delete('q');

    if (newStatus) params.set('status', newStatus);
    else params.delete('status');

    if (newCategory) params.set('category', newCategory);
    else params.delete('category');

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [searchParams, router]);

  // Handle typing with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (searchParams.get('q') || '')) {
        applyFilters(searchTerm, status, category);
      }
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [searchTerm, status, category, applyFilters, searchParams]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center animate-in fade-in slide-in-from-top-4">
      
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="flex gap-4 w-full md:w-auto">
        {/* Status Filter */}
        {statusOptions.length > 0 && (
          <div className="relative min-w-[150px] flex-1 md:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter size={16} />
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                applyFilters(searchTerm, e.target.value, category);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
            >
              <option value="">Tüm Durumlar</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Category Filter */}
        {categoryOptions.length > 0 && (
          <div className="relative min-w-[150px] flex-1 md:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter size={16} />
            </div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                applyFilters(searchTerm, status, e.target.value);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
            >
              <option value="">Tüm Kategoriler</option>
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Loading Indicator */}
        {isPending && (
          <div className="flex items-center justify-center px-2">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
          </div>
        )}
      </div>

    </div>
  );
}
