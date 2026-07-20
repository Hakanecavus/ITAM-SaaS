export const PERMISSIONS = {
  // Yönetim Paneli ve Dashboard
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  
  // Demirbaş (Asset) İzinleri
  VIEW_ASSETS: 'VIEW_ASSETS',
  MANAGE_ASSETS: 'MANAGE_ASSETS',
  
  // Kullanıcı ve Çalışan Yönetimi
  VIEW_USERS: 'VIEW_USERS',
  MANAGE_USERS: 'MANAGE_USERS',
  
  // Lisans Yönetimi
  VIEW_LICENSES: 'VIEW_LICENSES',
  MANAGE_LICENSES: 'MANAGE_LICENSES',
  
  // Sarf Malzemesi İzinleri
  VIEW_CONSUMABLES: 'VIEW_CONSUMABLES',
  MANAGE_CONSUMABLES: 'MANAGE_CONSUMABLES',

  // Bakım ve Arıza
  MANAGE_MAINTENANCE: 'MANAGE_MAINTENANCE',

  // Finans ve Bütçe
  VIEW_FINANCE: 'VIEW_FINANCE',
  
  // Ayarlar ve Roller
  MANAGE_ROLES: 'MANAGE_ROLES',
  MANAGE_SETTINGS: 'MANAGE_SETTINGS',
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const PERMISSION_LABELS: Record<Permission, string> = {
  VIEW_DASHBOARD: 'Dashboard Görüntüleme',
  VIEW_ASSETS: 'Demirbaşları Görüntüleme',
  MANAGE_ASSETS: 'Demirbaş Ekleme / Düzenleme / Zimmetleme',
  VIEW_USERS: 'Çalışan Listesini Görüntüleme',
  MANAGE_USERS: 'Çalışan Ekleme / Düzenleme',
  VIEW_LICENSES: 'Yazılım Lisanslarını Görüntüleme',
  MANAGE_LICENSES: 'Lisans Ekleme ve Atama',
  VIEW_CONSUMABLES: 'Sarf Malzemelerini Görüntüleme',
  MANAGE_CONSUMABLES: 'Sarf Malzemesi Ekleme ve Stok Güncelleme',
  MANAGE_MAINTENANCE: 'Bakım ve Arıza Kayıtlarını Yönetme',
  VIEW_FINANCE: 'Finansal Verileri (Maliyet vb.) Görüntüleme',
  MANAGE_ROLES: 'Rol ve Yetki Yönetimi',
  MANAGE_SETTINGS: 'Sistem ve Form Ayarları Yönetimi',
};
