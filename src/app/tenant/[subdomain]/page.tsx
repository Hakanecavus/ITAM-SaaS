import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function TenantRootPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const session = await requireAuth();
  const resolvedParams = await params;
  
  if (session.role === 'ADMIN') {
    redirect(`/dashboard`);
  } else {
    redirect(`/my-assets`);
  }
}
