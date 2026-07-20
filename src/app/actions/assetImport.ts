'use server';

import { getTenantDb } from '@/lib/db';
import { requirePermission } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import * as XLSX from 'xlsx';

export async function importAssetsFromExcel(subdomain: string, formData: FormData) {
  try {
    await requirePermission('MANAGE_ASSETS');
    
    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'Dosya bulunamadı.' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Read the Excel workbook
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    if (!data || data.length === 0) {
      return { error: 'Excel dosyası boş veya format hatalı.' };
    }

    const db = await getTenantDb(subdomain);
    let importedCount = 0;
    let updatedCount = 0;

    for (const row of data) {
      const demirbasNo = row['DemirbasNo'];
      const categoryName = row['Kategori'];
      const brandModel = row['MarkaModel'];
      const serialNo = row['SeriNo'] || null;
      const locationName = row['Lokasyon'];
      const status = row['Durum'] || 'Stokta';
      const purchaseDate = row['SatinAlmaTarihi'] ? new Date(row['SatinAlmaTarihi']) : null;
      const purchaseCost = row['Maliyet'] ? parseFloat(row['Maliyet']) : null;

      if (!demirbasNo || !categoryName || !brandModel || !locationName) {
        // Skip invalid rows
        continue;
      }

      // 1. Kategori Bul veya Oluştur
      let category = await db.assetCategory.findUnique({ where: { name: categoryName } });
      if (!category) {
        category = await db.assetCategory.create({ data: { name: categoryName } });
      }

      // 2. Lokasyon Bul veya Oluştur (parentId olmadan basitçe oluşturuyoruz)
      // İlk bulduğumuz ada sahip lokasyonu al, yoksa oluştur
      let location = await db.location.findFirst({ where: { name: locationName } });
      if (!location) {
        location = await db.location.create({ data: { name: locationName } });
      }

      // 3. Asset Upsert
      const existingAsset = await db.asset.findUnique({ where: { demiRbasNo: demirbasNo } });

      if (existingAsset) {
        // Güncelle (Update)
        await db.asset.update({
          where: { id: existingAsset.id },
          data: {
            categoryId: category.id,
            brandModel,
            serialNo,
            locationId: location.id,
            status,
            purchaseDate,
            purchaseCost
          }
        });
        updatedCount++;
      } else {
        // Yeni Oluştur (Create)
        await db.asset.create({
          data: {
            demiRbasNo: demirbasNo,
            categoryId: category.id,
            brandModel,
            serialNo,
            locationId: location.id,
            status,
            purchaseDate,
            purchaseCost
          }
        });
        importedCount++;
      }
    }

    revalidatePath(`/tenant/${subdomain}/assets`);
    
    return { 
      success: true, 
      message: `${importedCount} yeni cihaz eklendi, ${updatedCount} cihaz güncellendi.` 
    };
  } catch (error: any) {
    console.error('Import Error:', error);
    return { error: 'İçe aktarma sırasında bir hata oluştu: ' + error.message };
  }
}

export async function importMappedAssets(subdomain: string, data: any[]) {
  try {
    await requirePermission('MANAGE_ASSETS');
    
    if (!data || data.length === 0) {
      return { error: 'Aktarılacak veri bulunamadı.' };
    }

    const db = await getTenantDb(subdomain);
    let importedCount = 0;
    let updatedCount = 0;

    for (const row of data) {
      const demirbasNo = row.demirbasNo;
      const categoryName = row.categoryName;
      const brandModel = row.brandModel;
      const serialNo = row.serialNo || null;
      const locationName = row.locationName;
      const status = row.status || 'Stokta';
      const purchaseDate = row.purchaseDate ? new Date(row.purchaseDate) : null;
      const purchaseCost = row.purchaseCost ? parseFloat(row.purchaseCost) : null;

      if (!demirbasNo || !categoryName || !brandModel || !locationName) {
        continue;
      }

      // 1. Kategori Bul veya Oluştur
      let category = await db.assetCategory.findUnique({ where: { name: categoryName } });
      if (!category) {
        category = await db.assetCategory.create({ data: { name: categoryName } });
      }

      // 2. Lokasyon Bul veya Oluştur
      let location = await db.location.findFirst({ where: { name: locationName } });
      if (!location) {
        location = await db.location.create({ data: { name: locationName } });
      }

      // 3. Asset Upsert
      const existingAsset = await db.asset.findUnique({ where: { demiRbasNo: demirbasNo } });

      if (existingAsset) {
        // Güncelle
        await db.asset.update({
          where: { id: existingAsset.id },
          data: {
            categoryId: category.id,
            brandModel,
            serialNo,
            locationId: location.id,
            status,
            purchaseDate,
            purchaseCost
          }
        });
        updatedCount++;
      } else {
        // Yeni Oluştur
        await db.asset.create({
          data: {
            demiRbasNo: demirbasNo,
            categoryId: category.id,
            brandModel,
            serialNo,
            locationId: location.id,
            status,
            purchaseDate,
            purchaseCost
          }
        });
        importedCount++;
      }
    }

    revalidatePath(`/tenant/${subdomain}/assets`);
    
    return { 
      success: true, 
      message: `${importedCount} yeni cihaz eklendi, ${updatedCount} cihaz güncellendi.` 
    };
  } catch (error: any) {
    console.error('Mapped Import Error:', error);
    return { error: 'İçe aktarma sırasında bir hata oluştu: ' + error.message };
  }
}

