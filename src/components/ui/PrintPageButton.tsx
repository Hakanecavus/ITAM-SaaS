'use client';

import { Printer } from 'lucide-react';

export function PrintPageButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors print:hidden"
    >
      <Printer size={18} />
      Yazdır
    </button>
  );
}
