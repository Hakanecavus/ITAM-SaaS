import { getTenantDb } from '@/lib/db';
import { createLocation } from '@/app/actions/settings';
import { LocationList } from '@/components/settings/LocationList';
import { requirePermission } from '@/lib/auth';

export default async function LocationsSettingsPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const resolvedParams = await params;
  await requirePermission('MANAGE_SETTINGS');
  const db = await getTenantDb(resolvedParams.subdomain);
  
  const locations = await db.location.findMany();

  const handleCreateLocation = async (formData: FormData) => {
    'use server';
    await createLocation(resolvedParams.subdomain, formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-6">
        <a href="/settings" className="p-2 text-slate-400 hover:text-indigo-600 bg-white/50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </a>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Lokasyon Yönetimi</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Cihazların bulunduğu binaları, ofisleri ve depoları düzenleyin.</p>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col h-full">
        <form action={handleCreateLocation} className="flex gap-3 mb-8">
          <input name="name" required placeholder="Yeni Lokasyon Adı (Örn: Kadıköy Şube)" 
            className="flex-1 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" />
          <button type="submit" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all">
            Ekle
          </button>
        </form>

        <LocationList locations={locations} subdomain={resolvedParams.subdomain} />
      </div>
    </div>
  );
}
