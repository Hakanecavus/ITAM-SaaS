import { NextResponse } from 'next/server';
import { masterDb, provisionTenantDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyName, subdomain, email, userName, password } = body;

    if (!companyName || !subdomain || !email || !userName || !password) {
      return NextResponse.json({ error: 'Tüm alanları doldurunuz.' }, { status: 400 });
    }

    // Check if subdomain exists in Master DB
    const existingTenant = await masterDb.tenant.findUnique({
      where: { subdomain },
    });

    if (existingTenant) {
      return NextResponse.json({ error: 'Bu subdomain zaten kullanımda.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const dbName = `tenant_${subdomain}_${Date.now()}`;

    // Provision the database first
    const provisionResult = await provisionTenantDb(subdomain, dbName, email, userName, hashedPassword);
    const createdUserId = provisionResult.createdUserId;

    // Calculate trial end date (14 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Save Tenant in Master DB
    const tenant = await masterDb.tenant.create({
      data: {
        name: companyName,
        subdomain,
        dbName,
        planName: 'FREE',
        subscriptionStatus: 'TRIALING',
        trialEndsAt,
        users: {
          create: {
            email,
            name: userName,
            password: hashedPassword,
          }
        }
      }
    });

    // Auto-login session cookie logic
    const sessionData = {
      userId: createdUserId,
      email: email,
      role: null, // Initial roleId might be fetched from tenant DB or set directly
      subdomain: subdomain,
      name: userName,
      mustChangePassword: false
    };

    const encodedSession = Buffer.from(JSON.stringify(sessionData)).toString('base64');
    
    const response = NextResponse.json({ success: true, tenant });
    
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost';
    const cookieDomain = rootDomain.split(':')[0];

    response.cookies.set({
      name: 'auth_session',
      value: encodedSession,
      httpOnly: true,
      path: '/',
      domain: cookieDomain === 'localhost' ? undefined : `.${cookieDomain}`,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;

  } catch (error: any) {
    console.error('Onboarding Error:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
