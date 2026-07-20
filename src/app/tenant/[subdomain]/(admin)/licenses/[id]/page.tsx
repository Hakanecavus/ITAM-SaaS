import { LicenseForm } from '../LicenseForm';
import { requirePermission } from '@/lib/auth';
import { getTenantDb } from '@/lib/db';
import { ArrowLeft, UserMinus, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AssignmentManager } from './AssignmentManager';

export default async function LicenseDetailPage({
  params,
}: {
  params: Promise<{ subdomain: string; id: string }>;
}) {
  await requirePermission('MANAGE_LICENSES');
  const resolvedParams = await params;
  const db = await getTenantDb(resolvedParams.subdomain);

  const license = await db.license.findUnique({
    where: { id: resolvedParams.id },
    include: {
      assignments: {
        include: {
          user: true
        },
        orderBy: { assignedAt: 'desc' }
      }
    }
  });

  if (!license) {
    notFound();
  }

  // Fetch all active users to show in the dropdown for assignment
  const users = await db.user.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href={`/licenses`}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{license.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Lisans detaylarını ve kullanıcı atamalarını yönetin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              Lisans Bilgileri
            </h2>
            <LicenseForm 
              subdomain={resolvedParams.subdomain} 
              initialData={{
                id: license.id,
                name: license.name,
                key: license.key,
                seats: license.seats,
                purchaseCost: license.purchaseCost,
                purchaseDate: license.purchaseDate,
                expirationDate: license.expirationDate,
                notes: license.notes
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Users size={20} className="text-indigo-500" />
              Kullanıcı Atamaları
            </h2>
            
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-slate-500 dark:text-slate-400">Kapasite:</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {license.assignments.length} / {license.seats}
              </span>
            </div>

            <AssignmentManager 
              subdomain={resolvedParams.subdomain}
              licenseId={license.id}
              seats={license.seats}
              assignments={license.assignments}
              users={users}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
