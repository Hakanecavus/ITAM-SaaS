'use server';

import { masterDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function changePassword(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.mustChangePassword) {
      return { error: 'Geçersiz işlem.' };
    }

    const password = formData.get('password') as string;
    
    if (!password || password.length < 6) {
      return { error: 'Şifre en az 6 karakter olmalıdır.' };
    }

    // Update in Master DB
    await masterDb.user.update({
      where: { email: session.email },
      data: { 
        password: password, // Ideally hashed with bcrypt
        mustChangePassword: false 
      }
    });

    // Update session cookie to remove mustChangePassword
    const newSession = { ...session };
    delete newSession.mustChangePassword;

    const encodedSession = Buffer.from(JSON.stringify(newSession)).toString('base64');
    
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost';
    const cookieDomain = rootDomain.split(':')[0];

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'auth_session',
      value: encodedSession,
      httpOnly: true,
      path: '/',
      domain: cookieDomain === 'localhost' ? undefined : `.${cookieDomain}`,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return { success: true };
  } catch (error: any) {
    console.error('Change Password Error:', error);
    return { error: 'Şifre güncellenemedi.' };
  }
}
