import { getTenantDb } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { MonitorSmartphone, Search } from 'lucide-react';
import Link from 'next/link';

export default async function MyAssetsPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const session = await requireAuth();
  const resolvedParams = await params;
  
  const db = await getTenantDb(resolvedParams.subdomain);
  
  // Kullanıcının zimmetindeki aktif cihazları getir
  const assets = await db.asset.findMany({
    where: {
      assignedUserId: session.userId,
      status: 'Kullanımda'
    },
    include: {
      category: true,
      location: true,
    },
  });

  // Kullanıcının geçmiş zimmet/iade vb. geçmişini getir
  const history = await db.assetHistory.findMany({
    where: {
      userId: session.userId
    },
    include: {
      asset: {
        include: { category: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Zimmetlerim</h1>
          <p className="text-slate-500 mt-1">Üzerinize zimmetli olan bilişim varlıklarını buradan takip edebilirsiniz.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <MonitorSmartphone size={20} />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                Aktif
              </span>
            </div>
            
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg truncate mb-1">
              {asset.brandModel}
            </h3>
            <p className="text-sm text-slate-500 mb-4">{asset.category.name}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500">Demirbaş No</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{asset.demiRbasNo}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500">Seri No</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{asset.serialNo || '-'}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link 
                href={`/assets/${asset.id}`}
                className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
              >
                Cihaz Detayları <span className="text-lg leading-none">→</span>
              </Link>
            </div>
          </div>
        ))}
        
        {assets.length === 0 && (
          <div className="col-span-full bg-white dark:bg-slate-950 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <MonitorSmartphone className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Zimmetli Cihazınız Yok</h3>
            <p className="text-slate-500">Şu anda üzerinize kayıtlı herhangi bir bilişim varlığı bulunmuyor.</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Son İşlemlerim</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {history.length > 0 ? history.map((h) => (
            <div key={h.id} className="p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${h.actionType === 'ASSIGN' ? 'bg-blue-100 text-blue-600' : h.actionType === 'RETURN' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                  {h.actionType === 'ASSIGN' ? '⬇️' : h.actionType === 'RETURN' ? '⬆️' : '📝'}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {h.asset.brandModel}
                  </p>
                  <p className="text-xs text-slate-500">
                    {h.actionType === 'ASSIGN' ? 'Üzerinize Zimmetlendi' : h.actionType === 'RETURN' ? 'Kuruma İade Edildi' : 'Durum Güncellendi'} • {h.createdAt.toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
              <Link 
                href={`/assets/${h.assetId}/form/${h.id}`}
                className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                target="_blank"
              >
                Formu Gör
              </Link>
            </div>
          )) : (
            <div className="p-8 text-center text-slate-500">
              Henüz bir işlem geçmişiniz bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
