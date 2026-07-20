'use client';

import { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { createRole, updateRole, deleteRole } from '@/app/actions/roles';
import { PERMISSION_LABELS, Permission } from '@/lib/permissions';
import { toast } from 'react-hot-toast';

export function RoleManager({ 
  initialRoles, 
  subdomain, 
  availablePermissions 
}: { 
  initialRoles: any[]; 
  subdomain: string; 
  availablePermissions: string[];
}) {
  const [roles, setRoles] = useState(initialRoles);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedPermissions([]);
    setIsDefault(false);
    setIsEditing(null);
    setShowForm(false);
  };

  const handleEdit = (role: any) => {
    setName(role.name);
    setDescription(role.description || '');
    setIsDefault(role.isDefault);
    try {
      setSelectedPermissions(JSON.parse(role.permissions));
    } catch {
      setSelectedPermissions([]);
    }
    setIsEditing(role.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePermission = (perm: string) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast.error('Rol adı zorunludur.');
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('permissions', JSON.stringify(selectedPermissions));
    formData.append('isDefault', isDefault.toString());

    let res;
    if (isEditing) {
      res = await updateRole(subdomain, isEditing, formData);
    } else {
      res = await createRole(subdomain, formData);
    }

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(isEditing ? 'Rol güncellendi.' : 'Yeni rol oluşturuldu.');
      setTimeout(() => window.location.reload(), 1000);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (role: any) => {
    if (role.name === 'Sistem Yöneticisi' || role.name === 'Standart Kullanıcı') {
      return toast.error('Sistem varsayılan rolleri silinemez.');
    }
    if (role._count.users > 0) {
      return toast.error('Bu role atanmış kullanıcılar var. Önce kullanıcıların rolünü değiştirin.');
    }
    
    if (confirm(`'${role.name}' rolünü silmek istediğinize emin misiniz?`)) {
      const res = await deleteRole(subdomain, role.id);
      if (res.error) toast.error(res.error);
      else {
        toast.success('Rol silindi.');
        setRoles(roles.filter(r => r.id !== role.id));
      }
    }
  };

  return (
    <div className="space-y-8">
      
      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              {isEditing ? 'Rolü Düzenle' : 'Yeni Rol Oluştur'}
            </h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Rol Adı</label>
                <input value={name} onChange={e => setName(e.target.value)} required placeholder="Örn: IK Uzmanı"
                  className="w-full p-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={isEditing && (name === 'Sistem Yöneticisi' || name === 'Standart Kullanıcı') as any}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Açıklama</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Rolün ne işe yaradığı..."
                  className="w-full p-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
              <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Varsayılan Rol Yap</p>
                  <p className="text-xs text-slate-500">Sisteme yeni giriş yetkisi verilen kullanıcılara otomatik bu rol atanır.</p>
                </div>
              </label>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 max-h-[300px] overflow-y-auto">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 sticky top-0 bg-white dark:bg-slate-950 pb-2">Erişim Yetkileri</label>
              
              {isEditing && name === 'Sistem Yöneticisi' ? (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm">
                  Bu rol sistemdeki tüm yetkilere sahiptir ve değiştirilemez.
                </div>
              ) : (
                <div className="space-y-2">
                  {availablePermissions.map((perm) => (
                    <label key={perm} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${selectedPermissions.includes(perm) ? 'bg-indigo-50/50 dark:bg-indigo-500/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                      <input 
                        type="checkbox" 
                        checked={selectedPermissions.includes(perm)} 
                        onChange={() => togglePermission(perm)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {PERMISSION_LABELS[perm as Permission] || perm}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={resetForm} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              İptal
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all">
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex justify-end">
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all hover:-translate-y-0.5">
            <Plus size={16} /> Yeni Rol Oluştur
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(role => {
          let perms: string[] = [];
          try { perms = JSON.parse(role.permissions); } catch {}
          
          return (
            <div key={role.id} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Shield className={`w-5 h-5 ${role.name === 'Sistem Yöneticisi' ? 'text-amber-500' : 'text-indigo-500'}`} />
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{role.name}</h4>
                  {role.isDefault && <span className="px-2 py-0.5 bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400 text-[10px] font-bold rounded-md">VARSAYILAN</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(role)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  {role.name !== 'Sistem Yöneticisi' && role.name !== 'Standart Kullanıcı' && (
                    <button onClick={() => handleDelete(role)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{role.description || 'Açıklama yok.'}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md">
                  {role.name === 'Sistem Yöneticisi' ? 'Tüm Yetkiler' : `${perms.length} Yetki`}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {role._count.users} Kullanıcı
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
