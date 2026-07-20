import { getTenantDb } from '@/lib/db';
import { notFound } from 'next/navigation';
import QRCode from 'react-qr-code';
import { assignAsset, returnAsset } from '@/app/actions/assetHistory';
import { AssetHistoryList } from '@/components/assets/AssetHistoryList';
import { MaintenanceRecordsList } from '@/components/assets/MaintenanceRecordsList';
import { PrintableLabel } from '@/components/ui/PrintableLabel';
import { PrintLabelButton } from '@/components/ui/PrintLabelButton';
import { DepreciationChart } from '@/components/assets/DepreciationChart';
import { getUserContext, hasPermission } from '@/lib/auth';

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ subdomain: string; id: string }>;
}) {
  const resolvedParams = await params;
  const db = await getTenantDb(resolvedParams.subdomain);
  
  const asset = await db.asset.findUnique({
    where: { id: resolvedParams.id },
    include: { category: true, location: true },
  });

  if (!asset) return notFound();

  const userCtx = await getUserContext();
  if (userCtx?.locationIds && userCtx.locationIds.length > 0) {
    if (!userCtx.locationIds.includes(asset.locationId)) {
      return notFound(); // Yetkisi dışındaki bir lokasyonun demirbaşı
    }
  }

  const canViewFinance = await hasPermission('VIEW_FINANCE');

  const history = await db.assetHistory.findMany({
    where: { assetId: asset.id },
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  const maintenanceRecords = await db.maintenanceRecord.findMany({
    where: { assetId: asset.id },
    orderBy: { startDate: 'desc' }
  });

  const users = await db.user.findMany({ orderBy: { name: 'asc' } });
  
  const pendingForms = await db.assetForm.findMany({
    where: { assetId: asset.id, status: 'PENDING' },
    include: { user: true }
  });

  const signedForms = await db.assetForm.findMany({
    where: { assetId: asset.id, status: 'SIGNED' },
    orderBy: { signedAt: 'desc' },
    include: { user: true }
  });

  const assetUrl = `https://${resolvedParams.subdomain}.itam.com/assets/${asset.id}`;

  const handleAssign = async (formData: FormData) => {
    'use server';
    await assignAsset(resolvedParams.subdomain, asset.id, formData);
  };

  const handleReturn = async (formData: FormData) => {
    'use server';
    await returnAsset(resolvedParams.subdomain, asset.id, formData);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Gizli Yazdırma Etiketi (Sadece Print Modunda Görünür) */}
      <PrintableLabel 
        assetId={assetUrl} 
        assetTag={asset.demiRbasNo} 
        assetName={asset.brandModel} 
        category={asset.category.name} 
        tenantName={resolvedParams.subdomain.toUpperCase()} 
      />

      {/* Header Card */}
      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl p-8 border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-4">
            {asset.brandModel}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold
              ${asset.status === 'Kullanımda' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                asset.status === 'Stokta' ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400' : 
                asset.status === 'Serviste' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' : 
                asset.status === 'Arızalı' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 
                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
              {asset.status}
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Demirbaş No: <span className="text-slate-700 dark:text-slate-300">{asset.demiRbasNo}</span></p>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <QRCode value={assetUrl} size={100} className="rounded-lg" />
          </div>
          <PrintLabelButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Info Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl p-8 border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Detaylı Bilgiler</h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kategori</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">{asset.category.name}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Lokasyon</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">{asset.location.name}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Seri No</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">{asset.serialNo || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kayıt Tarihi</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">{asset.createdAt.toLocaleDateString('tr-TR')}</p>
              </div>
              
              {/* Phase 4 additions */}
              {asset.purchaseDate && (
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Satın Alma Tarihi</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">{asset.purchaseDate.toLocaleDateString('tr-TR')}</p>
                </div>
              )}
              {canViewFinance && asset.purchaseCost && (
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Maliyet</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(asset.purchaseCost)}
                  </p>
                </div>
              )}
              {asset.warrantyEnd && (
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                    Garanti Bitiş
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{asset.warrantyEnd.toLocaleDateString('tr-TR')}</p>
                    {(() => {
                      const now = new Date();
                      const daysLeft = Math.ceil((asset.warrantyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      if (daysLeft < 0) {
                        return <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 rounded-md">SÜRESİ DOLDU</span>;
                      } else if (daysLeft <= 30) {
                        return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 rounded-md">YAKLAŞIYOR ({daysLeft} Gün)</span>;
                      }
                      return <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-md">DEVAM EDİYOR</span>;
                    })()}
                  </div>
                </div>
              )}

              {/* Phase 9 additions: Custom Fields */}
              {asset.customFields && (() => {
                try {
                  const fields = JSON.parse(asset.customFields) as Record<string, string>;
                  return Object.entries(fields).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{key}</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">{value}</p>
                    </div>
                  ));
                } catch (e) {
                  return null;
                }
              })()}
            </div>

            {/* Phase 5.2: Financial Depreciation Chart */}
            {canViewFinance && asset.purchaseCost && asset.usefulLifeYears && asset.purchaseDate && (
              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Amortisman Grafiği (Değer Kaybı)</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Satın Alma: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(asset.purchaseCost)} • 
                  Hurda: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(asset.salvageValue || 0)} • 
                  Ömür: {asset.usefulLifeYears} Yıl
                </p>
                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                  <DepreciationChart 
                    purchaseCost={asset.purchaseCost} 
                    salvageValue={asset.salvageValue || 0} 
                    usefulLifeYears={asset.usefulLifeYears} 
                    purchaseDate={asset.purchaseDate} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Card */}
          <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl p-8 border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Hızlı İşlemler</h2>
            


            {asset.status === 'Stokta' ? (
              <form action={handleAssign} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Zimmetlenecek Çalışan</label>
                    {users.length === 0 && <a href="/users/new" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Oluştur</a>}
                  </div>
                  <select name="userId" required disabled={users.length === 0}
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm disabled:opacity-50">
                    <option value="">{users.length === 0 ? 'Önce çalışan ekleyin →' : 'Kullanıcı seçin...'}</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Not (Opsiyonel)</label>
                  <input name="notes" placeholder="Durumla ilgili notlar..." 
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all">
                  Kullanıcıya Zimmetle
                </button>
              </form>
            ) : (
              <form action={handleReturn} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">İade Notu (Opsiyonel)</label>
                  <input name="notes" placeholder="Cihaz sağlam teslim alındı..." 
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all">
                  Stoğa İade Al
                </button>
              </form>
            )}

            <hr className="my-6 border-slate-200 dark:border-slate-800" />
            
            <form action={async (formData) => {
              'use server';
              const { updateAssetStatus } = await import('@/app/actions/assetHistory');
              await updateAssetStatus(resolvedParams.subdomain, asset.id, formData);
            }} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Durum Güncelle</h3>
              <div className="flex gap-2">
                <select name="status" required className="flex-1 p-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="">Seçiniz...</option>
                  <option value="Stokta">Stokta (Kullanıma Hazır)</option>
                  <option value="Serviste">Serviste / Bakımda</option>
                  <option value="Arızalı">Arızalı</option>
                  <option value="Hurda">Hurda (Emekliye Ayrıldı)</option>
                  <option value="Kayıp">Kayıp / Çalıntı</option>
                </select>
                <button type="submit" className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors">
                  Güncelle
                </button>
              </div>
              <input name="notes" placeholder="Durum değişikliği nedeni..." className="w-full p-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </form>
          </div>

          {/* Maintenance Records Card */}
          <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl p-8 border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none mt-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Bakım ve Servis Kayıtları</h2>
            
            <form action={async (formData) => {
              'use server';
              const { addMaintenanceRecord } = await import('@/app/actions/maintenance');
              await addMaintenanceRecord(resolvedParams.subdomain, asset.id, formData);
            }} className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Yeni Servis Kaydı Ekle</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">İşlem Tipi</label>
                  <select name="type" required className="w-full p-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="REPAIR">Arıza/Tamir</option>
                    <option value="MAINTENANCE">Periyodik Bakım</option>
                    <option value="UPGRADE">Donanım Yükseltme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Servis Firması</label>
                  <input name="provider" required placeholder="Firma Adı..." className="w-full p-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tarih</label>
                  <input type="date" name="startDate" required className="w-full p-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tutar (₺) - Opsiyonel</label>
                  <input type="number" step="0.01" name="cost" placeholder="0.00" className="w-full p-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Detay/Açıklama</label>
                  <input name="details" placeholder="Yapılan işlemler..." className="w-full p-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors">
                Kaydı Ekle
              </button>
            </form>

            <MaintenanceRecordsList records={maintenanceRecords} subdomain={resolvedParams.subdomain} assetId={asset.id} canViewFinance={canViewFinance} />
          </div>
        </div>

        {/* History Timeline */}
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl p-8 border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">İşlem Tarihçesi</h2>
          
          <AssetHistoryList history={history} subdomain={resolvedParams.subdomain} assetId={asset.id} />
        </div>

      </div>
    </div>
  );
}
