'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLicense, updateLicense } from '@/app/actions/license';
import toast from 'react-hot-toast';

interface LicenseFormProps {
  subdomain: string;
  initialData?: {
    id: string;
    name: string;
    key: string | null;
    seats: number;
    purchaseCost: number | null;
    purchaseDate: Date | null;
    expirationDate: Date | null;
    notes: string | null;
  };
}

export function LicenseForm({ subdomain, initialData }: LicenseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Parse Dates safely
    const pDateStr = formData.get('purchaseDate') as string;
    const eDateStr = formData.get('expirationDate') as string;
    
    const data = {
      name: formData.get('name') as string,
      key: formData.get('key') as string || undefined,
      seats: parseInt(formData.get('seats') as string, 10),
      purchaseCost: formData.get('purchaseCost') ? parseFloat(formData.get('purchaseCost') as string) : undefined,
      purchaseDate: pDateStr ? new Date(pDateStr) : undefined,
      expirationDate: eDateStr ? new Date(eDateStr) : undefined,
      notes: formData.get('notes') as string || undefined,
    };

    try {
      const result = initialData 
        ? await updateLicense(subdomain, initialData.id, data)
        : await createLicense(subdomain, data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(initialData ? 'Lisans güncellendi!' : 'Lisans eklendi!');
        router.push(`/licenses`);
        router.refresh();
      }
    } catch (error) {
      toast.error('Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (date: Date | null | undefined) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Yazılım / Lisans Adı *</label>
          <input 
            type="text" 
            name="name" 
            required 
            defaultValue={initialData?.name}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
            placeholder="Örn: Office 365, Adobe Creative Cloud"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lisans Anahtarı (Key)</label>
          <input 
            type="text" 
            name="key" 
            defaultValue={initialData?.key || ''}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-mono text-sm"
            placeholder="XXXX-XXXX-XXXX-XXXX"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kapasite (Kişi Sayısı) *</label>
          <input 
            type="number" 
            name="seats" 
            min="1"
            required 
            defaultValue={initialData?.seats || 1}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Toplam Maliyet (TL)</label>
          <input 
            type="number" 
            name="purchaseCost" 
            step="0.01"
            min="0"
            defaultValue={initialData?.purchaseCost || ''}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Satın Alma Tarihi</label>
          <input 
            type="date" 
            name="purchaseDate" 
            defaultValue={formatDateForInput(initialData?.purchaseDate)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bitiş Tarihi</label>
          <input 
            type="date" 
            name="expirationDate" 
            defaultValue={formatDateForInput(initialData?.expirationDate)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Notlar</label>
          <textarea 
            name="notes" 
            rows={3}
            defaultValue={initialData?.notes || ''}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white resize-none"
            placeholder="Lisansla ilgili ek açıklamalar..."
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
