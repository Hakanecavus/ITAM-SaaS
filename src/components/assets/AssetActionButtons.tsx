'use client';

import { Plus, Download, Upload } from 'lucide-react';
import Link from 'next/link';

export function AssetActionButtons({ subdomain }: { subdomain: string }) {
  return (
    <div className="flex gap-3 items-center">
      <a 
        href={`/assets/export`}
        className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all text-sm"
        target="_blank"
      >
        <Download size={16} />
        Dışa Aktar
      </a>
      
      <Link 
        href={`/assets/import`}
        className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all text-sm"
      >
        <Upload size={16} />
        İçe Aktarım Sihirbazı
      </Link>

      <a 
        href={`/assets/new`}
        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all text-sm"
      >
        <Plus size={16} />
        Yeni Ekle
      </a>
    </div>
  );
}
