import { getTenantDb } from '@/lib/db';
import { addTicketComment } from '@/app/actions/ticket';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function MyTicketDetailsPage({
  params
}: {
  params: Promise<{ subdomain: string; id: string }>
}) {
  const { subdomain, id } = await params;
  const db = await getTenantDb(subdomain);

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session')?.value;
  if (!sessionCookie) redirect('/login');
  const { userId } = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));

  const ticket = await db.ticket.findUnique({
    where: { id },
    include: {
      createdBy: true,
      assignedTo: true,
      asset: true,
      comments: {
        where: { isInternal: false }, // Kullanıcı iç notları göremez!
        include: { user: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!ticket || ticket.createdById !== userId) {
    return <div className="p-6">Bilet bulunamadı veya yetkiniz yok.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/my-tickets`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{ticket.title}</h1>
          <p className="text-slate-500">Talep #{ticket.id.slice(-6).toUpperCase()} • {new Date(ticket.createdAt).toLocaleString('tr-TR')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
        <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs text-slate-500 block">Durum</span>
            <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
              ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50' :
              ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50' :
              ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' :
              'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}>
              {ticket.status === 'OPEN' ? 'Açık' : 
               ticket.status === 'IN_PROGRESS' ? 'İşlemde' : 
               ticket.status === 'RESOLVED' ? 'Çözüldü' : 'Kapatıldı'}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">İlgili Cihaz</span>
            <span className="text-sm font-medium mt-1 block">{ticket.asset ? ticket.asset.brandModel : 'Yok'}</span>
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-2">Açıklama</h3>
        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{ticket.description}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-[500px]">
        <h3 className="font-semibold text-lg mb-4">Mesajlar</h3>
        
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {ticket.comments.map(comment => (
            <div key={comment.id} className={`flex flex-col ${comment.userId === userId ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                comment.userId === userId 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}>
                <div className={`text-xs mb-1 font-medium ${comment.userId === userId ? 'text-indigo-200' : 'text-slate-500'}`}>
                  {comment.userId === userId ? 'Siz' : comment.user.name}
                </div>
                <div className="whitespace-pre-wrap">{comment.content}</div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">{new Date(comment.createdAt).toLocaleString('tr-TR')}</span>
            </div>
          ))}
          {ticket.comments.length === 0 && (
            <div className="text-center text-slate-500 my-10">Henüz cevap verilmedi.</div>
          )}
        </div>

        <form 
          action={async (formData) => {
            'use server';
            const content = formData.get('content') as string;
            if (content.trim()) {
              // Users always add internal=false comments
              await addTicketComment(subdomain, ticket.id, userId, content, false);
            }
          }}
          className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              name="content"
              required
              disabled={ticket.status === 'CLOSED'}
              placeholder={ticket.status === 'CLOSED' ? "Bu talep kapatılmıştır." : "Mesajınızı yazın..."}
              className="flex-1 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={ticket.status === 'CLOSED'}
              className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shrink-0 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
