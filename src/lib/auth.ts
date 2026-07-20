import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface AuthSession {
  userId: string;
  email: string;
  role: string;
  subdomain: string;
  name: string;
  mustChangePassword?: boolean;
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session');
  
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    return JSON.parse(decoded) as AuthSession;
  } catch (error) {
    return null;
  }
}

export async function requireAuth(allowSetup = false) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  
  if (session.mustChangePassword && !allowSetup) {
    redirect(`/setup-password`);
  }
  
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.role !== 'ADMIN' && session.role !== 'Sistem Yöneticisi') { // For backward compatibility temporarily
    redirect('/my-assets'); 
  }
  return session;
}

export async function hasPermission(permission: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  // Root domain admins
  if (session.role === 'ADMIN') return true;

  try {
    const { getTenantDb } = await import('@/lib/db');
    const db = await getTenantDb(session.subdomain);
    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { role: true }
    });

    if (!user || !user.role || !user.canLogin) return false;

    // Sistem Yöneticisi can do anything
    if (user.role.name === 'Sistem Yöneticisi') return true;

    try {
      const perms = JSON.parse(user.role.permissions) as string[];
      return perms.includes(permission);
    } catch {
      return false;
    }
  } catch (error) {
    return false;
  }
}

export async function requirePermission(permission: string) {
  const session = await requireAuth();
  const allowed = await hasPermission(permission);
  
  if (!allowed) {
    redirect('/my-assets'); // Unauthorized access sends to their own portal
  }
  
  return session;
}

export async function getUserContext() {
  const session = await getSession();
  if (!session) return null;
  
  try {
    const { getTenantDb } = await import('@/lib/db');
    const db = await getTenantDb(session.subdomain);
    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { role: true }
    });
    
    if (!user) return null;
    
    let locationIds: string[] = [];
    if (user.managedLocationIds) {
      try {
        locationIds = JSON.parse(user.managedLocationIds);
      } catch (e) {}
    }
    
    // Admin has access to everything
    if (session.role === 'ADMIN' || session.role === 'Sistem Yöneticisi') {
      locationIds = []; // Empty means no restriction
    }
    
    return { session, user, locationIds };
  } catch {
    return null;
  }
}
