import { getTenantDb } from '@/lib/db';
import { requirePermission } from '@/lib/auth';
import { RoleManager } from '@/components/settings/RoleManager';
import { PERMISSIONS } from '@/lib/permissions';

export default async function RolesSettingsPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const resolvedParams = await params;
  await requirePermission('MANAGE_ROLES');
  
  const db = await getTenantDb(resolvedParams.subdomain);
  
  const roles = await db.role.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: {
        select: { users: true }
      }
    }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
        <div className="flex items-center gap-4 mb-8">
          <a href="/settings" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Rol ve Yetki Yönetimi</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sisteme giriş yapabilen kullanıcılar için roller tanımlayın ve yetkilerini belirleyin.</p>
          </div>
        </div>

        <RoleManager 
          initialRoles={roles} 
          subdomain={resolvedParams.subdomain}
          availablePermissions={Object.keys(PERMISSIONS)}
        />
      </div>
    </div>
  );
}
