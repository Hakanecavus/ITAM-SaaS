import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    // Auth check
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { userId } = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));
    const body = await request.json();
    const { title, description, priority, assetId } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Konu ve açıklama zorunludur' }, { status: 400 });
    }

    const db = await getTenantDb(subdomain);

    // If assetId is provided (as demirbasNo), try to find it
    let realAssetId = null;
    if (assetId) {
      const asset = await db.asset.findUnique({
        where: { demiRbasNo: assetId }
      });
      if (asset) {
        realAssetId = asset.id;
      }
    }

    const ticket = await db.ticket.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        assetId: realAssetId,
        createdById: userId,
      }
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Talep oluşturulurken bir hata oluştu' }, { status: 500 });
  }
}
