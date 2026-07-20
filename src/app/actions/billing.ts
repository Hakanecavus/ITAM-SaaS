'use server';

import { getSession } from '@/lib/auth';
import { masterDb } from '@/lib/db';

export async function getBillingInfo(subdomain: string) {
  const session = await getSession();
  if (!session) return null;

  const tenant = await masterDb.tenant.findUnique({
    where: { subdomain },
    select: {
      planName: true,
      subscriptionStatus: true,
      trialEndsAt: true,
      currentPeriodEnd: true
    }
  });

  return tenant;
}
