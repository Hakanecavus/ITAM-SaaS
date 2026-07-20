'use client';

import { usePathname, useRouter } from 'next/navigation';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { useEffect } from 'react';

export function SubscriptionGuard({ expired, children }: { expired: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (!expired) return <>{children}</>;

  // Eğer fatura/abonelik sayfasındaysa sayfayı göster
  if (pathname.includes('/settings/billing')) {
    return <>{children}</>;
  }

  // Değilse her şeyi engelle ve uyarı göster
  return (
    <div className="flex flex-col items-center justify-center h-full max-h-[80vh] bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={40} />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Erişim Kısıtlandı</h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 text-lg">
        Ücretsiz deneme süreniz sona erdi veya ödemeniz alınamadığı için sistem kullanımınız durdurulmuştur. Sistemdeki verilerinize erişmeye devam etmek için lütfen aboneliğinizi güncelleyin.
      </p>
      <button
        onClick={() => router.push('/settings/billing')}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg shadow-md transition-colors flex items-center gap-2 text-lg"
      >
        <CreditCard size={20} />
        Abonelik ve Ödeme
      </button>
    </div>
  );
}
