import { requirePermission } from '@/lib/auth';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getSmtpSettings } from '@/app/actions/settings';
import { SmtpForm } from './SmtpForm';

export default async function SmtpSettingsPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  await requirePermission('MANAGE_SETTINGS');
  const resolvedParams = await params;
  
  const settings = await getSmtpSettings(resolvedParams.subdomain);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/settings`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <Mail className="w-7 h-7 text-indigo-500" />
            E-Posta (SMTP) Ayarları
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Sistem üzerinden gönderilecek bildirim e-postaları için SMTP sunucunuzu yapılandırın.</p>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl p-8 border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
        <SmtpForm subdomain={resolvedParams.subdomain} defaultValues={settings} />
      </div>

    </div>
  );
}
