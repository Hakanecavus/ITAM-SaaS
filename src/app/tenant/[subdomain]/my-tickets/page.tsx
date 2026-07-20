import { getTenantDb } from '@/lib/db';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';

export default async function MyTicketsPage({
  params
}: {
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params;
  
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session')?.value;
  if (!sessionCookie) {
    redirect('/login');
  }

  const { userId } = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));

  const db = await getTenantDb(subdomain);
  const tickets = await db.ticket.findMany({
    where: { createdById: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      asset: true,
    }
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Destek Taleplerim</h1>
          <p className="text-slate-500">IT departmanına ilettiğiniz taleplerinizi ve durumlarını takip edin.</p>
        </div>
        <Link 
          href={`/my-tickets/new`}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Plus size={20} />
          Yeni Talep Oluştur
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Konu</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4">Öncelik</th>
                <th className="px-6 py-4">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Henüz bir destek talebi oluşturmadınız.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/my-tickets/${ticket.id}`} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                        {ticket.title}
                      </Link>
                      {ticket.asset && (
                        <div className="text-xs text-slate-500 mt-1">İlgili Cihaz: {ticket.asset.demiRbasNo}</div>
                      )}
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
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
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
