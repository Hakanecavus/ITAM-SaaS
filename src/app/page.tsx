import Link from 'next/link';
import { ArrowRight, Box, QrCode, RefreshCcw, ShieldCheck, BarChart3, Users, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-[100px] rounded-full mix-blend-screen animate-pulse duration-3000"></div>
      </div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-l from-blue-600 to-cyan-500 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none"></div>
      
      {/* Glassmorphic Header */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 md:py-5 border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl transition-all">
        <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
            <span className="text-white text-xl">IT</span>
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">ITAM</span>
          <span className="text-indigo-400">SaaS</span>
        </div>
        <nav className="hidden md:flex gap-8 font-medium text-sm text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Özellikler</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">Nasıl Çalışır?</a>
          <a href="#pricing" className="hover:text-white transition-colors">Fiyatlandırma</a>
        </nav>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Giriş Yap
          </Link>
          <Link href="/register" className="group relative px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-semibold transition-all overflow-hidden">
            <span className="relative z-10 flex items-center gap-2 text-sm text-white">
              Ücretsiz Başla
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-40 pb-32 px-6 text-center max-w-5xl mx-auto min-h-screen">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-10 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)] backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          Yeni Nesil B2B SaaS Mimarisi
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          BT Varlıklarınızı <br className="hidden md:block" />
          <span className="relative inline-block">
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-2xl opacity-40"></span>
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              Tek Merkezden
            </span>
          </span> Yönetin
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
          Cihazlarınızı, lisanslarınızı ve donanımlarınızı Excel tablolarından kurtarın. Şirketinize özel izole altyapı ile dakikalar içinde modern varlık yönetimine geçiş yapın.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
          <Link
            href="/register"
            className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full font-bold transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="relative text-white flex items-center justify-center gap-2">
              Hemen Başla (14 Gün Ücretsiz)
              <Zap className="w-5 h-5 text-yellow-300" />
            </span>
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 bg-slate-900/40 border-y border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Neden ITAM SaaS?</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Eski usul yönetim araçlarını geride bırakın, veri güvenliğini ön planda tutan geleceğin teknolojisini kullanın.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-white/5 border border-white/10 p-10 rounded-3xl hover:bg-white/10 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-blue-500/10">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-200">İzole Veritabanı</h3>
              <p className="text-slate-400 leading-relaxed font-light">
                Her şirkete özel (Multi-Tenant) fiziksel veritabanı ayrımı. Verileriniz asla diğer şirketlerin verileriyle karışmaz. En üst düzey KVKK ve GDPR uyumluluğu.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white/5 border border-white/10 p-10 rounded-3xl hover:bg-white/10 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-purple-500/10">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-200">QR ve Barkod</h3>
              <p className="text-slate-400 leading-relaxed font-light">
                Tüm cihazlarınız için tek tıkla QR kod üretin. Mobil cihazınızla veya barkod okuyucuyla okutarak anında varlık kartına ulaşın ve sayım yapın.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white/5 border border-white/10 p-10 rounded-3xl hover:bg-white/10 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-emerald-500/10">
                <RefreshCcw className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-200">Yaşam Döngüsü</h3>
              <p className="text-slate-400 leading-relaxed font-light">
                Satın alma, depoya giriş, zimmetleme, arıza ve hurdaya ayırma gibi tüm süreçleri tek bir cihaz kartı üzerinden tarihçesiyle uçtan uca izleyin.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">İhtiyacınıza Uygun Planı Seçin</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Gizli ücret yok, sürpriz yok. 14 gün boyunca ücretsiz deneyin, dilediğiniz zaman paketinizi yükseltin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col hover:bg-white/10 transition-all duration-500">
              <h3 className="text-2xl font-bold mb-2 text-slate-200">Başlangıç</h3>
              <p className="text-slate-400 mb-8 text-sm">Küçük ekipler ve giriş seviyesi takip</p>
              <div className="mb-8 pb-8 border-b border-white/10">
                <span className="text-5xl font-black text-white">₺1,000</span>
                <span className="text-slate-500 font-medium">/ay</span>
              </div>
              <ul className="space-y-5 mb-10 flex-1 text-slate-300 font-medium text-sm">
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span> 500 Varlık Kapasitesi</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span> 3 Kullanıcı Hesabı</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span> Temel QR Kod Desteği</li>
                <li className="flex items-center gap-3 opacity-50"><span className="w-5 h-5 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-xs">✗</span> Gelişmiş Finansal Raporlar</li>
              </ul>
              <Link href="/register" className="w-full block text-center px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-semibold transition-all">
                Hemen Başla
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative bg-gradient-to-b from-indigo-900/50 to-slate-900/50 border-2 border-indigo-500/50 rounded-[2.5rem] p-10 flex flex-col transform md:-translate-y-6 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/30 border border-indigo-400/50">
                En Çok Tercih Edilen
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Profesyonel</h3>
              <p className="text-indigo-200/70 mb-8 text-sm">Büyüyen şirketler için tam kontrol</p>
              <div className="mb-8 pb-8 border-b border-indigo-500/20">
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">₺2,500</span>
                <span className="text-indigo-300/50 font-medium">/ay</span>
              </div>
              <ul className="space-y-5 mb-10 flex-1 text-slate-200 font-medium text-sm">
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">✓</span> 2.500 Varlık Kapasitesi</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">✓</span> Sınırsız Kullanıcı Hesabı</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">✓</span> Gelişmiş Finansal Raporlar</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">✓</span> E-posta Hatırlatmaları & Cron</li>
              </ul>
              <Link href="/register" className="w-full block text-center px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/25">
                14 Gün Ücretsiz Dene
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col hover:bg-white/10 transition-all duration-500">
              <h3 className="text-2xl font-bold mb-2 text-slate-200">Kurumsal</h3>
              <p className="text-slate-400 mb-8 text-sm">Büyük ölçekli karmaşık operasyonlar</p>
              <div className="mb-8 pb-8 border-b border-white/10">
                <span className="text-4xl font-black text-white">Özel</span>
                <span className="text-slate-500 font-medium block mt-2">Fiyatlandırma</span>
              </div>
              <ul className="space-y-5 mb-10 flex-1 text-slate-300 font-medium text-sm">
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span> Sınırsız Varlık & Kullanıcı</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span> Özel On-Premise Kurulum</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span> 7/24 Özel Destek</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span> API Erişimi & Entegrasyonlar</li>
              </ul>
              <a href="mailto:sales@itamsaas.com" className="w-full block text-center px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-semibold transition-all">
                Satış Ekibiyle İletişime Geç
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 text-center">
        <div className="text-2xl font-black tracking-tighter flex items-center justify-center gap-2 mb-6 opacity-50">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">IT</span>
          </div>
          <span className="text-slate-400">ITAM</span>
          <span className="text-indigo-400">SaaS</span>
        </div>
        <p className="text-slate-500 text-sm">© 2026 ITAM SaaS. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
