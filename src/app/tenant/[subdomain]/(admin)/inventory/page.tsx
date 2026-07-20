import { getTenantDb } from '@/lib/db';
import { requirePermission } from '@/lib/auth';
import Link from 'next/link';
import { ScanLine, Search, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default async function InventoryAuditsPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  await requirePermission('MANAGE_ASSETS');
  const resolvedParams = await params;
  const db = await getTenantDb(resolvedParams.subdomain);
  
  const audits = await db.inventoryAudit.findMany({
    include: {
      location: true,
      user: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Fiziksel Sayım (Audit) Raporları</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Geçmişte yapılan envanter sayımlarının sonuçlarını inceleyin veya yeni sayım başlatın.</p>
        </div>
        <Link 
          href={`/inventory/new`}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all flex-shrink-0"
        >
          <ScanLine size={18} />
          Yeni Sayım Başlat
        </Link>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6">
        {audits.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ScanLine size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Henüz Hiç Sayım Yapılmamış</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Depo ve lokasyonlarınızdaki varlıkların doğruluğunu teyit etmek için hemen bir fiziksel sayım başlatabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {audits.map(audit => (
              <div key={audit.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors bg-white dark:bg-slate-950">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-bold text-slate-400 dark:text-slate-500">#{audit.id.slice(-6).toUpperCase()}</span>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{audit.location.name} Sayımı</h3>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${audit.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                        {audit.status === 'COMPLETED' ? 'Tamamlandı' : 'Devam Ediyor'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{audit.user.name}</span> tarafından {format(new Date(audit.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })} tarihinde oluşturuldu.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{audit.totalExpected}</div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Beklenen</div>
                    </div>
                    <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {audit.status === 'IN_PROGRESS' ? '-' : audit.totalFound}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bulunan</div>
                    </div>
                    <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-red-600 dark:text-red-400">
                        {audit.status === 'IN_PROGRESS' ? '-' : audit.totalMissing}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kayıp</div>
                    </div>
                    
                    {(audit.totalWrongLoc > 0 || audit.totalUnknown > 0) && (
                      <>
                        <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>
                        <div className="text-center flex items-center justify-center gap-1 text-amber-600 dark:text-amber-500">
                          <AlertCircle size={20} />
                          <div className="text-left leading-tight">
                            <div className="text-sm font-bold">{audit.totalWrongLoc + audit.totalUnknown}</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider">Hatalı</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {audit.status === 'IN_PROGRESS' && (
                    <div className="mt-4 md:mt-0 flex items-center gap-3 md:pl-6 md:border-l border-slate-200 dark:border-slate-800">
                      <Link 
                        href={`/inventory/${audit.id}`}
                        className="px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 rounded-xl font-bold text-sm transition-colors whitespace-nowrap"
                      >
                        Sayım'a Devam Et
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
