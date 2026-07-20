'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MonitorSmartphone, 
  Key, 
  ScanLine, 
  FileBarChart, 
  Settings,
  Package,
  LogOut
} from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

interface SidebarProps {
  tenantLogoUrl?: string;
  subdomain: string;
  roleName: string;
  isSystemAdmin: boolean;
  userPermissions: string[];
  userName: string;
  userEmail: string;
}

export function Sidebar({ tenantLogoUrl, subdomain, roleName, isSystemAdmin, userPermissions, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [];

  if (isSystemAdmin || userPermissions.includes('VIEW_DASHBOARD')) {
    menuItems.push({ name: 'Dashboard', path: `/dashboard`, icon: LayoutDashboard });
  }
  if (isSystemAdmin || userPermissions.includes('VIEW_ASSETS') || userPermissions.includes('MANAGE_ASSETS')) {
    menuItems.push({ name: 'Cihazlar', path: `/assets`, icon: MonitorSmartphone });
  }
  if (isSystemAdmin || userPermissions.includes('VIEW_LICENSES') || userPermissions.includes('MANAGE_LICENSES')) {
    menuItems.push({ name: 'Lisanslar', path: `/licenses`, icon: Key });
  }
  if (isSystemAdmin || userPermissions.includes('VIEW_CONSUMABLES') || userPermissions.includes('MANAGE_CONSUMABLES')) {
    menuItems.push({ name: 'Sarf Malzemeleri', path: `/consumables`, icon: Package });
  }
  if (isSystemAdmin || userPermissions.includes('VIEW_USERS') || userPermissions.includes('MANAGE_USERS')) {
    menuItems.push({ name: 'Çalışanlar', path: `/users`, icon: FileBarChart });
  }
  // Fiziksel sayım vs. for now we'll show if they have MANAGE_ASSETS
  if (isSystemAdmin || userPermissions.includes('MANAGE_ASSETS')) {
    menuItems.push({ name: 'Fiziksel Sayım', path: `/inventory`, icon: ScanLine });
  }
  if (isSystemAdmin || userPermissions.includes('MANAGE_SETTINGS') || userPermissions.includes('MANAGE_ROLES')) {
    menuItems.push({ name: 'Ayarlar', path: `/settings`, icon: Settings });
    menuItems.push({ name: 'Abonelik ve Fatura', path: `/settings/billing`, icon: FileBarChart });
    menuItems.push({ name: 'Sistem Günlüğü', path: `/settings/audit-logs`, icon: FileBarChart });
  }

  // IT Desk (Admin view of tickets)
  if (isSystemAdmin || userPermissions.includes('MANAGE_ASSETS')) {
    menuItems.push({ name: 'Destek Talepleri', path: `/tickets`, icon: Package });
  }

  // Finansal Raporlar (Phase 5.2)
  if (isSystemAdmin || userPermissions.includes('VIEW_FINANCE')) {
    menuItems.push({ name: 'Finansal Raporlar', path: `/reports/financial`, icon: FileBarChart });
  }

  // Herkes Zimmetlerim ve Taleplerim görebilir
  menuItems.push({ name: 'Zimmetlerim', path: `/my-assets`, icon: MonitorSmartphone });
  menuItems.push({ name: 'Taleplerim', path: `/my-tickets`, icon: LayoutDashboard });

  return (
    <aside className="w-64 h-screen flex flex-col bg-[var(--card-bg)] border-r border-slate-200 dark:border-slate-800 transition-colors duration-300 flex-shrink-0 sticky top-0 print:hidden">
      
      {/* Logo Alanı */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
        {tenantLogoUrl ? (
          <div className="flex items-center gap-2">
            <img src={tenantLogoUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" />
            <span className="text-slate-400 text-sm font-normal whitespace-nowrap">| BT Envanter</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xl">
            <span className="text-[var(--primary)] tracking-tight uppercase">{subdomain}</span>
            <span className="text-slate-400 text-sm font-normal whitespace-nowrap">| BT Envanter</span>
          </div>
        )}
      </div>

      {/* Navigasyon Menüsü */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = pathname.endsWith(item.path) || pathname === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200
                    ${isActive 
                      ? 'bg-red-50 dark:bg-red-500/10 text-[var(--primary)] font-medium relative' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-[var(--primary)] rounded-r-md"></div>
                  )}
                  <Icon size={20} className={isActive ? 'text-[var(--primary)]' : 'opacity-70'} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

        {/* Kullanıcı Profili ve Tema Değiştirici */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-red-500/10 text-[var(--primary)] flex items-center justify-center font-bold flex-shrink-0">
            {userName ? userName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white break-words" title={userName || userEmail}>
              {userName || userEmail}
            </p>
            <p className="text-xs text-slate-500 break-words" title={roleName}>{roleName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={async () => {
              if (!confirm('Çıkış yapmak istediğinize emin misiniz?')) return;
              await fetch('/api/logout', { method: 'POST' });
              window.location.href = '/login';
            }}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            title="Çıkış Yap"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
