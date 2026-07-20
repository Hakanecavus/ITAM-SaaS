'use client';

import { use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { processMockPayment } from '@/app/actions/iyzico';

export default function MockPaymentPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = use(params);
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'STARTER';
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      await processMockPayment(subdomain, plan);
      setSuccess(true);
      setTimeout(() => {
        router.push('/settings/billing');
      }, 2000);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ödeme Başarılı!</h2>
        <p className="text-slate-500 mt-2">Aboneliğiniz güncellendi. Yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center text-white">
          <CreditCard size={32} className="mx-auto mb-2 opacity-80" />
          <h2 className="text-xl font-bold">Simüle Edilmiş Ödeme Ekranı</h2>
          <p className="text-indigo-200 text-sm mt-1">
            (Iyzico API Anahtarı eksik olduğu için bu sayfa gösterilmektedir.)
          </p>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400">Seçilen Paket:</span>
            <span className="font-bold text-lg text-slate-800 dark:text-white">{plan} Paketi</span>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Kart Numarası</label>
              <div className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-mono">
                4343 **** **** 4343
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">SKT</label>
                <div className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-mono">
                  12/34
                </div>
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-slate-500 mb-1">CVV</label>
                <div className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-mono">
                  ***
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'İşleniyor...' : `₺${plan === 'PRO' ? '999.00' : '499.00'} Öde`}
          </button>
        </div>
      </div>
    </div>
  );
}
