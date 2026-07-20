'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createUser, updateUser } from '@/app/actions/user';
import { Loader2, KeyRound, RefreshCw, Shield, User, Mail, MapPin } from 'lucide-react';

interface Role {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
}

interface UserFormProps {
  subdomain: string;
  roles: Role[];
  locations: Location[];
  initialData?: {
    id: string;
    name: string;
    email: string;
    title?: string | null;
    canLogin: boolean;
    roleId: string | null;
    managedLocationIds?: string | null;
  };
}

export function UserForm({ subdomain, roles, locations, initialData }: UserFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [canLogin, setCanLogin] = useState(initialData?.canLogin || false);
  const [password, setPassword] = useState('');
  
  // Parse initial locations
  const [selectedLocations, setSelectedLocations] = useState<string[]>(() => {
    if (initialData?.managedLocationIds) {
      try {
        return JSON.parse(initialData.managedLocationIds);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Sadece ilk kez yetki verirken zorunlu
  const isNewLoginAccess = canLogin && !initialData?.canLogin;

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleLocationToggle = (id: string) => {
    setSelectedLocations(prev => 
      prev.includes(id) ? prev.filter(loc => loc !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      title: formData.get('title') as string,
      canLogin,
      roleId: canLogin ? (formData.get('roleId') as string) : undefined,
      initialPassword: password || undefined,
      newPassword: password || undefined,
      managedLocationIds: canLogin ? JSON.stringify(selectedLocations) : null,
    };

    if (canLogin && !data.roleId) {
      toast.error('Lütfen bir rol seçin.');
      return;
    }

    if (isNewLoginAccess && !data.initialPassword) {
      toast.error('Giriş yetkisi verdiğiniz kullanıcı için geçici bir şifre belirlemelisiniz.');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading(initialData ? 'Çalışan güncelleniyor...' : 'Çalışan ekleniyor...');

    try {
      const result = initialData 
        ? await updateUser(subdomain, initialData.id, data)
        : await createUser(subdomain, data);

      if (result.error) {
        toast.error(result.error, { id: toastId });
        setIsLoading(false);
      } else {
        toast.success(initialData ? 'Kullanıcı başarıyla güncellendi!' : 'Kullanıcı başarıyla oluşturuldu!', { id: toastId });
        router.push(`/users`);
        router.refresh();
      }
    } catch (error) {
      toast.error('Beklenmeyen bir hata oluştu.', { id: toastId });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <User size={16} /> Ad Soyad
          </label>
          <input 
            type="text" 
            name="name"
            required
            defaultValue={initialData?.name}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="Örn: Ahmet Yılmaz"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Mail size={16} /> E-posta Adresi
          </label>
          <input 
            type="email" 
            name="email"
            required
            defaultValue={initialData?.email}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="Örn: ahmet@sirket.com"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            Şirket İçi Görev / Unvan (Opsiyonel)
          </label>
          <input 
            type="text" 
            name="title"
            defaultValue={initialData?.title || ''}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="Örn: Muhasebe Müdürü"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Sisteme Giriş Yetkisi</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Bu çalışanın sisteme kendi şifresiyle girebilmesini istiyorsanız aktifleştirin.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={canLogin}
              onChange={(e) => setCanLogin(e.target.checked)}
            />
            <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {canLogin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300 bg-indigo-50/50 dark:bg-indigo-500/5 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/10">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Shield size={16} className="text-indigo-500" /> Sistem Rolü
              </label>
              <select 
                name="roleId"
                required={canLogin}
                defaultValue={initialData?.roleId || ''}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
              >
                <option value="" disabled>Rol Seçin...</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <MapPin size={16} className="text-rose-500" /> Yönettiği Lokasyonlar (Kısıtlı Görüntüleme)
              </label>
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                {locations.length === 0 ? (
                  <div className="text-sm text-slate-500 px-2">Henüz hiç lokasyon eklenmemiş.</div>
                ) : (
                  locations.map(loc => (
                    <label key={loc.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedLocations.includes(loc.id)}
                        onChange={() => handleLocationToggle(loc.id)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{loc.name}</span>
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Boş bırakılırsa tüm lokasyonlara erişebilir (Rolün yetkisi dahilinde). Seçim yapılırsa sadece seçili lokasyonların verilerini görür.
              </p>
            </div>

            {isNewLoginAccess && (
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound size={16} className="text-amber-500" /> Geçici Şifre
                  </div>
                  <button 
                    type="button" 
                    onClick={generatePassword}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw size={12} /> Rastgele Üret
                  </button>
                </label>
                <input 
                  type="text" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={isNewLoginAccess}
                  className="w-full bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-900/50 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                  placeholder="Şifreyi elle yazabilir veya üretebilirsiniz"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Kullanıcı ilk girişinde bu şifreyi kendi belirleyeceği yeni bir şifre ile değiştirmek zorunda kalacaktır.
                </p>
              </div>
            )}
            
            {initialData?.canLogin && canLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound size={16} className="text-indigo-500" /> Şifreyi Güncelle (Opsiyonel)
                  </div>
                </label>
                <input 
                  type="text" 
                  name="newPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                  placeholder="Değiştirmek istemiyorsanız boş bırakın"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Şifreyi değiştirirseniz kullanıcının mevcut şifresi geçersiz olacaktır.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 disabled:opacity-70"
        >
          {isLoading && <Loader2 className="animate-spin" size={18} />}
          {initialData ? 'Değişiklikleri Kaydet' : 'Çalışanı Ekle'}
        </button>
      </div>
    </form>
  );
}
