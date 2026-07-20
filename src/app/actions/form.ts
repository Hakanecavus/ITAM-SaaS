'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notification';

export async function createAssetForm(
  subdomain: string,
  assetId: string,
  userId: string,
  assignedById: string,
  type: 'ASSIGN' | 'RETURN',
  documentContent: string
) {
  const db = await getTenantDb(subdomain);

  const form = await db.assetForm.create({
    data: {
      assetId,
      userId,
      assignedById,
      type,
      status: 'PENDING',
      documentContent
    }
  });

  // Kullanıcıya bildirim gönder
  const asset = await db.asset.findUnique({ where: { id: assetId } });
  
  await createNotification(
    subdomain,
    userId,
    'E-İmza Talebi: Zimmet Formu',
    `BT departmanı tarafından size atanmak istenen "${asset?.brandModel}" cihazı için zimmet formu oluşturuldu. Lütfen imzalayarak onaylayın.`,
    'INFO',
    `/my-signatures/${form.id}`
  );

  revalidatePath(`/tenant/${subdomain}/assets/${assetId}`);
  revalidatePath(`/tenant/${subdomain}/my-signatures`);
  
  return { success: true, formId: form.id };
}

export async function signAssetForm(
  subdomain: string,
  formId: string,
  userId: string, // Kim imzalıyor
  signatureData: string // Base64 image
) {
  const db = await getTenantDb(subdomain);

  const form = await db.assetForm.findUnique({ where: { id: formId } });
  if (!form || form.userId !== userId) {
    throw new Error('Form bulunamadı veya yetkiniz yok');
  }

  if (form.status !== 'PENDING') {
    throw new Error('Bu form zaten imzalanmış veya reddedilmiş');
  }

  await db.$transaction(async (tx) => {
    // 1. Formu güncelle
    await tx.assetForm.update({
      where: { id: formId },
      data: {
        status: 'SIGNED',
        signatureData,
        signedAt: new Date()
      }
    });

    // 2. Cihazın durumunu güncelle ve History'e yaz
    if (form.type === 'ASSIGN') {
      await tx.asset.update({
        where: { id: form.assetId },
        data: {
          assignedUserId: form.userId,
          status: 'Kullanımda'
        }
      });

      await tx.assetHistory.create({
        data: {
          assetId: form.assetId,
          userId: form.userId,
          actionType: 'ASSIGN',
          notes: 'Kullanıcı tarafından e-imza ile onaylanıp teslim alındı.',
          documentUrl: `/assets/${form.assetId}/forms/${formId}`
        }
      });
    } else if (form.type === 'RETURN') {
      await tx.asset.update({
        where: { id: form.assetId },
        data: {
          assignedUserId: null,
          status: 'Stokta'
        }
      });

      await tx.assetHistory.create({
        data: {
          assetId: form.assetId,
          userId: form.userId,
          actionType: 'RETURN',
          notes: 'Kullanıcı tarafından e-imza ile iade edildi.',
          documentUrl: `/assets/${form.assetId}/forms/${formId}`
        }
      });
    }
  });

  // IT personeline (atanan kişiye) bildirim gönderilebilir (eğer formda assignedById varsa)
  if (form.assignedById) {
    const asset = await db.asset.findUnique({ where: { id: form.assetId } });
    await createNotification(
      subdomain,
      form.assignedById,
      'Zimmet İmzalandı',
      `${asset?.brandModel} cihazı için oluşturduğunuz zimmet formu onaylandı.`,
      'SUCCESS',
      `/assets/${form.assetId}`
    );
  }

  revalidatePath(`/tenant/${subdomain}/my-signatures`);
  revalidatePath(`/tenant/${subdomain}/my-assets`);
  revalidatePath(`/tenant/${subdomain}/assets/${form.assetId}`);

  return { success: true };
}

export async function rejectAssetForm(
  subdomain: string,
  formId: string,
  userId: string,
  reason: string
) {
  const db = await getTenantDb(subdomain);

  const form = await db.assetForm.findUnique({ where: { id: formId } });
  if (!form || form.userId !== userId) {
    throw new Error('Form bulunamadı veya yetkiniz yok');
  }

  await db.assetForm.update({
    where: { id: formId },
    data: {
      status: 'REJECTED'
    }
  });

  // IT personeline (atanan kişiye) bildirim
  if (form.assignedById) {
    const asset = await db.asset.findUnique({ where: { id: form.assetId } });
    await createNotification(
      subdomain,
      form.assignedById,
      'Zimmet Reddedildi',
      `${asset?.brandModel} cihazı için oluşturduğunuz zimmet formu reddedildi. Sebep: ${reason}`,
      'WARNING',
      `/assets/${form.assetId}`
    );
  }

  revalidatePath(`/tenant/${subdomain}/my-signatures`);
  revalidatePath(`/tenant/${subdomain}/assets/${form.assetId}`);

  return { success: true };
}
