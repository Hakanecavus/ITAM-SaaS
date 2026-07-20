'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { signAssetForm, rejectAssetForm } from '@/app/actions/form';
import { useRouter } from 'next/navigation';

interface SignaturePadProps {
  subdomain: string;
  formId: string;
  userId: string;
}

export function SignaturePad({ subdomain, formId, userId }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleClear = () => {
    sigCanvas.current?.clear();
  };

  const handleSign = async () => {
    if (sigCanvas.current?.isEmpty()) {
      setError('Lütfen bir imza atın.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const signatureData = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
      if (signatureData) {
        await signAssetForm(subdomain, formId, userId, signatureData);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'İmza kaydedilirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Lütfen reddetme sebebini yazın:');
    if (reason === null) return;
    
    setLoading(true);
    try {
      await rejectAssetForm(subdomain, formId, userId, reason || 'Belirtilmedi');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-950 relative">
        <SignatureCanvas 
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            className: "w-full h-48 cursor-crosshair",
            style: { touchAction: 'none' } // Prevent scrolling on mobile while signing
          }}
        />
        <div className="absolute bottom-2 left-2 text-xs text-slate-400 font-medium pointer-events-none">
          Lütfen buraya imzanızı atın
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button 
          onClick={handleClear}
          disabled={loading}
          className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50"
        >
          Temizle
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleReject}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
          >
            Formu Reddet
          </button>
          <button 
            onClick={handleSign}
            disabled={loading}
            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'İşleniyor...' : 'İmzala ve Onayla'}
          </button>
        </div>
      </div>
    </div>
  );
}
