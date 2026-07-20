'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

export function PrintButton() {
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('pdf-content');
      
      if (!element) {
        alert('Yazdırılacak içerik bulunamadı.');
        setLoading(false);
        return;
      }

      // Temporarily hide the print button container during PDF generation
      const printBtn = element.querySelector('.print\\:hidden');
      if (printBtn) {
        (printBtn as HTMLElement).style.display = 'none';
      }

      const opt: any = {
        margin:       [10, 10, 10, 10], // top, left, bottom, right
        filename:     'zimmet_formu.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
      };

      // Generate PDF and open in new tab
      html2pdf().set(opt).from(element).outputPdf('bloburl').then((url: string) => {
        window.open(url, '_blank');
        
        // Restore print button
        if (printBtn) {
          (printBtn as HTMLElement).style.display = '';
        }
        setLoading(false);
      });
      
    } catch (error) {
      console.error('PDF oluşturulurken hata:', error);
      alert('PDF oluşturulurken bir hata oluştu.');
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePrint} 
      disabled={loading}
      className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm hover:bg-indigo-700 flex items-center gap-2 transition-colors disabled:opacity-70"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
      {loading ? 'PDF Hazırlanıyor...' : 'PDF Olarak Aç'}
    </button>
  );
}
