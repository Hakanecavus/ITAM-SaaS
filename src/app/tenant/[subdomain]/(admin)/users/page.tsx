import { getTenantDb } from '@/lib/db';
import Link from 'next/link';

export default async function UsersPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const resolvedParams = await params;
  const db = await getTenantDb(resolvedParams.subdomain);
  
  const users = await db.user.findMany({
    include: {
      role: true,
      _count: {
        select: { assets: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Çalışanlar</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Şirket personeli ve zimmetli varlık durumları.</p>
        </div>
        <a 
          href={`/users/new`}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
        >
          + Yeni Çalışan
        </a>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
                <th className="py-4 px-6">Ad Soyad</th>
                <th className="py-4 px-6">E-posta</th>
                <th className="py-4 px-6">Giriş / Rol</th>
                <th className="py-4 px-6 text-center">Zimmetli Varlıklar</th>
                <th className="py-4 px-6 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 dark:text-slate-300">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    Henüz hiç çalışan eklenmemiş.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm group rounded-xl">
                    <td className="py-4 px-6 rounded-l-xl">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
                        {user.title && <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.title}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6">{user.email}</td>
                    <td className="py-4 px-6">
                      {user.canLogin ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Sisteme Girebilir</span>
                          <span className="text-[10px] text-slate-500 uppercase">Rol: {(user as any).role?.name || 'Yok'}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Sadece Çalışan (Giremez)</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide
                        ${user._count.assets > 0 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {user._count.assets} Cihaz
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right rounded-r-xl">
                      <Link href={`/users/${user.id}`} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm">
                        Düzenle
                      </Link>
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
