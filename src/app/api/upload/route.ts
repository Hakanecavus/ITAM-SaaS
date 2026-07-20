import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Geçersiz dosya formatı. Lütfen PDF, JPG veya PNG yükleyin.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // public/uploads dizinini oluştur (yoksa)
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if it already exists
    }

    // Dosyayı benzersiz bir isimle kaydet
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const documentUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, documentUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Dosya yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}
