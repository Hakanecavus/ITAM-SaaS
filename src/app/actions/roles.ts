'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth';

export async function createRole(subdomain: string, formData: FormData) {
  try {
    await requirePermission('MANAGE_ROLES');
    const db = await getTenantDb(subdomain);
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;
    const permissionsJson = formData.get('permissions') as string;
    const isDefault = formData.get('isDefault') === 'true';

    if (!name) return { error: 'Rol adı zorunludur.' };

    const existing = await db.role.findUnique({ where: { name } });
    if (existing) return { error: 'Bu isimde bir rol zaten var.' };

    if (isDefault) {
      // Sadece tek bir default rol olabilir
      await db.role.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    await db.role.create({
      data: {
        name,
        description,
        permissions: permissionsJson || '[]',
        isDefault
      }
    });

    const { logSystemAction } = await import('@/app/actions/audit');
    const { getUserSession } = await import('@/lib/auth');
    const session = await getUserSession();
    await logSystemAction(
      subdomain,
      session?.userId,
      'CREATE',
      'ROLES',
      `Yeni rol eklendi: ${name}`,
      { isDefault, permissions: JSON.parse(permissionsJson || '[]') }
    );

    revalidatePath(`/settings/roles`);
    return { success: true };
  } catch (error: any) {
    console.error('Create Role Error:', error);
    return { error: 'Rol oluşturulamadı.' };
  }
}

export async function updateRole(subdomain: string, roleId: string, formData: FormData) {
  try {
    await requirePermission('MANAGE_ROLES');
    const db = await getTenantDb(subdomain);
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;
    const permissionsJson = formData.get('permissions') as string;
    const isDefault = formData.get('isDefault') === 'true';

    if (!name) return { error: 'Rol adı zorunludur.' };

    const role = await db.role.findUnique({ where: { id: roleId } });
    if (!role) return { error: 'Rol bulunamadı.' };

    if (role.name === 'Sistem Yöneticisi' && permissionsJson !== role.permissions) {
      // Sistem yöneticisinin yetkileri kısaltılamaz
      return { error: 'Sistem Yöneticisi rolünün yetkileri değiştirilemez.' };
    }

    if (isDefault) {
      await db.role.updateMany({
        where: { isDefault: true, id: { not: roleId } },
        data: { isDefault: false }
      });
    }

    await db.role.update({
      where: { id: roleId },
      data: {
        name,
        description,
        permissions: permissionsJson || '[]',
        isDefault
      }
    });

    const { logSystemAction } = await import('@/app/actions/audit');
    const { getUserSession } = await import('@/lib/auth');
    const session = await getUserSession();
    await logSystemAction(
      subdomain,
      session?.userId,
      'UPDATE',
      'ROLES',
      `Rol güncellendi: ${name}`,
      { isDefault, permissions: JSON.parse(permissionsJson || '[]') }
    );

    revalidatePath(`/settings/roles`);
    return { success: true };
  } catch (error: any) {
    console.error('Update Role Error:', error);
    return { error: 'Rol güncellenemedi.' };
  }
}

export async function deleteRole(subdomain: string, roleId: string) {
  try {
    await requirePermission('MANAGE_ROLES');
    const db = await getTenantDb(subdomain);
    
    const role = await db.role.findUnique({ where: { id: roleId }, include: { _count: { select: { users: true } } } });
    if (!role) return { error: 'Rol bulunamadı.' };

    if (role.name === 'Sistem Yöneticisi' || role.name === 'Standart Kullanıcı') {
      return { error: 'Sistem varsayılan rolleri silinemez.' };
    }

    if (role._count.users > 0) {
      return { error: 'Bu role atanmış kullanıcılar var. Önce kullanıcıların rolünü değiştirin.' };
    }

    await db.role.delete({ where: { id: roleId } });

    const { logSystemAction } = await import('@/app/actions/audit');
    const { getUserSession } = await import('@/lib/auth');
    const session = await getUserSession();
    await logSystemAction(
      subdomain,
      session?.userId,
      'DELETE',
      'ROLES',
      `Rol silindi: ${role.name}`,
      { roleId }
    );

    revalidatePath(`/settings/roles`);
    return { success: true };
  } catch (error: any) {
    console.error('Delete Role Error:', error);
    return { error: 'Rol silinemedi.' };
  }
}
