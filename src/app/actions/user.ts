'use server';

import { getTenantDb, masterDb } from '@/lib/db';
import { requirePermission } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createUser(subdomain: string, data: {
  name: string;
  email: string;
  title?: string;
  canLogin: boolean;
  roleId?: string;
  initialPassword?: string;
  managedLocationIds?: string | null;
}) {
  await requirePermission('MANAGE_USERS');
  
  const tenantDb = await getTenantDb(subdomain);
  
  const email = data.email.trim().toLowerCase();

  // 1. E-posta kullanımda mı kontrol et (Tenant tarafında)
  const existingTenantUser = await tenantDb.user.findUnique({ where: { email } });
  if (existingTenantUser) {
    return { error: 'Bu e-posta adresi ile kayıtlı bir çalışan zaten var.' };
  }

  try {
    // 2. Eğer sisteme giriş yapabilecekse, Master DB'de de oluştur
    if (data.canLogin) {
      if (!data.initialPassword) {
        return { error: 'Sisteme giriş yapacak kullanıcılar için şifre zorunludur.' };
      }

      // Kiracı bilgilerini Master DB'den bul
      const tenant = await masterDb.tenant.findUnique({ where: { subdomain } });
      if (!tenant) return { error: 'Kiracı bulunamadı.' };

      // Master DB'de e-posta kontrolü
      const existingMasterUser = await masterDb.user.findUnique({ where: { email } });
      if (existingMasterUser) {
        return { error: 'Bu e-posta adresi başka bir hesap tarafından kullanılıyor.' };
      }

      // Master DB'ye kullanıcı ekle
      await masterDb.user.create({
        data: {
          email,
          name: data.name,
          password: data.initialPassword, // Normalde bcrypt ile hashlenmeli
          mustChangePassword: true, // İlk girişte şifre değiştirmeye zorla
          tenantId: tenant.id
        }
      });
    }

    // 3. Tenant DB'ye kullanıcı ekle
    await tenantDb.user.create({
      data: {
        email,
        name: data.name,
        title: data.title || null,
        canLogin: data.canLogin,
        roleId: data.canLogin ? data.roleId : null,
        managedLocationIds: data.canLogin ? data.managedLocationIds : null
      }
    });

    revalidatePath(`/tenant/${subdomain}/users`);
    return { success: true };

  } catch (error: any) {
    console.error('Create User Error:', error);
    return { error: 'Çalışan oluşturulurken beklenmeyen bir hata meydana geldi.' };
  }
}

export async function updateUser(subdomain: string, userId: string, data: {
  name: string;
  email: string;
  title?: string;
  canLogin: boolean;
  roleId?: string;
  initialPassword?: string;
  newPassword?: string;
  managedLocationIds?: string | null;
}) {
  await requirePermission('MANAGE_USERS');
  const tenantDb = await getTenantDb(subdomain);
  const email = data.email.trim().toLowerCase();

  const userToUpdate = await tenantDb.user.findUnique({ where: { id: userId } });
  if (!userToUpdate) return { error: 'Çalışan bulunamadı.' };

  // E-posta değiştiriliyorsa çakışma var mı kontrol et
  if (userToUpdate.email !== email) {
    const existingEmail = await tenantDb.user.findUnique({ where: { email } });
    if (existingEmail) return { error: 'Bu e-posta adresi kullanılıyor.' };
  }

  try {
    const tenant = await masterDb.tenant.findUnique({ where: { subdomain } });
    if (!tenant) return { error: 'Kiracı bulunamadı.' };

    const wasLoginEnabled = userToUpdate.canLogin;

    // Durum 1: Giriş KAPALI'dan AÇIK'a geçiyorsa
    if (!wasLoginEnabled && data.canLogin) {
      if (!data.initialPassword) return { error: 'Giriş yetkisi açılırken geçici şifre zorunludur.' };
      
      const existingMasterUser = await masterDb.user.findUnique({ where: { email: userToUpdate.email } });
      if (!existingMasterUser) {
        await masterDb.user.create({
          data: {
            email,
            name: data.name,
            password: data.initialPassword,
            mustChangePassword: true,
            tenantId: tenant.id
          }
        });
      }
    } 
    // Durum 2: Giriş AÇIK'tan KAPALI'ya geçiyorsa
    else if (wasLoginEnabled && !data.canLogin) {
      // Master DB'den kullanıcıyı sil (artık sisteme hiç giremeyecek)
      await masterDb.user.delete({ where: { email: userToUpdate.email } }).catch(() => {});
    }
    // Durum 3: Giriş hep AÇIKTI ve E-posta veya Şifre değişti
    else if (wasLoginEnabled && data.canLogin) {
      const updateData: any = { name: data.name };
      if (userToUpdate.email !== email) updateData.email = email;
      if (data.newPassword) updateData.password = data.newPassword;

      await masterDb.user.update({
        where: { email: userToUpdate.email },
        data: updateData
      }).catch(() => {});
    }

    // Tenant DB güncelle
    await tenantDb.user.update({
      where: { id: userId },
      data: {
        email,
        name: data.name,
        title: data.title || null,
        canLogin: data.canLogin,
        roleId: data.canLogin ? data.roleId : null,
        managedLocationIds: data.canLogin ? data.managedLocationIds : null
      }
    });

    revalidatePath(`/tenant/${subdomain}/users`);
    return { success: true };

  } catch (error: any) {
    console.error('Update User Error:', error);
    return { error: 'Çalışan güncellenirken hata oluştu.' };
  }
}
