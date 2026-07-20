'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createTicket } from '@/app/actions/ticket';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTicketPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // We need userId from session. In a real app we might pass it via context or props from layout, 
  // or fetch it client-side. For simplicity, we can fetch it via an API or just decode the cookie if accessible.
  // Actually, we can just let a server component wrap this or send the form data to a Server Action and 
  // let the Server Action read the user ID from the session!
  
  // Wait, in `createTicket` action, we require `userId`. We should modify `createTicket` to automatically 
  // read the `userId` from the cookie inside the action so we don't have to pass it from the client.
  // Let me just send the other fields, but for now I'll use a wrapper approach if needed, or update the action.

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/my-tickets`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Yeni Destek Talebi</h1>
          <p className="text-slate-500">IT departmanına yeni bir talep veya arıza bildiriminde bulunun.</p>
        </div>
      </div>

      <form 
        action={async (formData) => {
          setLoading(true);
          setError('');
          
          // Action called directly
          const res = await fetch(`/api/tenant/${subdomain}/tickets`, {
            method: 'POST',
            body: JSON.stringify({
              title: formData.get('title'),
              description: formData.get('description'),
              priority: formData.get('priority'),
              assetId: formData.get('assetId') || undefined
            })
          });
          
          if (res.ok) {
            router.push(`/my-tickets`);
          } else {
            const data = await res.json();
            setError(data.error || 'Bir hata oluştu');
            setLoading(false);
          }
        }}
        className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-6"
      >
        {error && (
          <div className="p-4 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Konu <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Örn: Bilgisayarım açılmıyor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Detaylı Açıklama <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={5}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            placeholder="Lütfen yaşadığınız sorunu veya talebinizi detaylıca açıklayın..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Öncelik Durumu
            </label>
            <select
              name="priority"
              defaultValue="MEDIUM"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="LOW">Düşük</option>
              <option value="MEDIUM">Normal</option>
              <option value="HIGH">Yüksek</option>
              <option value="URGENT">Acil</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              İlgili Cihaz (Opsiyonel)
            </label>
            <input
              type="text"
              name="assetId"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Cihazın Demirbaş No'sunu girin (varsa)"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            {loading ? 'Gönderiliyor...' : 'Talebi Gönder'}
          </button>
        </div>
      </form>
    </div>
  );
}
