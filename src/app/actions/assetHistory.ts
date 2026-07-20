'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function assignAsset(subdomain: string, assetId: string, formData: FormData) {
  try {
    const db = await getTenantDb(subdomain);
    const notes = formData.get('notes') as string | null;
    const userId = formData.get('userId') as string;

    if (!userId) {
      return { error: 'Kullanıcı seçimi zorunludur.' };
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { error: 'Geçersiz kullanıcı.' };
    }

    // 1. Asset'i güncelle
    const updatedAsset = await db.asset.update({
      where: { id: assetId },
      data: { 
        assignedUserId: user.id,
        status: 'Kullanımda' 
      }
    });

    // 2. History kaydı oluştur
    await db.assetHistory.create({
      data: {
        assetId,
        userId: user.id,
        actionType: 'ASSIGN',
        notes: notes || 'Zimmetlendi'
      }
    });

    // 3. E-Posta Bildirimi Gönder
    try {
      const { sendActionEmail } = await import('@/lib/mail');
      await sendActionEmail(
        subdomain,
        'ASSIGN',
        user.email,
        user.name,
        updatedAsset.brandModel,
        updatedAsset.demiRbasNo,
        subdomain.toUpperCase() // For company name display
      );
    } catch (e) {
      console.error('Mail gönderme hatası:', e);
      // E-posta hatası işlemi iptal etmemeli
    }

    revalidatePath(`/tenant/${subdomain}/assets/${assetId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Assign Error:', error);
    return { error: 'Zimmet işlemi başarısız.' };
  }
}

export async function returnAsset(subdomain: string, assetId: string, formData: FormData) {
  try {
    const db = await getTenantDb(subdomain);
    const notes = formData.get('notes') as string | null;

    const asset = await db.asset.findUnique({ where: { id: assetId }});
    if (!asset || !asset.assignedUserId) {
      return { error: 'Bu cihaz zaten zimmetli değil.' };
    }

    const previousUserId = asset.assignedUserId;

    // 1. Asset'i boşa çıkar
    await db.asset.update({
      where: { id: assetId },
      data: { 
        assignedUserId: null,
        status: 'Stokta' 
      }
    });

    // 2. History kaydı oluştur
    await db.assetHistory.create({
      data: {
        assetId,
        userId: previousUserId,
        actionType: 'RETURN',
        notes: notes || 'İade alındı'
      }
    });

    if (previousUserId) {
      try {
        const user = await db.user.findUnique({ where: { id: previousUserId } });
        if (user) {
          const { sendActionEmail } = await import('@/lib/mail');
          await sendActionEmail(
            subdomain,
            'RETURN',
            user.email,
            user.name,
            asset.brandModel,
            asset.demiRbasNo,
            subdomain.toUpperCase()
          );
        }
      } catch (e) {
        console.error('Mail gönderme hatası:', e);
      }
    }

    revalidatePath(`/tenant/${subdomain}/assets/${assetId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Return Error:', error);
    return { error: 'İade işlemi başarısız.' };
  }
}

export async function updateAssetStatus(subdomain: string, assetId: string, formData: FormData) {
  try {
    const db = await getTenantDb(subdomain);
    const newStatus = formData.get('status') as string;
    const notes = formData.get('notes') as string | null;

    if (!newStatus) return { error: 'Durum seçilmelidir.' };

    const asset = await db.asset.findUnique({ where: { id: assetId }});
    if (!asset) return { error: 'Varlık bulunamadı.' };

    const previousUserId = asset.assignedUserId;
    
    // If we are changing to something that means it's not usable, we unassign it.
    // Except if it's changing back to 'Kullanımda' (which shouldn't happen here, that's assignAsset).
    const shouldUnassign = newStatus !== 'Kullanımda' && previousUserId !== null;

    await db.asset.update({
      where: { id: assetId },
      data: { 
        status: newStatus,
        ...(shouldUnassign ? { assignedUserId: null } : {})
      }
    });

    const actionType = newStatus === 'Hurda' || newStatus === 'Kayıp' ? 'RETIRE' : 'STATUS_CHANGE';
    await db.assetHistory.create({
      data: {
        assetId,
        userId: previousUserId, // Record who had it when it broke/got lost, or null
        actionType: actionType,
        notes: notes || `Durum güncellendi: ${newStatus}`
      }
    });

    if (previousUserId) {
      try {
        const user = await db.user.findUnique({ where: { id: previousUserId } });
        if (user) {
          const { sendActionEmail } = await import('@/lib/mail');
          await sendActionEmail(
            subdomain,
            actionType,
            user.email,
            user.name,
            asset.brandModel,
            asset.demiRbasNo,
            subdomain.toUpperCase()
          );
        }
      } catch (e) {
        console.error('Mail gönderme hatası:', e);
      }
    }

    revalidatePath(`/tenant/${subdomain}/assets/${assetId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Update Status Error:', error);
    return { error: 'Durum güncelleme başarısız.' };
  }
}
