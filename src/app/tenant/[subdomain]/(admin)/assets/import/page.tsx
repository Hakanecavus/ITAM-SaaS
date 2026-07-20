import { requirePermission } from '@/lib/auth';
import ImportWizard from '@/components/assets/ImportWizard';

export default async function ImportAssetsPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  await requirePermission('MANAGE_ASSETS');
  const resolvedParams = await params;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Excel İçe Aktarım Sihirbazı</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Envanter verilerinizi tek tıkla sisteme aktarın ve eşleştirin.</p>
        </div>
      </div>

      <ImportWizard subdomain={resolvedParams.subdomain} />
    </div>
  );
}
