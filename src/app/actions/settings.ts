'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

export async function createCategory(subdomain: string, formData: FormData) {
  try {
    const db = await getTenantDb(subdomain);
    const name = formData.get('name') as string;

    if (!name) return { error: 'Kategori adı zorunludur.' };

    await db.assetCategory.create({ data: { name } });
    revalidatePath(`/tenant/${subdomain}/settings`);
    revalidatePath(`/tenant/${subdomain}/assets/new`);
    return { success: true };
  } catch (error: any) {
    return { error: 'Kategori eklenemedi (Aynı isimde olabilir).' };
  }
}

export async function createLocation(subdomain: string, formData: FormData) {
  try {
    const db = await getTenantDb(subdomain);
    const name = formData.get('name') as string;

    if (!name) return { error: 'Lokasyon adı zorunludur.' };

    await db.location.create({ data: { name } });
    revalidatePath(`/tenant/${subdomain}/settings`);
    revalidatePath(`/tenant/${subdomain}/assets/new`);
    return { success: true };
  } catch (error: any) {
    return { error: 'Lokasyon eklenemedi.' };
  }
}

export async function updateCategory(subdomain: string, id: string, newName: string) {
  try {
    const db = await getTenantDb(subdomain);
    if (!newName) return { error: 'Kategori adı boş olamaz.' };

    await db.assetCategory.update({
      where: { id },
      data: { name: newName }
    });
    revalidatePath(`/tenant/${subdomain}/settings`);
    return { success: true };
  } catch (error: any) {
    return { error: 'Kategori güncellenemedi (İsim çakışması olabilir).' };
  }
}

export async function deleteCategory(subdomain: string, id: string) {
  try {
    const db = await getTenantDb(subdomain);
    
    // Check if there are connected assets
    const category = await db.assetCategory.findUnique({
      where: { id },
      include: { _count: { select: { assets: true } } }
    });

    if (!category) return { error: 'Kategori bulunamadı.' };
    if (category._count.assets > 0) {
      return { error: 'Bu kategoriye bağlı varlıklar (cihazlar) bulunduğu için silinemez.' };
    }

    await db.assetCategory.delete({ where: { id } });
    revalidatePath(`/tenant/${subdomain}/settings`);
    return { success: true };
  } catch (error: any) {
    return { error: 'Kategori silinemedi.' };
  }
}

export async function updateLocation(subdomain: string, id: string, newName: string) {
  try {
    const db = await getTenantDb(subdomain);
    if (!newName) return { error: 'Lokasyon adı boş olamaz.' };

    await db.location.update({
      where: { id },
      data: { name: newName }
    });
    revalidatePath(`/tenant/${subdomain}/settings`);
    return { success: true };
  } catch (error: any) {
    return { error: 'Lokasyon güncellenemedi.' };
  }
}

export async function deleteLocation(subdomain: string, id: string) {
  try {
    const db = await getTenantDb(subdomain);
    
    // Check if there are connected assets or children locations
    const location = await db.location.findUnique({
      where: { id },
      include: { 
        _count: { select: { assets: true, children: true } } 
      }
    });

    if (!location) return { error: 'Lokasyon bulunamadı.' };
    if (location._count.assets > 0) {
      return { error: 'Bu lokasyona bağlı varlıklar (cihazlar) bulunduğu için silinemez.' };
    }
    if (location._count.children > 0) {
      return { error: 'Bu lokasyona bağlı alt lokasyonlar bulunduğu için silinemez.' };
    }

    await db.location.delete({ where: { id } });
    revalidatePath(`/tenant/${subdomain}/settings`);
    return { success: true };
  } catch (error: any) {
    return { error: 'Lokasyon silinemedi.' };
  }
}

export async function getSmtpSettings(subdomain: string) {
  const db = await getTenantDb(subdomain);
  const settings = await db.tenantSetting.findMany({
    where: {
      key: {
        in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM']
      }
    }
  });

  const config = {
    SMTP_HOST: '',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: '',
    SMTP_PASS: '',
    SMTP_FROM: ''
  };

  settings.forEach(s => {
    if (s.key in config) {
      (config as any)[s.key] = s.value;
    }
  });

  return config;
}

export async function saveSmtpSettings(subdomain: string, formData: FormData) {
  try {
    const { requirePermission } = await import('@/lib/auth');
    await requirePermission('MANAGE_SETTINGS');
    
    const db = await getTenantDb(subdomain);
    const keys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];

    for (const key of keys) {
      const val = formData.get(key) as string;
      if (val !== null) {
        await db.tenantSetting.upsert({
          where: { key },
          update: { value: val },
          create: { key, value: val }
        });
      }
    }

    const { logSystemAction } = await import('@/app/actions/audit');
    const { getUserSession } = await import('@/lib/auth');
    const session = await getUserSession();
    await logSystemAction(
      subdomain,
      session?.userId,
      'UPDATE',
      'SETTINGS',
      'SMTP E-posta ayarları güncellendi',
      { host: formData.get('SMTP_HOST'), user: formData.get('SMTP_USER') }
    );

    revalidatePath(`/tenant/${subdomain}/settings/smtp`);
    return { success: true };
  } catch (error: any) {
    console.error('SMTP Ayarları kaydedilemedi:', error);
    return { error: 'SMTP ayarları kaydedilirken bir hata oluştu.' };
  }
}

export async function getTenantSettings(subdomain: string) {
  const db = await getTenantDb(subdomain);
  const settings = await db.tenantSetting.findMany();
  
  return settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);
}

export async function saveTenantSettings(subdomain: string, formData: FormData) {
  try {
    const db = await getTenantDb(subdomain);
    
    const companyName = formData.get('companyName') as string;
    const assignTerms = formData.get('assignTerms') as string;
    const returnTerms = formData.get('returnTerms') as string;
    const footerText = formData.get('footerText') as string;
    
    // Toggles
    const showSerialNo = formData.get('showSerialNo') === 'on' ? 'true' : 'false';
    const showNotes = formData.get('showNotes') === 'on' ? 'true' : 'false';

    let companyLogoUrl = formData.get('companyLogoUrl') as string; // Optional old url input

    // Handle File Upload
    const logoFile = formData.get('logoFile') as File | null;
    if (logoFile && logoFile.size > 0) {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const ext = logoFile.name.split('.').pop() || 'png';
      const fileName = `${subdomain}_logo_${Date.now()}.${ext}`;
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      // Ensure dir exists
      try { await fs.mkdir(uploadDir, { recursive: true }); } catch (e) {}
      
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      
      companyLogoUrl = `/uploads/${fileName}`;
    }

    const settingsToSave = [
      { key: 'companyName', value: companyName || '' },
      { key: 'companyLogoUrl', value: companyLogoUrl || '' },
      { key: 'assignTerms', value: assignTerms || '' },
      { key: 'returnTerms', value: returnTerms || '' },
      { key: 'footerText', value: footerText || '' },
      { key: 'showSerialNo', value: showSerialNo },
      { key: 'showNotes', value: showNotes },
    ];

    for (const setting of settingsToSave) {
      await db.tenantSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      });
    }

    const { logSystemAction } = await import('@/app/actions/audit');
    const { getUserSession } = await import('@/lib/auth');
    const session = await getUserSession();
    await logSystemAction(
      subdomain,
      session?.userId,
      'UPDATE',
      'SETTINGS',
      'Genel şirket ayarları güncellendi',
      { companyName }
    );

    revalidatePath(`/tenant/${subdomain}/settings`);
    revalidatePath(`/tenant/${subdomain}/assets`); 
    return { success: true };
  } catch (error: any) {
    console.error('Save Settings Error:', error);
    return { error: 'Ayarlar kaydedilirken bir hata oluştu.' };
  }
}

export async function saveEmailTemplate(subdomain: string, formData: FormData) {
  try {
    const { requirePermission } = await import('@/lib/auth');
    await requirePermission('MANAGE_SETTINGS');
    
    const db = await getTenantDb(subdomain);
    const subject = formData.get('EMAIL_TEMPLATE_SUBJECT') as string;
    const body = formData.get('EMAIL_TEMPLATE_BODY') as string;

    const settingsToSave = [
      { key: 'EMAIL_TEMPLATE_SUBJECT', value: subject || '' },
      { key: 'EMAIL_TEMPLATE_BODY', value: body || '' },
    ];

    for (const setting of settingsToSave) {
      await db.tenantSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      });
    }

    revalidatePath(`/tenant/${subdomain}/settings/email-template`);
    return { success: true };
  } catch (error: any) {
    console.error('Email template save error:', error);
    return { error: 'E-posta şablonu kaydedilemedi.' };
  }
}
export async function getEmailTemplates(subdomain: string) {
  const db = await getTenantDb(subdomain);
  const setting = await db.tenantSetting.findUnique({ where: { key: 'EMAIL_TEMPLATES' } });
  if (!setting || !setting.value) return [];
  try {
    return JSON.parse(setting.value) as { id: string, name: string, subject: string, body: string }[];
  } catch (e) {
    return [];
  }
}

export async function saveEmailTemplates(subdomain: string, templates: { id: string, name: string, subject: string, body: string }[]) {
  try {
    const { requirePermission } = await import('@/lib/auth');
    await requirePermission('MANAGE_SETTINGS');
    const db = await getTenantDb(subdomain);
    const value = JSON.stringify(templates);
    await db.tenantSetting.upsert({
      where: { key: 'EMAIL_TEMPLATES' },
      update: { value },
      create: { key: 'EMAIL_TEMPLATES', value },
    });
    revalidatePath(`/tenant/${subdomain}/settings/email-template`);
    return { success: true };
  } catch (error: any) {
    console.error('Email templates save error:', error);
    return { error: 'Şablonlar kaydedilemedi.' };
  }
}

export async function getEmailRules(subdomain: string) {
  const db = await getTenantDb(subdomain);
  const setting = await db.tenantSetting.findUnique({ where: { key: 'EMAIL_RULES' } });
  if (!setting || !setting.value) return {};
  try {
    // Record<string, { isEnabled: boolean, templateId: string }>
    return JSON.parse(setting.value) as Record<string, { isEnabled: boolean, templateId: string }>;
  } catch (e) {
    return {};
  }
}

export async function saveEmailRules(subdomain: string, rules: Record<string, { isEnabled: boolean, templateId: string }>) {
  try {
    const { requirePermission } = await import('@/lib/auth');
    await requirePermission('MANAGE_SETTINGS');
    const db = await getTenantDb(subdomain);
    const value = JSON.stringify(rules);
    await db.tenantSetting.upsert({
      where: { key: 'EMAIL_RULES' },
      update: { value },
      create: { key: 'EMAIL_RULES', value },
    });
    revalidatePath(`/tenant/${subdomain}/settings/email-template`);
    return { success: true };
  } catch (error: any) {
    console.error('Email rules save error:', error);
    return { error: 'Kurallar kaydedilemedi.' };
  }
}
