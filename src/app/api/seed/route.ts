import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const db = await getTenantDb('erze');
    
    // Add Dummy Locations
    const locationsData = ['Ana Bina', 'Kadıköy Şube', 'Ankara Ofis', 'Depo 1'];
    const locations = [];
    for (const name of locationsData) {
      let loc = await db.location.findFirst({ where: { name } });
      if (!loc) {
        loc = await db.location.create({ data: { name } });
      }
      locations.push(loc);
    }

    // Add Dummy Categories
    const categoriesData = ['Dizüstü Bilgisayar', 'Masaüstü Bilgisayar', 'Cep Telefonu', 'Tablet', 'Yazıcı'];
    const categories = [];
    for (const name of categoriesData) {
      let cat = await db.assetCategory.findFirst({ where: { name } });
      if (!cat) {
        cat = await db.assetCategory.create({ data: { name } });
      }
      categories.push(cat);
    }

    // Assignable dummy assets
    const assetsData = [
      { brandModel: 'MacBook Pro M3', serialNo: 'MBP-2024-001', demiRbasNo: 'BC-1001', categoryId: categories[0].id, locationId: locations[0].id, status: 'IN_USE', customFields: '{"RAM":"16GB","Depolama":"512GB SSD"}' },
      { brandModel: 'Dell XPS 15', serialNo: 'DX-2023-089', demiRbasNo: 'BC-1002', categoryId: categories[0].id, locationId: locations[1].id, status: 'AVAILABLE', customFields: '{"RAM":"32GB","Depolama":"1TB SSD"}' },
      { brandModel: 'Lenovo ThinkPad X1', serialNo: 'LT-2024-012', demiRbasNo: 'BC-1003', categoryId: categories[0].id, locationId: locations[0].id, status: 'IN_REPAIR', customFields: '{"RAM":"16GB"}' },
      { brandModel: 'iPhone 15 Pro', serialNo: 'IP15-001', demiRbasNo: 'BC-2001', categoryId: categories[2].id, locationId: locations[0].id, status: 'AVAILABLE', customFields: '{"Renk":"Siyah","Hafıza":"256GB"}' },
      { brandModel: 'Samsung Galaxy S24', serialNo: 'S24-002', demiRbasNo: 'BC-2002', categoryId: categories[2].id, locationId: locations[2].id, status: 'IN_USE', customFields: '{"Renk":"Gri","Hafıza":"512GB"}' },
      { brandModel: 'iPad Pro 12.9', serialNo: 'IPAD-001', demiRbasNo: 'BC-3001', categoryId: categories[3].id, locationId: locations[0].id, status: 'AVAILABLE', customFields: '{"Bağlantı":"Wi-Fi + Cellular"}' },
      { brandModel: 'HP Color LaserJet', serialNo: 'HP-PR-001', demiRbasNo: 'BC-4001', categoryId: categories[4].id, locationId: locations[0].id, status: 'IN_USE', customFields: '{"Tipi":"Renkli Lazer"}' },
    ];

    let count = 0;
    for (const asset of assetsData) {
      const exists = await db.asset.findUnique({ where: { demiRbasNo: asset.demiRbasNo } });
      if (!exists) {
        await db.asset.create({ data: asset });
        count++;
      }
    }

    return NextResponse.json({ success: true, message: `${count} yeni dummy cihaz eklendi, kategoriler ve lokasyonlar oluşturuldu.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
