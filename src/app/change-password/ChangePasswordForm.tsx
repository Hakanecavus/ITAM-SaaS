'use client';

import { useState } from 'react';
import { changePassword } from '@/app/actions/auth';
import { toast } from 'react-hot-toast';

export function ChangePasswordForm({ email, subdomain }: { email: string, subdomain: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirm = formData.get('confirm') as string;

    if (password !== confirm) {
      toast.error('Şifreler eşleşmiyor!');
      setIsSubmitting(false);
      return;
    }

    const res = await changePassword(formData);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Şifreniz başarıyla değiştirildi.');
      setTimeout(() => {
        window.location.href = `/tenant/${subdomain}/my-assets`;
      }, 1000);
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700">Yeni Şifre</label>
        <div className="mt-1">
          <input name="password" type="password" required 
            className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Yeni Şifre (Tekrar)</label>
        <div className="mt-1">
          <input name="confirm" type="password" required 
            className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
      </div>

      <div>
        <button type="submit" disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors">
          {isSubmitting ? 'Güncelleniyor...' : 'Şifreyi Güncelle ve Devam Et'}
        </button>
      </div>
    </form>
  );
}
