import { requirePermission } from '@/lib/auth';
import { getTenantDb } from '@/lib/db';
import { ShieldAlert, Search } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default async function AuditLogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  await requirePermission('MANAGE_SETTINGS');
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const db = await getTenantDb(resolvedParams.subdomain);
  const q = resolvedSearchParams.q || '';

  const logs = await db.systemLog.findMany({
    where: {
      OR: [
        { description: { contains: q } },
        { actionType: { contains: q } },
        { module: { contains: q } },
        { user: { name: { contains: q } } }
      ]
    },
    include: {
      user: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Sistem Günlüğü</h1>
            <p className="text-slate-500 mt-1">Sistem üzerinde yapılan kritik değişiklikler ve denetim izleri.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <form className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              name="q"
              defaultValue={q}
              placeholder="İşlem, modül veya kişi ara..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Tarih</th>
                <th className="px-6 py-4 font-medium">Kullanıcı</th>
                <th className="px-6 py-4 font-medium">Modül</th>
                <th className="px-6 py-4 font-medium">İşlem Tipi</th>
                <th className="px-6 py-4 font-medium">Açıklama</th>
                <th className="px-6 py-4 font-medium">IP Adresi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {logs.length > 0 ? logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                    {format(log.createdAt, 'dd MMM yyyy HH:mm:ss', { locale: tr })}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {log.user ? log.user.name : 'Sistem / Anonim'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium">
                      {log.module}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                      log.actionType === 'CREATE' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                      log.actionType === 'UPDATE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                      log.actionType === 'DELETE' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {log.actionType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 dark:text-white">{log.description}</div>
                    {log.metadata && (
                      <div className="mt-1 text-xs text-slate-500 truncate max-w-xs" title={log.metadata}>
                        {log.metadata}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {log.ipAddress || '-'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    {q ? 'Aramanıza uygun kayıt bulunamadı.' : 'Henüz hiç sistem günlüğü kaydı bulunmuyor.'}
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
