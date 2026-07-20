import { getTenantDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function MySignaturesPage({
  params
}: {
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params;
  
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session')?.value;
  if (!sessionCookie) redirect('/login');
  const { userId } = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));

  const db = await getTenantDb(subdomain);
  const forms = await db.assetForm.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { asset: true }
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">İmza Bekleyen Formlar & Geçmiş</h1>
        <p className="text-slate-500">Adınıza düzenlenmiş zimmet ve iade tutanakları.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4">İşlem Türü</th>
              <th className="px-6 py-4">İlgili Donanım</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4">Tarih</th>
              <th className="px-6 py-4 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {forms.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Şu an için tarafınıza ait bir form bulunmuyor.
                </td>
              </tr>
            ) : (
              forms.map(form => (
                <tr key={form.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                    {form.type === 'ASSIGN' ? 'Donanım Zimmet Tutanağı' : 'Donanım İade Tutanağı'}
                  </td>
                  <td className="px-6 py-4">
                    {form.asset.brandModel} <br/>
                    <span className="text-xs text-slate-500">{form.asset.demiRbasNo}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      form.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' :
                      form.status === 'SIGNED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {form.status === 'PENDING' ? 'İmza Bekliyor' : 
                       form.status === 'SIGNED' ? 'İmzalandı' : 'Reddedildi'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(form.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/my-signatures/${form.id}`} 
                      className={`inline-block px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        form.status === 'PENDING' 
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {form.status === 'PENDING' ? 'İmzala' : 'Görüntüle'}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
