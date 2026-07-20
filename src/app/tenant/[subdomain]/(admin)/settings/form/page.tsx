import { getTenantSettings, saveTenantSettings } from '@/app/actions/settings';
import { redirect } from 'next/navigation';
import { FormLayoutBuilder } from '@/components/settings/FormLayoutBuilder';

export default async function FormBuilderPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const resolvedParams = await params;
  const settings = await getTenantSettings(resolvedParams.subdomain);

  const handleSave = async (formData: FormData) => {
    'use server';
    await saveTenantSettings(resolvedParams.subdomain, formData);
    redirect('/settings');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
        <div className="flex items-center gap-4 mb-8">
          <a href="/settings" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Gelişmiş Form Tasarımcısı</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Zimmet formunu firmanızın yasal ve görsel kimliğine tam uygun hale getirin.</p>
          </div>
        </div>

        <form action={handleSave} className="space-y-8">
          
          {/* Antet ve Logo */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">1. Antet ve Şirket Kimliği</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Şirket Ünvanı / Başlık</label>
                <input name="companyName" defaultValue={settings.companyName || ''} placeholder="Örn: BİLİŞİM TEKNOLOJİLERİ A.Ş." 
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bilgisayardan Logo Yükle</label>
                <input type="file" name="logoFile" accept="image/*" 
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400" />
                <p className="text-xs text-slate-500 mt-2">Önerilen formatlar: PNG, JPG, SVG.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">VEYA Logo Bağlantısı (URL)</label>
                <input name="companyLogoUrl" defaultValue={settings.companyLogoUrl || ''} placeholder="https://firma.com/logo.png" 
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              
              {settings.companyLogoUrl && (
                <div className="md:col-span-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center gap-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Mevcut Logo:</p>
                  <img src={settings.companyLogoUrl} alt="Logo Preview" className="h-12 object-contain rounded" />
                </div>
              )}
            </div>
          </div>

          {/* Form Ayarları */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">2. Görünüm Ayarları</h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="showSerialNo" defaultChecked={settings.showSerialNo !== 'false'} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cihazın Seri Numarasını Formda Göster</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="showNotes" defaultChecked={settings.showNotes !== 'false'} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">İşlem Notlarını Formda Göster (Eğer not girilmişse)</span>
              </label>
            </div>
          </div>

          {/* Metinler */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">3. Yasal Metinler ve Altbilgi</h2>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cihaz Teslim (Zimmet) Taahhütnamesi</label>
              <textarea name="assignTerms" rows={4} defaultValue={settings.assignTerms || ''} placeholder="Yukarıda detayları belirtilen cihazı, eksiksiz ve çalışır durumda teslim aldım..." 
                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cihaz İade Taahhütnamesi</label>
              <textarea name="returnTerms" rows={4} defaultValue={settings.returnTerms || ''} placeholder="Yukarıda detayları belirtilen cihaz, ilgili kullanıcıdan kontrol edilerek iade alınmış..." 
                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Sayfa Altbilgisi (Footer)</label>
              <textarea name="footerText" rows={2} defaultValue={settings.footerText || ''} placeholder="Örn: Bilişim Teknolojileri A.Ş. | Adres: ... | Telefon: ..." 
                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y text-sm" />
              <p className="text-xs text-slate-500 mt-2">Bu metin formun en altında (imzaların altında) küçük boyutta yer alacaktır. İletişim, sicil no gibi bilgiler için idealdir.</p>
            </div>
          </div>

          {/* Form Bölümleri Sıralaması */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">4. Form Bölümleri ve Sıralama</h2>
            <p className="text-sm text-slate-500 mb-4">Zimmet formunun (tutanağın) üzerindeki başlıkların hangi sırayla gösterileceğini aşağıdan belirleyebilirsiniz.</p>
            
            <FormLayoutBuilder initialLayoutStr={settings.formLayout} />
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all">
              Tasarımı ve Ayarları Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
