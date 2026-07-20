'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Giriş yapılamadı');
      }

      // Yönlendirme
      const port = window.location.port ? `:${window.location.port}` : '';
      let domain = window.location.hostname.replace('www.', '');
      
      // If we are already on a subdomain (e.g. erze.localhost), strip it to get the root domain
      // For localhost, the root is 'localhost'. For production, it might be 'itamsaas.com'
      const parts = domain.split('.');
      if (parts.length > 1 && parts[parts.length - 1] === 'localhost') {
        domain = 'localhost'; // Handle subdomain.localhost
      } else if (parts.length > 2) {
        domain = parts.slice(-2).join('.'); // Handle subdomain.domain.com
      }
      
      window.location.href = `http://${result.subdomain}.${domain}${port}/dashboard`;

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">IT</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Sisteme Giriş Yap</h2>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-posta Adresi</label>
            <input name="email" type="email" required className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="ornek@sirket.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Şifre</label>
            <input name="password" type="password" required className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="••••••••" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          Henüz hesabınız yok mu?{' '}
          <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
            Şirketini Kaydet
          </Link>
        </p>
      </div>
    </div>
  );
}
