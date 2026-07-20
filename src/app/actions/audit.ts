'use server';

import { getTenantDb } from '@/lib/db';
import { headers } from 'next/headers';

export async function logSystemAction(
  subdomain: string,
  userId: string | null | undefined,
  actionType: string,
  moduleName: string,
  description: string,
  metadata?: any
) {
  try {
    const db = await getTenantDb(subdomain);
    
    // Get IP address from headers if available
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : realIp || null;

    await db.systemLog.create({
      data: {
        userId: userId || null,
        actionType,
        module: moduleName,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress
      }
    });
  } catch (error) {
    console.error(`[${subdomain}] Failed to log system action:`, error);
    // We intentionally don't throw here to avoid breaking the main user action
  }
}
