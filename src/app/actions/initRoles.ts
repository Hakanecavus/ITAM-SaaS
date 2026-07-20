'use server';

import { getTenantDb } from '@/lib/db';
import { PERMISSIONS } from '@/lib/permissions';

export async function initRolesForTenant(subdomain: string) {
  const db = await getTenantDb(subdomain);
  
  const allPermissions = Object.keys(PERMISSIONS);
  const permissionsJson = JSON.stringify(allPermissions);

  let systemAdminRole = await db.role.findUnique({
    where: { name: 'Sistem Yöneticisi' }
  });

  if (!systemAdminRole) {
    systemAdminRole = await db.role.create({
      data: {
        name: 'Sistem Yöneticisi',
        description: 'Sistemdeki tüm yetkilere sahip varsayılan süper yönetici rolü.',
        permissions: permissionsJson,
        isDefault: false
      }
    });
  } else {
    // Ensure it has all permissions
    systemAdminRole = await db.role.update({
      where: { id: systemAdminRole.id },
      data: { permissions: permissionsJson }
    });
  }

  // Create a default Standard User role if it doesn't exist
  let standardUserRole = await db.role.findUnique({
    where: { name: 'Standart Kullanıcı' }
  });

  if (!standardUserRole) {
    standardUserRole = await db.role.create({
      data: {
        name: 'Standart Kullanıcı',
        description: 'Sadece cihazlarını görebilir. Yönetim paneline erişemez.',
        permissions: JSON.stringify([]), // No special permissions
        isDefault: true
      }
    });
  }

  // Find all users who are currently logged in or should be admins
  // Since we dropped `role` from User, we will just assume the first user or existing users with no role
  // We'll give 'hakanemrecavus@gmail.com' the admin role specifically if exists, else the first user.
  const adminUser = await db.user.findUnique({
    where: { email: 'hakanemrecavus@gmail.com' }
  });

  if (adminUser) {
    await db.user.update({
      where: { id: adminUser.id },
      data: { 
        canLogin: true,
        roleId: systemAdminRole.id 
      }
    });
  } else {
    // If not found, assign the first user as admin
    const firstUser = await db.user.findFirst();
    if (firstUser) {
      await db.user.update({
        where: { id: firstUser.id },
        data: {
          canLogin: true,
          roleId: systemAdminRole.id
        }
      });
    }
  }

  return { success: true };
}
