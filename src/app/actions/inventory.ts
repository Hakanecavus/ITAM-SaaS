'use server';

import { getTenantDb } from '@/lib/db';
import { requireAuth, requirePermission } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getAllAssetCodes(subdomain: string) {
  await requirePermission('VIEW_ASSETS');
  const db = await getTenantDb(subdomain);
  
  const assets = await db.asset.findMany({
    select: {
      id: true,
      demiRbasNo: true,
      locationId: true
    }
  });
  return assets;
}

export async function getLocationAssets(subdomain: string, locationId: string) {
  await requirePermission('VIEW_ASSETS');
  const db = await getTenantDb(subdomain);
  
  return await db.asset.findMany({
    where: { locationId },
    include: {
      category: true,
      location: true
    }
  });
}

export async function startAudit(subdomain: string, locationId: string) {
  const session = await requireAuth();
  await requirePermission('MANAGE_ASSETS');
  
  const db = await getTenantDb(subdomain);
  
  const totalExpected = await db.asset.count({
    where: { locationId }
  });

  const audit = await db.inventoryAudit.create({
    data: {
      locationId,
      userId: session.userId,
      status: 'IN_PROGRESS',
      totalExpected
    }
  });

  return audit;
}

export async function completeAudit(
  subdomain: string, 
  auditId: string, 
  auditData: {
    totalFound: number;
    totalMissing: number;
    totalWrongLoc: number;
    totalUnknown: number;
    items: {
      assetId?: string;
      scannedCode: string;
      status: string; // "FOUND", "MISSING", "WRONG_LOCATION", "UNKNOWN"
    }[]
  }
) {
  const session = await requireAuth();
  await requirePermission('MANAGE_ASSETS');
  
  const db = await getTenantDb(subdomain);

  // 1. Audit kaydını güncelle
  const audit = await db.inventoryAudit.update({
    where: { id: auditId },
    data: {
      status: 'COMPLETED',
      totalFound: auditData.totalFound,
      totalMissing: auditData.totalMissing,
      totalWrongLoc: auditData.totalWrongLoc,
      totalUnknown: auditData.totalUnknown,
    }
  });

  // 2. AuditItem'ları ekle ve Durumları Güncelle
  for (const item of auditData.items) {
    await db.inventoryAuditItem.create({
      data: {
        auditId: audit.id,
        assetId: item.assetId || null,
        scannedCode: item.scannedCode,
        status: item.status,
        scannedAt: item.status !== 'MISSING' ? new Date() : null
      }
    });

    if (item.assetId) {
      if (item.status === 'MISSING') {
        // Eksik cihazları 'Kayıp' olarak işaretle
        await db.asset.update({
          where: { id: item.assetId },
          data: { status: 'Kayıp' }
        });
        
        await db.assetHistory.create({
          data: {
            assetId: item.assetId,
            userId: session.userId,
            actionType: 'STATUS_CHANGE',
            notes: `Fiziksel sayım (Audit #${audit.id.slice(-6)}) sonucunda KAYIP olarak işaretlendi.`
          }
        });
      } 
      else if (item.status === 'WRONG_LOCATION') {
        // Yanlış lokasyonda okutulan cihazın lokasyonunu düzelt
        await db.asset.update({
          where: { id: item.assetId },
          data: { locationId: audit.locationId }
        });

        await db.assetHistory.create({
          data: {
            assetId: item.assetId,
            userId: session.userId,
            actionType: 'STATUS_CHANGE',
            notes: `Fiziksel sayım (Audit #${audit.id.slice(-6)}) sırasında farklı lokasyonda bulundu ve lokasyonu güncellendi.`
          }
        });
      }
    }
  }

  revalidatePath(`/tenant/${subdomain}/inventory`);
  revalidatePath(`/tenant/${subdomain}/assets`);

  return { success: true };
}

export async function cancelAudit(subdomain: string, auditId: string) {
  const session = await requireAuth();
  await requirePermission('MANAGE_ASSETS');
  
  const db = await getTenantDb(subdomain);

  // If we just want to cancel and delete it completely
  await db.inventoryAudit.delete({
    where: { id: auditId }
  });

  revalidatePath(`/tenant/${subdomain}/inventory`);

  return { success: true };
}
