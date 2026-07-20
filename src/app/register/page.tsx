'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      companyName: formData.get('companyName'),
      subdomain: formData.get('subdomain'),
      email: formData.get('email'),
      userName: formData.get('userName'),
      password: formData.get('password'),
    };

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Bir hata oluştu');
      }

      setSuccess(`Kurulum başarılı! Yönlendiriliyorsunuz...`);
      
      // Yönlendirme (Localhost portunu dahil ediyoruz)
      setTimeout(() => {
        const port = window.location.port ? `:${window.location.port}` : '';
        const domain = window.location.hostname.replace('www.', '');
        window.location.href = `http://${data.subdomain}.${domain}${port}/dashboard`;
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex selection:bg-indigo-500/30">
      
      {/* Left Side - Brand & Features (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-50"></div>
        {/* Glow effect */}
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <Link href="/" className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white text-xl">IT</span>
            </div>
            ITAM<span className="text-indigo-400">SaaS</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Dakikalar içinde<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">modern varlık yönetimine</span> geçin.
          </h1>
          <div className="space-y-6 text-slate-300">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-1">✓</div>
              <p>Firmanıza özel izole (Multi-Tenant) veritabanı altyapısı ile en üst düzey veri güvenliği.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-1">✓</div>
              <p>QR kod desteği ile varlıklarınızı saniyeler içinde sayın ve yönetin.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-1">✓</div>
              <p>Otomatik bakım hatırlatmaları ve yaşam döngüsü takibi ile maliyetlerinizi düşürün.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 z-[${5-i}]`}>
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              <span className="text-white font-bold">1000+</span> şirket bize güveniyor
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 lg:hidden bg-[url('/grid.svg')] bg-center opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[120px] lg:hidden"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="text-3xl font-black tracking-tighter flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">IT</span>
              </div>
              ITAM<span className="text-indigo-400">SaaS</span>
            </Link>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Hesabınızı Oluşturun</h2>
              <p className="text-slate-400 text-sm">14 günlük ücretsiz deneme sürümünüzü başlatın.</p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <p className="mt-0.5">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm flex items-start gap-3">
                <span className="text-lg">✅</span>
                <p className="mt-0.5">{success}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Firma Adı</label>
                <input 
                  name="companyName" 
                  required 
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all group-hover:border-slate-600" 
                  placeholder="Örn: Acme Corp" 
                />
              </div>
              
              <div className="group">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Çalışma Alanı (Subdomain)</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-700 group-hover:border-slate-600 focus-within:!border-transparent focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                  <input 
                    name="subdomain" 
                    required 
                    className="w-full px-4 py-3 bg-slate-900/50 text-white placeholder:text-slate-600 focus:outline-none" 
                    placeholder="acme" 
                  />
                  <div className="px-4 py-3 bg-slate-800 text-slate-400 border-l border-slate-700 flex items-center font-medium">
                    .itam.com
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent my-6"></div>

              <div className="group">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Yönetici Adı Soyadı</label>
                <input 
                  name="userName" 
                  required 
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all group-hover:border-slate-600" 
                  placeholder="John Doe" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">E-posta</label>
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all group-hover:border-slate-600" 
                    placeholder="john@acme.com" 
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Parola</label>
                  <input 
                    name="password" 
                    type="password" 
                    required 
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all group-hover:border-slate-600" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 transform hover:-translate-y-0.5 shadow-[0_0_30px_-10px_rgba(79,70,229,0.5)] flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Hesap Kuruluyor...
                  </>
                ) : 'Ücretsiz Hesabımı Oluştur'}
              </button>
            </form>
          </div>
          
          <p className="text-center mt-8 text-sm text-slate-400">
            Zaten bir hesabınız var mı?{' '}
            <Link href="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
              Giriş Yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
