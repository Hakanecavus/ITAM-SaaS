import { getTenantDb } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { hasPermission } from '@/lib/auth';
import { PrintPageButton } from '@/components/ui/PrintPageButton';

export default async function AdminFormViewPage({
  params
}: {
  params: Promise<{ subdomain: string; id: string; formId: string }>
}) {
  const { subdomain, id, formId } = await params;
  
  const canManage = await hasPermission('MANAGE_ASSETS');
  if (!canManage) redirect(`/assets/${id}`);

  const db = await getTenantDb(subdomain);
  const form = await db.assetForm.findUnique({
    where: { id: formId, assetId: id },
    include: {
      asset: true,
      user: true,
      assignedBy: true
    }
  });

  if (!form) return notFound();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/assets/${id}`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Zimmet Formu Detayı
            </h1>
            <p className="text-slate-500">{form.user.name} - {form.asset.brandModel}</p>
          </div>
        </div>
        <PrintPageButton />
      </div>

      <div className="bg-white dark:bg-white text-slate-900 rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 print:shadow-none print:border-none print:p-0">
        
        <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
              {form.type === 'ASSIGN' ? 'Teslim Tutanağı' : 'İade Tutanağı'}
            </h2>
            <p className="text-slate-500 mt-2 font-medium">Kayıt No: #{form.id.slice(-6).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-lg text-slate-800">{subdomain.toUpperCase()} A.Ş.</h3>
            <p className="text-slate-500 text-sm">Bilgi İşlem Departmanı</p>
          </div>
        </div>

        <div 
          className="prose prose-slate max-w-none mb-12 text-slate-800"
          dangerouslySetInnerHTML={{ __html: form.documentContent?.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') || '' }}
        />

        <div className="grid grid-cols-2 gap-8 mt-16 pt-8 border-t border-slate-200">
          <div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Teslim Eden (IT)</h4>
            <p className="font-bold text-lg text-slate-900 mb-8">{form.assignedBy?.name || 'IT Departmanı'}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              {form.type === 'ASSIGN' ? 'Teslim Alan (Çalışan)' : 'İade Eden (Çalışan)'}
            </h4>
            <p className="font-bold text-lg text-slate-900 mb-2">{form.user.name}</p>
            
            <div className="h-32 border-b border-dashed border-slate-300 flex items-end pb-2">
              {form.status === 'SIGNED' && form.signatureData ? (
                <img src={form.signatureData} alt="İmza" className="max-h-28 object-contain" />
              ) : form.status === 'PENDING' ? (
                <span className="text-amber-500 font-medium italic">Bekliyor...</span>
              ) : (
                <span className="text-red-500 font-medium italic">Reddedildi</span>
              )}
            </div>
            {form.signedAt && (
              <p className="text-xs text-slate-500 mt-2">İmza Tarihi: {form.signedAt.toLocaleString('tr-TR')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
