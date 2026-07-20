import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const wb = XLSX.utils.book_new();
    
    // Headers matching what the user should provide
    const wsData = [
      [
        'DemirbasNo', 
        'Kategori', 
        'MarkaModel', 
        'SeriNo', 
        'Lokasyon', 
        'Durum', 
        'SatinAlmaTarihi', 
        'Maliyet'
      ],
      // Bir tane örnek veri satırı
      [
        'IT-0001', 
        'Bilgisayar', 
        'MacBook Pro 16" M3 Max', 
        'C02XXXXXXX', 
        'Merkez Ofis', 
        'Stokta', 
        '2023-11-01', 
        '105000'
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Sütun genişliklerini ayarla
    ws['!cols'] = [
      { wch: 15 }, // DemirbasNo
      { wch: 20 }, // Kategori
      { wch: 30 }, // MarkaModel
      { wch: 20 }, // SeriNo
      { wch: 20 }, // Lokasyon
      { wch: 15 }, // Durum
      { wch: 15 }, // SatinAlmaTarihi
      { wch: 15 }, // Maliyet
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Cihazlar');

    // Buffer'a yaz (Node.js uyumlu)
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // NextResponse ile dosyayı döndür
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="Cihaz_Envanter_Sablonu.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    });

  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json({ error: 'Şablon oluşturulamadı.' }, { status: 500 });
  }
}
