'use server';

import { getTenantDb } from '@/lib/db';
import { requirePermission } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createLicense(subdomain: string, data: {
  name: string;
  key?: string;
  seats: number;
  purchaseCost?: number;
  purchaseDate?: Date;
  expirationDate?: Date;
  notes?: string;
}) {
  await requirePermission('MANAGE_LICENSES');
  const db = await getTenantDb(subdomain);

  try {
    const license = await db.license.create({
      data: {
        name: data.name,
        key: data.key || null,
        seats: data.seats,
        purchaseCost: data.purchaseCost || null,
        purchaseDate: data.purchaseDate || null,
        expirationDate: data.expirationDate || null,
        notes: data.notes || null,
      }
    });

    revalidatePath(`/tenant/${subdomain}/licenses`);
    return { success: true, licenseId: license.id };
  } catch (error) {
    console.error('Create License Error:', error);
    return { error: 'Lisans eklenirken bir hata oluştu.' };
  }
}

export async function updateLicense(subdomain: string, id: string, data: {
  name: string;
  key?: string;
  seats: number;
  purchaseCost?: number;
  purchaseDate?: Date;
  expirationDate?: Date;
  notes?: string;
}) {
  await requirePermission('MANAGE_LICENSES');
  const db = await getTenantDb(subdomain);

  try {
    await db.license.update({
      where: { id },
      data: {
        name: data.name,
        key: data.key || null,
        seats: data.seats,
        purchaseCost: data.purchaseCost || null,
        purchaseDate: data.purchaseDate || null,
        expirationDate: data.expirationDate || null,
        notes: data.notes || null,
      }
    });

    revalidatePath(`/tenant/${subdomain}/licenses`);
    revalidatePath(`/tenant/${subdomain}/licenses/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Update License Error:', error);
    return { error: 'Lisans güncellenirken bir hata oluştu.' };
  }
}

export async function deleteLicense(subdomain: string, id: string) {
  await requirePermission('MANAGE_LICENSES');
  const db = await getTenantDb(subdomain);

  try {
    // Önce atamaları (assignments) sil
    await db.licenseAssignment.deleteMany({
      where: { licenseId: id }
    });

    // Sonra lisansı sil
    await db.license.delete({
      where: { id }
    });

    revalidatePath(`/tenant/${subdomain}/licenses`);
    return { success: true };
  } catch (error) {
    console.error('Delete License Error:', error);
    return { error: 'Lisans silinirken bir hata oluştu.' };
  }
}

export async function assignLicense(subdomain: string, licenseId: string, userId: string) {
  await requirePermission('MANAGE_LICENSES');
  const db = await getTenantDb(subdomain);

  try {
    // Lisansın kapasitesi (seats) dolmuş mu kontrol et
    const license = await db.license.findUnique({
      where: { id: licenseId },
      include: { assignments: true }
    });

    if (!license) return { error: 'Lisans bulunamadı.' };

    if (license.assignments.length >= license.seats) {
      return { error: 'Bu lisansın tüm kullanım hakları (seats) dolmuştur.' };
    }

    // Kullanıcıya zaten atanmış mı kontrol et
    const existingAssignment = license.assignments.find(a => a.userId === userId);
    if (existingAssignment) {
      return { error: 'Bu lisans ilgili kullanıcıya zaten atanmış.' };
    }

    // Atama yap
    await db.licenseAssignment.create({
      data: {
        licenseId,
        userId
      }
    });

    revalidatePath(`/tenant/${subdomain}/licenses/${licenseId}`);
    revalidatePath(`/tenant/${subdomain}/licenses`);
    return { success: true };
  } catch (error) {
    console.error('Assign License Error:', error);
    return { error: 'Lisans atanırken bir hata oluştu.' };
  }
}

export async function revokeLicense(subdomain: string, assignmentId: string) {
  await requirePermission('MANAGE_LICENSES');
  const db = await getTenantDb(subdomain);

  try {
    const assignment = await db.licenseAssignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) return { error: 'Atama bulunamadı.' };

    await db.licenseAssignment.delete({
      where: { id: assignmentId }
    });

    revalidatePath(`/tenant/${subdomain}/licenses/${assignment.licenseId}`);
    revalidatePath(`/tenant/${subdomain}/licenses`);
    return { success: true };
  } catch (error) {
    console.error('Revoke License Error:', error);
    return { error: 'Lisans ataması kaldırılırken bir hata oluştu.' };
  }
}
