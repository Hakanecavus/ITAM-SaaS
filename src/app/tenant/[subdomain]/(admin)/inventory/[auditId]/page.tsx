import { getTenantDb } from '@/lib/db';
import { requirePermission } from '@/lib/auth';
import { AuditScanner } from '@/components/inventory/AuditScanner';
import { redirect } from 'next/navigation';

export default async function ResumeInventoryAuditPage({
  params,
}: {
  params: Promise<{ subdomain: string, auditId: string }>;
}) {
  await requirePermission('MANAGE_ASSETS');
  const resolvedParams = await params;
  const db = await getTenantDb(resolvedParams.subdomain);
  
  const audit = await db.inventoryAudit.findUnique({
    where: { id: resolvedParams.auditId }
  });

  if (!audit) {
    redirect(`/inventory`);
  }

  // Eğer tamamlanmışsa sadece yönlendir (veya sadece rapor gösterilebilir ama liste ekranı yeterli)
  if (audit.status === 'COMPLETED') {
    redirect(`/inventory`);
  }

  const locations = await db.location.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Fiziksel Sayıma Devam Et</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Yarım kalan sayımınıza kaldığınız yerden devam ediyorsunuz.</p>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden min-h-[600px]">
        <AuditScanner 
          subdomain={resolvedParams.subdomain} 
          locations={locations} 
          existingAudit={{ id: audit.id, locationId: audit.locationId }} 
        />
      </div>
    </div>
  );
}
