'use server';

import { getTenantDb } from '@/lib/db';
import { requirePermission } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateHistoryDocument(subdomain: string, historyId: string, documentUrl: string, assetId: string) {
  try {
    await requirePermission('MANAGE_ASSETS');
    
    const db = await getTenantDb(subdomain);

    await db.assetHistory.update({
      where: { id: historyId },
      data: { documentUrl }
    });

    revalidatePath(`/assets/${assetId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Update History Document Error:', error);
    return { error: 'Belge kaydedilirken bir hata oluştu.' };
  }
}
