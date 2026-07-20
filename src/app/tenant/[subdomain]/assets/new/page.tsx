import { getTenantDb } from '@/lib/db';
import { requirePermission } from '@/lib/auth';
import { createAsset } from '@/app/actions/asset';
import { redirect } from 'next/navigation';
import { DynamicCustomFields } from '@/components/DynamicCustomFields';

export default async function NewAssetPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  await requirePermission('MANAGE_ASSETS');
  const resolvedParams = await params;
  const db = await getTenantDb(resolvedParams.subdomain);
  
  const categories = await db.assetCategory.findMany();
  const locations = await db.location.findMany();

  const handleCreate = async (formData: FormData) => {
    'use server';
    const result = await createAsset(resolvedParams.subdomain, formData);
    if (result.success) {
      redirect(`/assets`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Yeni Varlık Ekle</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Envantere yeni bir cihaz veya donanım kaydedin.</p>
        
        <form action={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Demirbaş No</label>
              <input name="demiRbasNo" required placeholder="Örn: IT-LAP-001" 
                className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Seri No</label>
              <input name="serialNo" placeholder="Örn: 5CD123456" 
                className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Kategori</label>
                {categories.length === 0 && <a href="/settings" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Oluştur</a>}
              </div>
              <select name="categoryId" required disabled={categories.length === 0} className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-50">
                <option value="">{categories.length === 0 ? 'Önce kategori oluşturun →' : 'Seçiniz...'}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Lokasyon</label>
                {locations.length === 0 && <a href="/settings" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Oluştur</a>}
              </div>
              <select name="locationId" required disabled={locations.length === 0} className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-50">
                <option value="">{locations.length === 0 ? 'Önce lokasyon oluşturun →' : 'Seçiniz...'}</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Marka / Model</label>
              <input name="brandModel" required placeholder="Örn: Apple MacBook Pro 16" 
                className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" />
            </div>
            
            {/* Phase 4 & 5: Lifecycle, Warranty and Financial */}
            <div className="md:col-span-2 border-t border-slate-200 dark:border-slate-800 pt-6 mt-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Satın Alma, Garanti ve Amortisman (Opsiyonel)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Satın Alma Tarihi</label>
                  <input type="date" name="purchaseDate" 
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Satın Alma Maliyeti (₺)</label>
                  <input type="number" step="0.01" name="purchaseCost" placeholder="Örn: 45000" 
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Garanti Bitiş Tarihi</label>
                  <input type="date" name="warrantyEnd" 
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" title="Amortisman süresi sonunda cihazın kalıntı değeri">Hurda Değeri (₺)</label>
                  <input type="number" step="0.01" name="salvageValue" placeholder="Örn: 5000" 
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" title="Cihazın ekonomik ömrü">Faydalı Ömür (Yıl)</label>
                  <input type="number" step="1" name="usefulLifeYears" placeholder="Örn: 5" 
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
                </div>
              </div>
            </div>

            {/* Phase 9: Dynamic Custom Fields */}
            <DynamicCustomFields />
          </div>
          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all">
              Varlığı Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
