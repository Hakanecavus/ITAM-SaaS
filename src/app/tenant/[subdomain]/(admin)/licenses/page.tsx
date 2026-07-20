import { getTenantDb } from '@/lib/db';
import Link from 'next/link';
import { requirePermission } from '@/lib/auth';

export default async function LicensesPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  await requirePermission('VIEW_LICENSES');
  const resolvedParams = await params;
  const db = await getTenantDb(resolvedParams.subdomain);
  
  const licenses = await db.license.findMany({
    include: {
      assignments: true
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Yazılım Lisansları</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Sisteme kayıtlı yazılım lisanslarını ve atamalarını yönetin.</p>
        </div>
        <Link 
          href={`/licenses/new`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 whitespace-nowrap"
        >
          + Yeni Lisans
        </Link>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Lisans Adı</th>
                <th className="px-6 py-4">Anahtar (Key)</th>
                <th className="px-6 py-4">Kapasite / Kullanım</th>
                <th className="px-6 py-4">Bitiş Tarihi</th>
                <th className="px-6 py-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {licenses.map(license => {
                const isFull = license.assignments.length >= license.seats;
                const isExpiring = license.expirationDate && (license.expirationDate.getTime() - new Date().getTime()) < (30 * 24 * 60 * 60 * 1000);
                
                return (
                  <tr key={license.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {license.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                      {license.key || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-24">
                          <div 
                            className={`h-full ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.min(100, (license.assignments.length / license.seats) * 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${isFull ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {license.assignments.length} / {license.seats}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {license.expirationDate ? (
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${isExpiring ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {license.expirationDate.toLocaleDateString('tr-TR')}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/licenses/${license.id}`}
                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        Yönet
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {licenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Henüz lisans kaydı bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
