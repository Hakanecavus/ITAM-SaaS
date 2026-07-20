import { getTenantDb } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SignaturePad } from '@/components/assets/SignaturePad';

export default async function SignatureDetailPage({
  params
}: {
  params: Promise<{ subdomain: string; id: string }>
}) {
  const { subdomain, id } = await params;
  
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session')?.value;
  if (!sessionCookie) redirect('/login');
  const { userId } = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));

  const db = await getTenantDb(subdomain);
  const form = await db.assetForm.findUnique({
    where: { id },
    include: {
      asset: true,
      assignedBy: true
    }
  });

  if (!form) return notFound();
  
  // Eğer form bu kullanıcıya ait değilse ve admin değilse gösterme (Burada basitçe kullanıcıya ait mi diye bakıyoruz)
  // İleride adminlerin de görüntüleyebilmesi için auth.ts üzerinden yetki kontrolü yapılabilir.
  // Şimdilik adminler bu sayfaya gelmeyecek, onlar asset detay sayfasından imzaları görebilir.
  if (form.userId !== userId) {
    return <div className="p-8 text-center text-red-500">Bu formu görüntüleme yetkiniz yok.</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/my-signatures`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {form.type === 'ASSIGN' ? 'Donanım Zimmet Tutanağı' : 'Donanım İade Tutanağı'}
          </h1>
          <p className="text-slate-500">Tarih: {new Date(form.createdAt).toLocaleDateString('tr-TR')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
        
        {/* Sözleşme Metni */}
        <div 
          className="prose prose-slate max-w-none mb-12 text-slate-800"
          dangerouslySetInnerHTML={{ __html: form.documentContent?.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') || '' }}
        />

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">
            Kullanıcı Onayı ve E-İmza
          </h3>

          {form.status === 'PENDING' ? (
            <SignaturePad subdomain={subdomain} formId={form.id} userId={userId} />
          ) : form.status === 'SIGNED' ? (
            <div className="flex flex-col items-center p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl">
              <div className="text-emerald-700 dark:text-emerald-400 font-bold mb-4">Bu form tarafınızca imzalanmış ve onaylanmıştır.</div>
              {form.signatureData && (
                <div className="bg-white dark:bg-white rounded-lg p-4 border border-emerald-100 dark:border-none shadow-sm">
                  <img src={form.signatureData} alt="İmza" className="h-32 object-contain" />
                </div>
              )}
              <div className="text-xs text-slate-500 mt-4">İmza Tarihi: {form.signedAt?.toLocaleString('tr-TR')}</div>
            </div>
          ) : (
            <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl text-center">
              <div className="text-red-700 dark:text-red-400 font-bold">Bu formu imzalamayı reddettiniz.</div>
              <div className="text-sm text-red-600/80 dark:text-red-400/80 mt-2">IT departmanı ile iletişime geçebilirsiniz.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
