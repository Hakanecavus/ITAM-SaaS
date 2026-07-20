'use client';

import { useState } from 'react';
import { saveSmtpSettings } from '@/app/actions/settings';
import { Save, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SmtpForm({ subdomain, defaultValues }: { subdomain: string, defaultValues: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await saveSmtpSettings(subdomain, formData);
    
    if (res.error) {
      alert(res.error);
    } else {
      alert('Ayarlar başarıyla kaydedildi.');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">SMTP Sunucu (Host)</label>
          <input 
            name="SMTP_HOST" 
            defaultValue={defaultValues.SMTP_HOST}
            placeholder="smtp.example.com"
            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">SMTP Port</label>
          <input 
            name="SMTP_PORT" 
            defaultValue={defaultValues.SMTP_PORT}
            placeholder="587"
            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Güvenlik (SSL/TLS)</label>
          <select 
            name="SMTP_SECURE" 
            defaultValue={defaultValues.SMTP_SECURE}
            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            <option value="false">STARTTLS / TLS (Port 587)</option>
            <option value="true">SSL / TLS (Port 465)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Gönderen E-Posta (From)</label>
          <input 
            name="SMTP_FROM" 
            defaultValue={defaultValues.SMTP_FROM}
            placeholder="noreply@sirket.com"
            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="md:col-span-2">
          <hr className="border-slate-200 dark:border-slate-800 my-2" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">SMTP Kullanıcı Adı (Email)</label>
          <input 
            name="SMTP_USER" 
            defaultValue={defaultValues.SMTP_USER}
            placeholder="user@example.com"
            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">SMTP Şifre / Uygulama Şifresi</label>
          <input 
            type="password"
            name="SMTP_PASS" 
            defaultValue={defaultValues.SMTP_PASS}
            placeholder="••••••••"
            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

      </div>

      <div className="flex justify-end pt-4">
        <button 
          disabled={loading}
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </button>
      </div>

    </form>
  );
}
