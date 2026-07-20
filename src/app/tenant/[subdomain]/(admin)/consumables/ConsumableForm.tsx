'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createConsumable, updateConsumable } from '@/app/actions/consumable';
import toast from 'react-hot-toast';

interface ConsumableFormProps {
  subdomain: string;
  initialData?: {
    id: string;
    name: string;
    category: string;
    minQuantity: number;
    cost: number | null;
    notes: string | null;
    quantity?: number; // Only for new items
  };
}

export function ConsumableForm({ subdomain, initialData }: ConsumableFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      minQuantity: parseInt(formData.get('minQuantity') as string, 10),
      cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : undefined,
      notes: formData.get('notes') as string || undefined,
      quantity: initialData ? undefined : parseInt(formData.get('quantity') as string, 10) || 0,
    };

    try {
      const result = initialData 
        ? await updateConsumable(subdomain, initialData.id, data)
        : await createConsumable(subdomain, data as any);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(initialData ? 'Malzeme güncellendi!' : 'Malzeme eklendi!');
        router.push(`/consumables`);
        router.refresh();
      }
    } catch (error) {
      toast.error('Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Malzeme Adı *</label>
          <input 
            type="text" 
            name="name" 
            required 
            defaultValue={initialData?.name}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
            placeholder="Örn: HP Toner 85A"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kategori *</label>
          <input 
            type="text" 
            name="category" 
            required 
            defaultValue={initialData?.category}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
            placeholder="Örn: Toner, Kablo, Klavye"
          />
        </div>

        {!initialData && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Başlangıç Stoku *</label>
            <input 
              type="number" 
              name="quantity" 
              min="0"
              required 
              defaultValue="0"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Minimum Uyarı Limiti *</label>
          <input 
            type="number" 
            name="minQuantity" 
            min="0"
            required 
            defaultValue={initialData?.minQuantity || 5}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Birim Maliyeti (TL)</label>
          <input 
            type="number" 
            name="cost" 
            step="0.01"
            min="0"
            defaultValue={initialData?.cost || ''}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Notlar</label>
          <textarea 
            name="notes" 
            rows={3}
            defaultValue={initialData?.notes || ''}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white resize-none"
            placeholder="Ek bilgiler..."
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-5 py-2.5 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          İptal
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-colors disabled:opacity-70"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
}
