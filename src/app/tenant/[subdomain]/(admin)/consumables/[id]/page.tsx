import { ConsumableForm } from '../ConsumableForm';
import { requirePermission } from '@/lib/auth';
import { getTenantDb } from '@/lib/db';
import { ArrowLeft, History, Package } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StockManager } from './StockManager';

export default async function ConsumableDetailPage({
  params,
}: {
  params: Promise<{ subdomain: string; id: string }>;
}) {
  await requirePermission('MANAGE_CONSUMABLES');
  const resolvedParams = await params;
  const db = await getTenantDb(resolvedParams.subdomain);

  const consumable = await db.consumable.findUnique({
    where: { id: resolvedParams.id },
    include: {
      history: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!consumable) {
    notFound();
  }

  // Kullanıcıları stok çıkışı atamaları için çek
  const users = await db.user.findMany({
    orderBy: { name: 'asc' }
  });

  // Action history listesinde kullanıcı adlarını da gösterebilmek için dictionary yapıyoruz
  const userMap = users.reduce((acc, user) => {
    acc[user.id] = user.name;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href={`/consumables`}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{consumable.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Stok giriş/çıkış ve detay yönetimi.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              Malzeme Bilgileri
            </h2>
            <ConsumableForm 
              subdomain={resolvedParams.subdomain} 
              initialData={{
                id: consumable.id,
                name: consumable.name,
                category: consumable.category,
                minQuantity: consumable.minQuantity,
                cost: consumable.cost,
                notes: consumable.notes
              }}
            />
          </div>

          {/* Geçmiş Kayıtları (History) */}
          <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <History size={20} className="text-indigo-500" />
              Stok Hareketleri
            </h2>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {consumable.history.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  Hareket kaydı bulunmuyor.
                </div>
              ) : (
                consumable.history.map((record) => (
                  <div key={record.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className={`p-2 rounded-lg mt-1 ${record.actionType === 'ADD' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                      <Package size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                          {record.actionType === 'ADD' ? 'Stok Girişi' : 'Stok Çıkışı'}
                        </span>
                        <span className={`font-bold ${record.actionType === 'ADD' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {record.actionType === 'ADD' ? '+' : '-'}{record.quantity} adet
                        </span>
                      </div>
                      
                      {record.userId && (
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                          Verilen Kişi: <span className="text-indigo-600 dark:text-indigo-400">{userMap[record.userId] || 'Bilinmiyor'}</span>
                        </div>
                      )}
                      
                      {record.notes && (
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-2 bg-white dark:bg-slate-950 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          {record.notes}
                        </div>
                      )}
                      
                      <div className="text-[10px] text-slate-400 mt-2">
                        {new Date(record.createdAt).toLocaleString('tr-TR')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none sticky top-24">
            <StockManager 
              subdomain={resolvedParams.subdomain}
              consumableId={consumable.id}
              currentQuantity={consumable.quantity}
              users={users}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
