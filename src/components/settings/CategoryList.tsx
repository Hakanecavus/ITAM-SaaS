'use client';

import { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { updateCategory, deleteCategory } from '@/app/actions/settings';

type Category = {
  id: string;
  name: string;
};

export function CategoryList({ categories, subdomain }: { categories: Category[], subdomain: string }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setLoadingId(id);
    const res = await updateCategory(subdomain, id, editName.trim());
    if (res.error) {
      alert(res.error);
    } else {
      setEditingId(null);
    }
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    setLoadingId(id);
    const res = await deleteCategory(subdomain, id);
    if (res.error) {
      alert(res.error);
    }
    setLoadingId(null);
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
        Henüz kategori eklenmemiş.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
      {categories.map(cat => (
        <div key={cat.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors group">
          
          {editingId === cat.id ? (
            <div className="flex-1 flex items-center gap-2 mr-4">
              <input 
                type="text" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 border border-indigo-300 dark:border-indigo-500 rounded-lg outline-none text-sm"
                autoFocus
                disabled={loadingId === cat.id}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdate(cat.id);
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <button 
                onClick={() => handleUpdate(cat.id)}
                disabled={loadingId === cat.id}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Check size={18} />
              </button>
              <button 
                onClick={handleCancelEdit}
                disabled={loadingId === cat.id}
                className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{cat.name}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(cat)}
                  disabled={loadingId === cat.id}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Düzenle"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(cat.id)}
                  disabled={loadingId === cat.id}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Sil"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
