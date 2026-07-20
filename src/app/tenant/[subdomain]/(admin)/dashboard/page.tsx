import { getDashboardStats } from '@/app/actions/dashboard';
import { DashboardClient } from './DashboardClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const resolvedParams = await params;
  const data = await getDashboardStats(resolvedParams.subdomain);

  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
      }
    >
      <DashboardClient data={data} subdomain={resolvedParams.subdomain} />
    </Suspense>
  );
}
