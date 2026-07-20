'use client';

import { useState } from 'react';
import { PackagePlus, PackageMinus, Loader2 } from 'lucide-react';
import { addStock, consumeStock } from '@/app/actions/consumable';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
}

interface StockManagerProps {
  subdomain: string;
  consumableId: string;
  currentQuantity: number;
  users: User[];
}

export function StockManager({ subdomain, consumableId, currentQuantity, users }: StockManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'IN' | 'OUT'>('IN');

  const handleStockIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const quantity = parseInt(formData.get('quantity') as string, 10);
    const notes = formData.get('notes') as string;

    if (quantity <= 0) {
      toast.error('Lütfen 0\'dan büyük bir miktar girin.');
      return;
    }

    setLoading(true);
    try {
      const res = await addStock(subdomain, consumableId, quantity, notes);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`${quantity} adet stok eklendi.`);
        (e.target as HTMLFormElement).reset();
        router.refresh();
      }
    } catch (error) {
      toast.error('Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleStockOut = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const quantity = parseInt(formData.get('quantity') as string, 10);
    const targetUserId = formData.get('targetUserId') as string;
    const notes = formData.get('notes') as string;

    if (quantity <= 0) {
      toast.error('Lütfen 0\'dan büyük bir miktar girin.');
      return;
    }

    if (quantity > currentQuantity) {
      toast.error(`Stokta sadece ${currentQuantity} adet var.`);
      return;
    }

    if (!targetUserId) {
      toast.error('Lütfen malzemeyi teslim alan kişiyi seçin.');
      return;
    }

    setLoading(true);
    try {
      const res = await consumeStock(subdomain, consumableId, quantity, targetUserId, notes);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`${quantity} adet stok çıkışı yapıldı.`);
        (e.target as HTMLFormElement).reset();
        router.refresh();
      }
    } catch (error) {
      toast.error('Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
        Stok İşlemleri
      </h2>

      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
        <span className="text-sm text-slate-500 dark:text-slate-400">Mevcut Stok:</span>
        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
          {currentQuantity}
        </span>
      </div>

      <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('IN')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'IN' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Giriş (Ekle)
        </button>
        <button
          onClick={() => setActiveTab('OUT')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'OUT' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Çıkış (Düş)
        </button>
      </div>

      {activeTab === 'IN' && (
        <form onSubmit={handleStockIn} className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Miktar (Adet)</label>
            <input 
              type="number" 
              name="quantity"
              min="1"
              required
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white"
              placeholder="Eklenecek miktar"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Not / Fatura No vb. (Opsiyonel)</label>
            <textarea 
              name="notes"
              rows={2}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white resize-none"
              placeholder="Alım ile ilgili not..."
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <PackagePlus size={18} />}
            Stok Ekle
          </button>
        </form>
      )}

      {activeTab === 'OUT' && (
        <form onSubmit={handleStockOut} className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Miktar (Adet)</label>
            <input 
              type="number" 
              name="quantity"
              min="1"
              max={currentQuantity}
              required
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-900 dark:text-white"
              placeholder="Düşülecek miktar"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Kime Verildi? *</label>
            <select 
              name="targetUserId"
              required
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-900 dark:text-white"
            >
              <option value="">Çalışan Seçin...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Not / Açıklama (Opsiyonel)</label>
            <textarea 
              name="notes"
              rows={2}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-900 dark:text-white resize-none"
              placeholder="Teslimat notu..."
            />
          </div>
          <button 
            type="submit"
            disabled={loading || currentQuantity <= 0}
            className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <PackageMinus size={18} />}
            Stok Çıkışı Yap
          </button>
        </form>
      )}
    </div>
  );
}
