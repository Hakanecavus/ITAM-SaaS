'use server';

import { getTenantDb } from '@/lib/db';
import { requirePermission, requireAuth, getUserContext, hasPermission } from '@/lib/auth';

export async function getDashboardStats(subdomain: string) {
  await requirePermission('VIEW_ASSETS');
  const userCtx = await getUserContext();
  if (!userCtx) throw new Error('Unauthorized');

  const { session, user, locationIds } = userCtx;
  const db = await getTenantDb(subdomain);

  const whereLocation: any = {};
  if (locationIds && locationIds.length > 0) {
    whereLocation.locationId = { in: locationIds };
  }

  // 1. Genel Cihaz Özeti
  const assets = await db.asset.findMany({
    where: whereLocation,
    select: {
      status: true,
      categoryId: true,
      purchaseCost: true,
      category: { select: { name: true } },
    }
  });

  const totalAssets = assets.length;
  const availableAssets = assets.filter(a => a.status === 'Stokta').length;
  const assignedAssets = assets.filter(a => a.status === 'Kullanımda').length;
  const inMaintenanceAssets = assets.filter(a => a.status === 'Serviste').length;
  const brokenAssets = assets.filter(a => a.status === 'Arızalı').length;
  const lostAssets = assets.filter(a => a.status === 'Kayıp').length;

  // VIEW_FINANCE Yetkisi kontrolü
  let totalInventoryValue = null;
  const canViewFinance = await hasPermission('VIEW_FINANCE');
  if (canViewFinance) {
    totalInventoryValue = assets.reduce((sum, asset) => sum + (asset.purchaseCost || 0), 0);
  }

  // 2. Kategoriye Göre Cihaz Dağılımı (Grafik için)
  const categoryStats: Record<string, number> = {};
  assets.forEach(asset => {
    const catName = asset.category.name;
    categoryStats[catName] = (categoryStats[catName] || 0) + 1;
  });
  
  const categoryChartData = Object.entries(categoryStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 3. Yaklaşan Kritik Durumlar (Son 30 gün içinde bitecek lisanslar)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringLicenses = await db.license.findMany({
    where: {
      expirationDate: {
        not: null,
        lte: thirtyDaysFromNow,
        gte: new Date(),
      }
    },
    select: { id: true, name: true, expirationDate: true }
  });

  const expiredLicenses = await db.license.findMany({
    where: {
      expirationDate: {
        not: null,
        lt: new Date(),
      }
    },
    select: { id: true, name: true, expirationDate: true }
  });

  // 4. Kritik Stoklu Sarf Malzemeleri
  // Sarf malzemelerinde lokasyon kısıtı varsa, modelde locationId olmadığı için filtrelemiyoruz.
  // (Not: İleride Consumable modeline locationId eklenirse filtrelenebilir)
  const criticalConsumablesCount = await db.consumable.count({
    where: {
      quantity: {
        lte: db.consumable.fields.minQuantity
      }
    }
  });

  return {
    overview: {
      totalAssets,
      availableAssets,
      assignedAssets,
      inMaintenanceAssets,
      brokenAssets,
      lostAssets,
      totalInventoryValue
    },
    charts: {
      categoryData: categoryChartData
    },
    alerts: {
      expiringLicenses: expiringLicenses.length,
      expiredLicenses: expiredLicenses.length,
      criticalConsumables: criticalConsumablesCount
    }
  };
}
