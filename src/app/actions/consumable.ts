'use server';

import { getTenantDb } from '@/lib/db';
import { requirePermission, requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createConsumable(subdomain: string, data: {
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  cost?: number;
  notes?: string;
}) {
  await requirePermission('MANAGE_CONSUMABLES');
  const db = await getTenantDb(subdomain);
  const session = await requireAuth();

  try {
    const consumable = await db.consumable.create({
      data: {
        name: data.name,
        category: data.category,
        quantity: data.quantity,
        minQuantity: data.minQuantity,
        cost: data.cost || null,
        notes: data.notes || null,
      }
    });

    if (data.quantity > 0) {
      await db.consumableHistory.create({
        data: {
          consumableId: consumable.id,
          actionType: 'ADD',
          quantity: data.quantity,
          userId: session.userId,
          notes: 'İlk stok girişi'
        }
      });
    }

    revalidatePath(`/tenant/${subdomain}/consumables`);
    return { success: true, consumableId: consumable.id };
  } catch (error) {
    console.error('Create Consumable Error:', error);
    return { error: 'Sarf malzemesi eklenirken bir hata oluştu.' };
  }
}

export async function updateConsumable(subdomain: string, id: string, data: {
  name: string;
  category: string;
  minQuantity: number;
  cost?: number;
  notes?: string;
}) {
  await requirePermission('MANAGE_CONSUMABLES');
  const db = await getTenantDb(subdomain);

  try {
    await db.consumable.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        minQuantity: data.minQuantity,
        cost: data.cost || null,
        notes: data.notes || null,
      }
    });

    revalidatePath(`/tenant/${subdomain}/consumables`);
    revalidatePath(`/tenant/${subdomain}/consumables/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Update Consumable Error:', error);
    return { error: 'Sarf malzemesi güncellenirken hata oluştu.' };
  }
}

export async function addStock(subdomain: string, consumableId: string, quantity: number, notes?: string) {
  await requirePermission('MANAGE_CONSUMABLES');
  const db = await getTenantDb(subdomain);
  const session = await requireAuth();

  try {
    const consumable = await db.consumable.findUnique({ where: { id: consumableId } });
    if (!consumable) return { error: 'Malzeme bulunamadı.' };

    await db.$transaction([
      db.consumable.update({
        where: { id: consumableId },
        data: { quantity: { increment: quantity } }
      }),
      db.consumableHistory.create({
        data: {
          consumableId,
          actionType: 'ADD',
          quantity,
          userId: session.userId,
          notes: notes || 'Stok eklendi'
        }
      })
    ]);

    revalidatePath(`/tenant/${subdomain}/consumables/${consumableId}`);
    revalidatePath(`/tenant/${subdomain}/consumables`);
    return { success: true };
  } catch (error) {
    console.error('Add Stock Error:', error);
    return { error: 'Stok eklenirken hata oluştu.' };
  }
}

export async function consumeStock(subdomain: string, consumableId: string, quantity: number, targetUserId?: string, notes?: string) {
  await requirePermission('MANAGE_CONSUMABLES');
  const db = await getTenantDb(subdomain);

  try {
    const consumable = await db.consumable.findUnique({ where: { id: consumableId } });
    if (!consumable) return { error: 'Malzeme bulunamadı.' };

    if (consumable.quantity < quantity) {
      return { error: `Stok yetersiz. Mevcut stok: ${consumable.quantity}` };
    }

    await db.$transaction([
      db.consumable.update({
        where: { id: consumableId },
        data: { quantity: { decrement: quantity } }
      }),
      db.consumableHistory.create({
        data: {
          consumableId,
          actionType: 'REMOVE',
          quantity,
          userId: targetUserId || null,
          notes: notes || 'Stok çıkışı yapıldı'
        }
      })
    ]);

    revalidatePath(`/tenant/${subdomain}/consumables/${consumableId}`);
    revalidatePath(`/tenant/${subdomain}/consumables`);
    return { success: true };
  } catch (error) {
    console.error('Consume Stock Error:', error);
    return { error: 'Stok düşülürken hata oluştu.' };
  }
}
