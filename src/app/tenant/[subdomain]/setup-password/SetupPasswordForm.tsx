'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { changePassword } from '@/app/actions/auth';
import { Loader2 } from 'lucide-react';

export function SetupPasswordForm({ subdomain }: { subdomain: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const pass1 = formData.get('password') as string;
    const pass2 = formData.get('password_confirm') as string;

    if (!pass1 || pass1.length < 6) {
      toast.error('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    if (pass1 !== pass2) {
      toast.error('Şifreler eşleşmiyor. Lütfen kontrol edin.');
      return;
    }

    setIsLoading(true);

    try {
      // Sadece asıl şifreyi sunucuya yolla
      const submitData = new FormData();
      submitData.append('password', pass1);

      const result = await changePassword(submitData);
      
      if (result.error) {
        toast.error(result.error);
        setIsLoading(false);
      } else {
        toast.success('Şifreniz başarıyla oluşturuldu! Yönlendiriliyorsunuz...', { duration: 3000 });
        // İşlem bittikten sonra dashboard'a veya my-assets'e yönlendir
        setTimeout(() => {
          router.push(`/my-assets`);
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      toast.error('Beklenmeyen bir hata oluştu.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Yeni Şifreniz</label>
        <input 
          type="password" 
          name="password"
          required
          minLength={6}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
          placeholder="En az 6 karakter"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Yeni Şifreniz (Tekrar)</label>
        <input 
          type="password" 
          name="password_confirm"
          required
          minLength={6}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
          placeholder="Şifrenizi doğrulayın"
        />
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex justify-center items-center gap-2 disabled:opacity-70 mt-6"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Kaydediliyor...
          </>
        ) : (
          'Şifremi Kaydet ve Giriş Yap'
        )}
      </button>
    </form>
  );
}
