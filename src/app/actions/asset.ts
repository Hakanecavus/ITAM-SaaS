'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth';

export async function createAsset(subdomain: string, formData: FormData) {
  try {
    await requirePermission('MANAGE_ASSETS');
    const db = await getTenantDb(subdomain);
    
    const demiRbasNo = formData.get('demiRbasNo') as string;
    const categoryId = formData.get('categoryId') as string;
    const brandModel = formData.get('brandModel') as string;
    const locationId = formData.get('locationId') as string;
    const status = (formData.get('status') as string) || 'Stokta';
    const serialNo = formData.get('serialNo') as string | null;
    const notes = formData.get('notes') as string | null;
    const customFieldsStr = formData.get('customFields') as string | null;

    // Phase 4: Lifecycle and Warranty
    const purchaseDateStr = formData.get('purchaseDate') as string | null;
    const purchaseCostStr = formData.get('purchaseCost') as string | null;
    const warrantyEndStr = formData.get('warrantyEnd') as string | null;
    
    // Phase 5: Financial Depreciation
    const salvageValueStr = formData.get('salvageValue') as string | null;
    const usefulLifeYearsStr = formData.get('usefulLifeYears') as string | null;

    if (!demiRbasNo || !categoryId || !brandModel || !locationId) {
      return { error: 'Zorunlu alanları doldurunuz.' };
    }

    const existing = await db.asset.findUnique({
      where: { demiRbasNo }
    });

    if (existing) {
      return { error: 'Bu demirbaş numarası zaten kullanılıyor.' };
    }

    await db.asset.create({
      data: {
        demiRbasNo,
        categoryId,
        brandModel,
        locationId,
        status,
        serialNo,
        notes,
        customFields: customFieldsStr || null,
        purchaseDate: purchaseDateStr ? new Date(purchaseDateStr) : null,
        purchaseCost: purchaseCostStr ? parseFloat(purchaseCostStr) : null,
        salvageValue: salvageValueStr ? parseFloat(salvageValueStr) : null,
        usefulLifeYears: usefulLifeYearsStr ? parseInt(usefulLifeYearsStr, 10) : null,
        warrantyEnd: warrantyEndStr ? new Date(warrantyEndStr) : null,
      }
    });

    revalidatePath(`/tenant/${subdomain}/assets`);
    revalidatePath(`/tenant/${subdomain}/dashboard`);
    
    return { success: true };
  } catch (error: any) {
    console.error('Create Asset Error:', error);
    return { error: 'Kayıt sırasında sunucu hatası oluştu.' };
  }
}
