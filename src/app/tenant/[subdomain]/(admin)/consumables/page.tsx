import { getTenantDb } from '@/lib/db';
import Link from 'next/link';
import { requirePermission } from '@/lib/auth';
import { AlertTriangle, Package } from 'lucide-react';

import { FilterBar } from '@/components/ui/FilterBar';

export default async function ConsumablesPage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requirePermission('VIEW_CONSUMABLES');
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const db = await getTenantDb(resolvedParams.subdomain);
  
  const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined;
  const categoryFilter = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;
  const statusFilter = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : undefined;

  const whereClause: any = {};
  
  if (q) {
    whereClause.name = { contains: q };
  }
  
  if (categoryFilter) {
    whereClause.category = categoryFilter;
  }
  
  // Custom logic for statusFilter in consumables
  if (statusFilter === 'LOW_STOCK') {
    // Note: Prisma has some limitations comparing fields directly in where.
    // Let's fetch all matching category/q and then filter in JS, since consumables list is small.
  }

  let consumables = await db.consumable.findMany({
    where: {
      ...(q ? { name: { contains: q } } : {}),
      ...(categoryFilter ? { category: categoryFilter } : {})
    },
    orderBy: { name: 'asc' }
  });

  if (statusFilter === 'LOW_STOCK') {
    consumables = consumables.filter(item => item.quantity <= item.minQuantity);
  }

  // Get unique categories for filter
  const allConsumables = await db.consumable.findMany({ select: { category: true } });
  const uniqueCategories = Array.from(new Set(allConsumables.map(c => c.category).filter(Boolean)));
  const categoryOptions = uniqueCategories.map(c => ({ label: c, value: c }));
  const statusOptions = [
    { label: 'Kritik Stokta', value: 'LOW_STOCK' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Sarf Malzemeleri</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Stokta bulunan klavye, mouse, toner gibi malzemeleri yönetin.</p>
        </div>
        <Link 
          href={`/consumables/new`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 whitespace-nowrap"
        >
          + Yeni Malzeme Ekle
        </Link>
      </div>

      <FilterBar 
        searchPlaceholder="Malzeme Adı..."
        categoryOptions={categoryOptions}
        statusOptions={statusOptions}
      />

      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Malzeme Adı</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Mevcut Stok</th>
                <th className="px-6 py-4">Maliyet</th>
                <th className="px-6 py-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {consumables.map(item => {
                const isLowStock = item.quantity <= item.minQuantity;
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isLowStock ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                        <Package size={18} />
                      </div>
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {item.category}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-lg ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {item.quantity}
                        </span>
                        {isLowStock && (
                          <div className="flex items-center gap-1 text-xs text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full font-medium">
                            <AlertTriangle size={12} />
                            Kritik
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Min: {item.minQuantity}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {item.cost ? `${item.cost.toLocaleString('tr-TR')} ₺` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/consumables/${item.id}`}
                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        Detay & Stok
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {consumables.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Sistemde kayıtlı sarf malzemesi bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
