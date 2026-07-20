import { getTenantDb } from '@/lib/db';
import Link from 'next/link';

export default async function AdminTicketsPage({
  params
}: {
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params;
  const db = await getTenantDb(subdomain);

  const tickets = await db.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: true,
      assignedTo: true,
      asset: true,
    }
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Destek Talepleri (Helpdesk)</h1>
        <p className="text-slate-500">Çalışanlardan gelen donanım ve teknik destek taleplerini yönetin.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Talep</th>
                <th className="px-6 py-4">Kullanıcı</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4">Öncelik</th>
                <th className="px-6 py-4">Atanan Kişi</th>
                <th className="px-6 py-4">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Henüz hiç destek talebi bulunmuyor.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/tickets/${ticket.id}`} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                        {ticket.title}
                      </Link>
                      {ticket.asset && (
                        <div className="text-xs text-slate-500 mt-1">Cihaz: {ticket.asset.demiRbasNo}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{ticket.createdBy.name}</div>
                      <div className="text-xs text-slate-500">{ticket.createdBy.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50' :
                        ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' :
                        'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}>
                        {ticket.status === 'OPEN' ? 'Açık' : 
                         ticket.status === 'IN_PROGRESS' ? 'İşlemde' : 
                         ticket.status === 'RESOLVED' ? 'Çözüldü' : 'Kapatıldı'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        ticket.priority === 'URGENT' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        ticket.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {ticket.priority === 'URGENT' ? 'Acil' :
                         ticket.priority === 'HIGH' ? 'Yüksek' :
                         ticket.priority === 'MEDIUM' ? 'Normal' : 'Düşük'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {ticket.assignedTo ? ticket.assignedTo.name : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">
                      {new Date(ticket.createdAt).toLocaleString('tr-TR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
