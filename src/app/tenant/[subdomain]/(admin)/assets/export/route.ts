import { getTenantDb } from '@/lib/db';
import { requirePermission } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ subdomain: string }> }) {
  await requirePermission('VIEW_ASSETS');
  const resolvedParams = await params;
  const db = await getTenantDb(resolvedParams.subdomain);
  
  const assets = await db.asset.findMany({
    include: {
      category: true,
      location: true,
      assignedUser: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Generate CSV
  const header = ['Demirbas No', 'Kategori', 'Marka/Model', 'Seri No', 'Durum', 'Lokasyon', 'Zimmetli Kisi', 'Maliyet (TL)', 'Satin Alma Tarihi', 'Kayıt Tarihi'];
  
  const rows = assets.map(asset => [
    `"${asset.demiRbasNo}"`,
    `"${asset.category.name}"`,
    `"${asset.brandModel}"`,
    `"${asset.serialNo || ''}"`,
    `"${asset.status}"`,
    `"${asset.location.name}"`,
    `"${asset.assignedUser ? asset.assignedUser.name : ''}"`,
    asset.purchaseCost ? asset.purchaseCost.toString() : '',
    asset.purchaseDate ? asset.purchaseDate.toISOString().split('T')[0] : '',
    asset.createdAt.toISOString().split('T')[0]
  ]);

  const csvContent = [header.join(','), ...rows.map(row => row.join(','))].join('\n');

  return new Response('\uFEFF' + csvContent, { // UTF-8 BOM for Excel
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${resolvedParams.subdomain}_assets.csv"`
    }
  });
}
