'use client';

import { Printer } from 'lucide-react';

export function PrintLabelButton() {
  const handlePrint = () => {
    document.body.classList.add('print-mode-label');
    document.documentElement.classList.add('print-mode-label');
    
    // Dynamically inject @page size for label printing so it doesn't default to A4
    const style = document.createElement('style');
    style.id = 'dynamic-print-label-style';
    style.innerHTML = `@page { size: 50mm 25mm; margin: 0; }`;
    document.head.appendChild(style);

    window.print();
    
    setTimeout(() => {
      document.body.classList.remove('print-mode-label');
      document.documentElement.classList.remove('print-mode-label');
      const injectedStyle = document.getElementById('dynamic-print-label-style');
      if (injectedStyle) injectedStyle.remove();
    }, 1000);
  };

  return (
    <button 
      onClick={handlePrint} 
      className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2 text-sm"
    >
      <Printer size={16} />
      Etiket Yazdır
    </button>
  );
}
