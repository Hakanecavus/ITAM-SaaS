import { LicenseForm } from '../LicenseForm';
import { requirePermission } from '@/lib/auth';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewLicensePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  await requirePermission('MANAGE_LICENSES');
  const resolvedParams = await params;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href={`/licenses`}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Yeni Lisans Ekle</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Sisteme yeni bir yazılım lisansı kaydedin.</p>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
        <LicenseForm subdomain={resolvedParams.subdomain} />
      </div>
    </div>
  );
}
