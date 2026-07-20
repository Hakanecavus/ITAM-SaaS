import { requirePermission } from '@/lib/auth';
import { Mail, ArrowLeft, Settings2, FileText } from 'lucide-react';
import Link from 'next/link';
import { getEmailTemplates, getEmailRules } from '@/app/actions/settings';
import { EmailSettingsManager } from './EmailSettingsManager';

export default async function EmailTemplatePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  await requirePermission('MANAGE_SETTINGS');
  const resolvedParams = await params;
  
  const templates = await getEmailTemplates(resolvedParams.subdomain);
  const rules = await getEmailRules(resolvedParams.subdomain);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/settings`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <Mail className="w-7 h-7 text-fuchsia-500" />
            E-Posta Şablonları ve Kurallar
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Sistemdeki olaylara (Zimmetleme, İade vb.) göre hangi e-posta şablonlarının kullanılacağını yönetin.</p>
        </div>
      </div>

      <EmailSettingsManager 
        subdomain={resolvedParams.subdomain}
        initialTemplates={templates}
        initialRules={rules}
      />

    </div>
  );
}
