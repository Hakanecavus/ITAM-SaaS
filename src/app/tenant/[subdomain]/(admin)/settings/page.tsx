import { requirePermission } from '@/lib/auth';
import { Settings, MapPin, Tag, Shield, FileText, Mail, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const resolvedParams = await params;
  await requirePermission('MANAGE_SETTINGS');

  const settingsCards = [
    {
      title: 'Kategoriler',
      description: 'Varlıklarınızı sınıflandırmak için yeni kategoriler ekleyin ve düzenleyin.',
      icon: Tag,
      href: '/settings/categories',
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    },
    {
      title: 'Lokasyonlar',
      description: 'Ofis, depo veya şube gibi cihazların bulunabileceği konumları yönetin.',
      icon: MapPin,
      href: '/settings/locations',
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    },
    {
      title: 'Rol ve Yetkiler',
      description: 'Çalışanlarınızın sistemde hangi sayfalara erişebileceğini ayarlayın.',
      icon: Shield,
      href: '/settings/roles',
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    },
    {
      title: 'Form Tasarımcısı',
      description: 'Cihaz zimmetlerken yazdırılan teslim tutanağının tasarımını düzenleyin.',
      icon: FileText,
      href: '/settings/form',
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    },
    {
      title: 'E-Posta (SMTP)',
      description: 'Zimmet bildirimleri için kendi SMTP sunucu ayarlarınızı yapılandırın.',
      icon: Mail,
      href: '/settings/smtp',
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    },
    {
      title: 'E-Posta Şablonu',
      description: 'Gönderilen bildirim e-postalarının metinlerini ve tasarımını özelleştirin.',
      icon: FileText,
      href: '/settings/email-template',
      color: 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-400',
    },
    {
      title: 'Abonelik & Fatura',
      description: 'Planınızı yükseltin, faturalarınızı görüntüleyin ve aboneliğinizi yönetin.',
      icon: CreditCard,
      href: '/settings/billing',
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
    },
    {
      title: 'Sistem Günlüğü',
      description: 'Sistemde yapılan tüm değişiklikleri, yönetici işlemlerini ve girişleri izleyin.',
      icon: Shield,
      href: '/settings/audit-logs',
      color: 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400',
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-slate-400" />
            Sistem Ayarları
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">ITAM sisteminizin temel yapılandırmalarını buradan yönetebilirsiniz.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} href={card.href} className="group bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 block">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${card.color}`}>
                <Icon size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {card.description}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  );
}
