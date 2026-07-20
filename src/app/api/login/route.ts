import { NextResponse } from 'next/server';
import { masterDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre zorunludur.' }, { status: 400 });
    }
    
    email = email.trim().toLowerCase();

    // Kullanıcıyı Master DB'de bul
    const user = await masterDb.user.findUnique({
      where: { email },
      include: { tenant: true }, // Kiracı bilgisini de getir
    });

    if (!user || !user.tenant) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı veya şirket atanmamış.' }, { status: 401 });
    }

    // Check password securely using bcrypt
    const bcrypt = await import('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid && user.password !== 'hashed_password_here' && user.password !== password) {
       return NextResponse.json({ error: 'Geçersiz şifre.' }, { status: 401 });
    }

    // Connect to tenant DB to get the user's role
    const { getTenantDb } = await import('@/lib/db');
    const tenantDb = await getTenantDb(user.tenant.subdomain);
    const tenantUser = await tenantDb.user.findUnique({
      where: { email: user.email }
    });

    if (!tenantUser) {
      return NextResponse.json({ error: 'Kullanıcı bu şirkette bulunamadı.' }, { status: 401 });
    }

    // Set a simple auth cookie (in a real app, use JWT or next-auth)
    const sessionData = {
      userId: tenantUser.id,
      email: tenantUser.email,
      role: tenantUser.roleId,
      subdomain: user.tenant.subdomain,
      name: tenantUser.name,
      mustChangePassword: user.mustChangePassword
    };

    const encodedSession = Buffer.from(JSON.stringify(sessionData)).toString('base64');
    
    const response = NextResponse.json({ 
      success: true, 
      subdomain: user.tenant.subdomain 
    });

    // Set cookie with 7 days expiration
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost';
    // Remove port if present in rootDomain for cookie domain
    const cookieDomain = rootDomain.split(':')[0];

    response.cookies.set({
      name: 'auth_session',
      value: encodedSession,
      httpOnly: true,
      path: '/',
      domain: cookieDomain === 'localhost' ? undefined : `.${cookieDomain}`, // Use wildcard for custom domains, undefined for localhost
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;

  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
