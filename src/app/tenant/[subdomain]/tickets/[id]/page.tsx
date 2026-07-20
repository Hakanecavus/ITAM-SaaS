import { getTenantDb } from '@/lib/db';
import { updateTicketStatus, addTicketComment } from '@/app/actions/ticket';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function TicketDetailsPage({
  params
}: {
  params: Promise<{ subdomain: string; id: string }>
}) {
  const { subdomain, id } = await params;
  const db = await getTenantDb(subdomain);

  const ticket = await db.ticket.findUnique({
    where: { id },
    include: {
      createdBy: true,
      assignedTo: true,
      asset: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!ticket) {
    return <div className="p-6">Bilet bulunamadı.</div>;
  }

  // Get current user for commenting
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session')?.value;
  if (!sessionCookie) redirect('/login');
  const { userId } = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));

  const adminUsers = await db.user.findMany({
    where: { role: { permissions: { contains: 'MANAGE_ASSETS' } } }
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/tickets`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{ticket.title}</h1>
          <p className="text-slate-500">Talep #{ticket.id.slice(-6).toUpperCase()} • {new Date(ticket.createdAt).toLocaleString('tr-TR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ticket Content & Comments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-semibold text-lg mb-2">Açıklama</h3>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-[500px]">
            <h3 className="font-semibold text-lg mb-4">Yazışmalar</h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {ticket.comments.map(comment => (
                <div key={comment.id} className={`flex flex-col ${comment.userId === userId ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    comment.isInternal 
                      ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' 
                      : comment.userId === userId 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}>
                    <div className={`text-xs mb-1 font-medium ${comment.userId === userId ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {comment.user.name} {comment.isInternal && '(Gizli IT Notu)'}
                    </div>
                    <div className="whitespace-pre-wrap">{comment.content}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">{new Date(comment.createdAt).toLocaleString('tr-TR')}</span>
                </div>
              ))}
              {ticket.comments.length === 0 && (
                <div className="text-center text-slate-500 my-10">Henüz mesaj yok.</div>
              )}
            </div>

            <form 
              action={async (formData) => {
                'use server';
                const content = formData.get('content') as string;
                const isInternal = formData.get('isInternal') === 'true';
                if (content.trim()) {
                  await addTicketComment(subdomain, ticket.id, userId, content, isInternal);
                }
              }}
              className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4"
            >
              <div className="flex gap-2 mb-2">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <input type="checkbox" name="isInternal" value="true" className="rounded" />
                  Sadece IT Personeli Görsün (İç Not)
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="content"
                  required
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button type="submit" className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shrink-0">
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Ticket Meta & Controls */}
        <div className="space-y-6">
          <form 
            action={async (formData) => {
              'use server';
              const status = formData.get('status') as string;
              const assignedToId = formData.get('assignedToId') as string;
              await updateTicketStatus(subdomain, ticket.id, status, assignedToId);
            }}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-5"
          >
            <h3 className="font-semibold text-lg border-b border-slate-100 dark:border-slate-800 pb-3">Detaylar & Durum</h3>
            
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Durum</label>
              <select name="status" defaultValue={ticket.status} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                <option value="OPEN">Açık</option>
                <option value="IN_PROGRESS">İşlemde</option>
                <option value="RESOLVED">Çözüldü</option>
                <option value="CLOSED">Kapatıldı</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Öncelik</label>
              <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm border border-slate-200 dark:border-slate-700">
                {ticket.priority === 'URGENT' ? '🔴 Acil' :
                 ticket.priority === 'HIGH' ? '🟠 Yüksek' :
                 ticket.priority === 'MEDIUM' ? '🔵 Normal' : '⚪️ Düşük'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Atanan IT Personeli</label>
              <select name="assignedToId" defaultValue={ticket.assignedToId || ''} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                <option value="">-- Atanmadı --</option>
                {adminUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              Durumu Güncelle
            </button>
          </form>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-semibold text-lg border-b border-slate-100 dark:border-slate-800 pb-3">Kullanıcı & Cihaz Bilgisi</h3>
            
            <div>
              <label className="block text-xs font-medium text-slate-500">Talep Eden</label>
              <div className="text-sm font-medium mt-1">{ticket.createdBy.name}</div>
              <div className="text-xs text-slate-500">{ticket.createdBy.email}</div>
            </div>

            {ticket.asset && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-medium text-slate-500">İlgili Cihaz</label>
                <div className="text-sm font-medium mt-1">{ticket.asset.brandModel}</div>
                <div className="text-xs text-slate-500">SN: {ticket.asset.serialNo || '-'}</div>
                <Link href={`/assets/${ticket.asset.id}`} className="inline-block mt-2 text-xs text-indigo-600 hover:underline">
                  Cihaz Kartına Git &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
