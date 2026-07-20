import { getTenantDb } from '@/lib/db';
import { requirePermission, getUserContext } from '@/lib/auth';
import Link from 'next/link';
import { AssetActionButtons } from '@/components/assets/AssetActionButtons';

import { FilterBar } from '@/components/ui/FilterBar';

export default async function AssetsPage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requirePermission('VIEW_ASSETS');
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const db = await getTenantDb(resolvedParams.subdomain);
  const userCtx = await getUserContext();
  
  const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined;
  const statusFilter = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : undefined;
  const categoryFilter = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;

  const whereClause: any = {};
  
  if (userCtx?.locationIds && userCtx.locationIds.length > 0) {
    whereClause.locationId = { in: userCtx.locationIds };
  }

  if (q) {
    whereClause.OR = [
      { brandModel: { contains: q } },
      { demiRbasNo: { contains: q } },
      { serialNo: { contains: q } }
    ];
  }
  
  if (statusFilter) {
    whereClause.status = statusFilter;
  }
  
  if (categoryFilter) {
    whereClause.categoryId = categoryFilter;
  }

  const assets = await db.asset.findMany({
    where: whereClause,
    include: {
      category: true,
      location: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  const categories = await db.assetCategory.findMany({ orderBy: { name: 'asc' } });
  
  const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));
  const statusOptions = [
    { label: 'Stokta', value: 'Stokta' },
    { label: 'Kullanımda', value: 'Kullanımda' },
    { label: 'Serviste', value: 'Serviste' },
    { label: 'Arızalı', value: 'Arızalı' },
    { label: 'Hurda', value: 'Hurda' },
    { label: 'Kayıp', value: 'Kayıp' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative z-50 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Varlık Envanteri</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Tüm donanım ve demirbaşlarınızı buradan yönetin.</p>
        </div>
        <AssetActionButtons subdomain={resolvedParams.subdomain} />
      </div>

      <FilterBar 
        searchPlaceholder="Cihaz Adı, Seri No veya Demirbaş No..."
        categoryOptions={categoryOptions}
        statusOptions={statusOptions}
      />

      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
                <th className="py-4 px-6">Demirbaş No</th>
                <th className="py-4 px-6">Kategori</th>
                <th className="py-4 px-6">Marka / Model</th>
                <th className="py-4 px-6">Lokasyon</th>
                <th className="py-4 px-6">Durum</th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 dark:text-slate-300">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    Henüz hiç varlık eklenmemiş.
                  </td>
                </tr>
              ) : (
                assets.map(asset => (
                  <tr key={asset.id} className="bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm group rounded-xl">
                    <td className="py-4 px-6 font-semibold text-indigo-600 dark:text-indigo-400 rounded-l-xl">
                      <Link href={`/assets/${asset.id}`} className="hover:underline">
                        {asset.demiRbasNo}
                      </Link>
                    </td>
                    <td className="py-4 px-6 font-medium">{asset.category.name}</td>
                    <td className="py-4 px-6">{asset.brandModel}</td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{asset.location.name}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide
                        ${asset.status === 'Kullanımda' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                          asset.status === 'Stokta' ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400' : 
                          asset.status === 'Serviste' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' : 
                          asset.status === 'Arızalı' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right rounded-r-xl">
                      <Link href={`/assets/${asset.id}`} className="inline-flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                        Detay
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
