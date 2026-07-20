import { getTenantDb } from '@/lib/db';
import { requirePermission } from '@/lib/auth';
import { UserForm } from '../UserForm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ subdomain: string, id: string }>;
}) {
  const resolvedParams = await params;
  await requirePermission('MANAGE_USERS');
  
  const db = await getTenantDb(resolvedParams.subdomain);
  
  const [user, roles, locations] = await Promise.all([
    db.user.findUnique({ where: { id: resolvedParams.id } }),
    db.role.findMany({ orderBy: { name: 'asc' } }),
    db.location.findMany({ orderBy: { name: 'asc' } })
  ]);

  if (!user) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/users`} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Çalışanı Düzenle</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{user.name} adlı çalışanın bilgilerini ve giriş yetkilerini güncelleyin.</p>
          </div>
        </div>

        <UserForm 
          subdomain={resolvedParams.subdomain} 
          roles={roles} 
          locations={locations}
          initialData={{
            id: user.id,
            name: user.name || '',
            email: user.email,
            title: user.title,
            canLogin: user.canLogin,
            roleId: user.roleId,
            managedLocationIds: user.managedLocationIds
          }}
        />
      </div>
    </div>
  );
}
