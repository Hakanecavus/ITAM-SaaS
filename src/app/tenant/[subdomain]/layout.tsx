import { Sidebar } from '@/components/layout/Sidebar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { SubscriptionGuard } from '@/components/billing/SubscriptionGuard';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const resolvedParams = await params;
  
  // Layout seviyesinde tüm sayfalara izin veriyoruz, 
  // detaylı koruma alt sayfalarda veya middleware'de yapılır.
  const session = await requireAuth(true);

  // Get tenant db to fetch role permissions
  const { getTenantDb } = await import('@/lib/db');
  const db = await getTenantDb(resolvedParams.subdomain);
  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { role: true }
  });

  let userPermissions: string[] = [];
  let roleName = 'USER';
  let isSystemAdmin = false;

  if (session.role === 'ADMIN') {
    isSystemAdmin = true;
    userPermissions = ['VIEW_DASHBOARD', 'VIEW_ASSETS', 'MANAGE_ASSETS', 'VIEW_USERS', 'MANAGE_USERS', 'VIEW_LICENSES', 'MANAGE_LICENSES', 'VIEW_CONSUMABLES', 'MANAGE_CONSUMABLES', 'MANAGE_ROLES', 'MANAGE_SETTINGS', 'VIEW_FINANCE'];
  } else if (user?.role) {
    roleName = user.role.name;
    if (roleName === 'Sistem Yöneticisi') {
      isSystemAdmin = true;
      userPermissions = ['VIEW_DASHBOARD', 'VIEW_ASSETS', 'MANAGE_ASSETS', 'VIEW_USERS', 'MANAGE_USERS', 'VIEW_LICENSES', 'MANAGE_LICENSES', 'VIEW_CONSUMABLES', 'MANAGE_CONSUMABLES', 'MANAGE_ROLES', 'MANAGE_SETTINGS', 'VIEW_FINANCE'];
    } else {
      try {
        userPermissions = JSON.parse(user.role.permissions);
      } catch {}
    }
  }

  const logoSetting = await db.tenantSetting.findUnique({
    where: { key: 'companyLogoUrl' }
  });
  const tenantLogoUrl = logoSetting?.value || undefined;

  const { masterDb } = await import('@/lib/db');
  const masterTenant = await masterDb.tenant.findUnique({
    where: { subdomain: resolvedParams.subdomain }
  });

  let subscriptionExpired = false;
  let trialDaysLeft = 0;

  if (masterTenant) {
    if (masterTenant.subscriptionStatus === 'TRIALING' && masterTenant.trialEndsAt) {
      const msLeft = new Date(masterTenant.trialEndsAt).getTime() - Date.now();
      trialDaysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      if (trialDaysLeft <= 0) subscriptionExpired = true;
    } else if (masterTenant.subscriptionStatus === 'CANCELED' || masterTenant.subscriptionStatus === 'PAST_DUE') {
      subscriptionExpired = true;
    }
  }

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 print:h-auto print:block">
      <Sidebar 
        subdomain={resolvedParams.subdomain} 
        tenantLogoUrl={tenantLogoUrl} 
        roleName={roleName}
        isSystemAdmin={isSystemAdmin}
        userPermissions={userPermissions}
        userName={session.name || ''}
        userEmail={session.email || ''}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[var(--background)] print:overflow-visible print:block">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-[var(--card-bg)] flex items-center px-8 justify-between sticky top-0 z-10 transition-colors duration-300 print:hidden">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight capitalize">
            BT Envanter Yönetimi
          </h1>
          <div className="flex items-center gap-6">
            <span className="text-sm text-slate-500 hidden md:block">{resolvedParams.subdomain}.itamsaas.com</span>
            <NotificationBell subdomain={resolvedParams.subdomain} />
          </div>
        </header>
        
        <div className="flex-1 overflow-auto flex flex-col relative print:overflow-visible print:block">
          
          {subscriptionExpired && (
            <div className="bg-red-500 text-white px-4 py-3 text-sm text-center font-medium shadow-md z-20">
              ⚠️ Abonelik süreniz dolmuştur veya ödemeniz alınamamıştır. Sisteme erişiminiz kısıtlandı. Lütfen {' '}
              <a href={`/settings/billing`} className="underline font-bold hover:text-red-100">Ayarlar &gt; Faturalandırma</a> sayfasından aboneliğinizi yenileyin.
            </div>
          )}

          {!subscriptionExpired && trialDaysLeft > 0 && trialDaysLeft <= 14 && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400 px-4 py-2 text-sm text-center font-medium shadow-sm z-20">
              Ücretsiz deneme sürenizin bitmesine <strong>{trialDaysLeft} gün</strong> kaldı. {' '}
              <a href={`/settings/billing`} className="underline hover:text-amber-800 dark:hover:text-amber-300">Hemen Abone Olun</a>
            </div>
          )}

          <div className="flex-1 p-4 md:p-8">
            <div className="max-w-7xl mx-auto w-full space-y-6">
              <SubscriptionGuard expired={subscriptionExpired}>
                {children}
              </SubscriptionGuard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
