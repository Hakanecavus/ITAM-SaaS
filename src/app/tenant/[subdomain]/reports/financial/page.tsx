import { getTenantDb } from '@/lib/db';
import { requirePermission } from '@/lib/auth';
import { FinancialCharts } from './FinancialCharts';

export default async function FinancialReportsPage({
  params
}: {
  params: Promise<{ subdomain: string }>
}) {
  await requirePermission('VIEW_FINANCE');
  const { subdomain } = await params;
  const db = await getTenantDb(subdomain);

  // Fetch all assets with financial data
  const assets = await db.asset.findMany({
    where: {
      purchaseCost: { not: null },
    },
    include: {
      category: true,
    }
  });

  const formattedAssets = assets.map(asset => ({
    id: asset.id,
    brandModel: asset.brandModel,
    categoryName: asset.category.name,
    purchaseCost: asset.purchaseCost || 0,
    salvageValue: asset.salvageValue || 0,
    usefulLifeYears: asset.usefulLifeYears || 0,
    purchaseDate: asset.purchaseDate,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Finansal Raporlar & Amortisman</h1>
        <p className="text-slate-500">Demirbaşlarınızın değer kayıplarını ve IT bütçenizi analiz edin.</p>
      </div>

      <FinancialCharts assets={formattedAssets} />
      
      {/* Detailed Assets Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-lg">Amortismana Tabi Varlıklar Listesi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Varlık</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Satın Alma Tarihi</th>
                <th className="px-6 py-4 text-right">Maliyet (₺)</th>
                <th className="px-6 py-4 text-right">Hurda Değ. (₺)</th>
                <th className="px-6 py-4 text-right">Ömür (Yıl)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {formattedAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Finansal bilgileri girilmiş varlık bulunamadı.
                  </td>
                </tr>
              ) : (
                formattedAssets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{asset.brandModel}</td>
                    <td className="px-6 py-4 text-slate-500">{asset.categoryName}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {asset.purchaseCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">
                      {asset.salvageValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">
                      {asset.usefulLifeYears || '-'}
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
