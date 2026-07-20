'use server';

import { getTenantDb } from '@/lib/db';
import { requireAuth, requirePermission } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function addMaintenanceRecord(subdomain: string, assetId: string, formData: FormData) {
  const session = await requireAuth();
  await requirePermission('MANAGE_ASSETS');
  
  const db = await getTenantDb(subdomain);

  const type = formData.get('type') as string;
  const provider = formData.get('provider') as string;
  const startDateStr = formData.get('startDate') as string;
  const costStr = formData.get('cost') as string;
  const details = formData.get('details') as string;

  const startDate = new Date(startDateStr);
  const cost = costStr ? parseFloat(costStr) : null;

  // Create Maintenance Record
  await db.maintenanceRecord.create({
    data: {
      assetId,
      type,
      provider,
      cost,
      details,
      startDate,
    }
  });

  // Optionally change asset status to 'Serviste' if it was 'Stokta' or 'Kullanımda'
  const asset = await db.asset.findUnique({ where: { id: assetId } });
  if (asset && asset.status !== 'Serviste') {
    await db.asset.update({
      where: { id: assetId },
      data: { status: 'Serviste' }
    });
    await db.assetHistory.create({
      data: {
        assetId,
        userId: session.userId,
        actionType: 'STATUS_CHANGE',
        notes: `Cihaz ${provider} firmasına servise/bakıma gönderildi.`
      }
    });
  }

  revalidatePath(`/tenant/${subdomain}/assets/${assetId}`);
}

export async function completeMaintenanceRecord(subdomain: string, recordId: string, assetId: string, formData: FormData) {
  const session = await requireAuth();
  await requirePermission('MANAGE_ASSETS');
  
  const db = await getTenantDb(subdomain);

  const endDateStr = formData.get('endDate') as string;
  const costStr = formData.get('cost') as string;
  const invoiceNo = formData.get('invoiceNo') as string;
  const statusUpdate = formData.get('statusUpdate') as string;

  const endDate = new Date(endDateStr);
  const cost = costStr ? parseFloat(costStr) : null;

  // Update Maintenance Record
  await db.maintenanceRecord.update({
    where: { id: recordId },
    data: {
      endDate,
      cost: cost !== null ? cost : undefined,
      invoiceNo: invoiceNo || undefined,
    }
  });

  // Update Asset Status
  const asset = await db.asset.findUnique({ where: { id: assetId } });
  if (asset && statusUpdate && statusUpdate !== asset.status) {
    await db.asset.update({
      where: { id: assetId },
      data: { status: statusUpdate }
    });

    await db.assetHistory.create({
      data: {
        assetId: assetId,
        userId: session.userId,
        actionType: 'STATUS_CHANGE',
        notes: `Servis süreci tamamlandı. Yeni Durum: ${statusUpdate}.`
      }
    });
  }

  revalidatePath(`/tenant/${subdomain}/assets/${assetId}`);
}

export async function updateMaintenanceDocument(subdomain: string, recordId: string, documentUrl: string, assetId: string) {
  const session = await requireAuth();
  await requirePermission('MANAGE_ASSETS');
  
  const db = await getTenantDb(subdomain);

  await db.maintenanceRecord.update({
    where: { id: recordId },
    data: { documentUrl }
  });

  revalidatePath(`/tenant/${subdomain}/assets/${assetId}`);
  return { success: true };
}
