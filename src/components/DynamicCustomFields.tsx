'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export function DynamicCustomFields({ initialFields = {} }: { initialFields?: Record<string, string> }) {
  const [fields, setFields] = useState<{key: string, value: string}[]>(
    Object.entries(initialFields).map(([key, value]) => ({ key, value }))
  );

  const addField = () => setFields([...fields, { key: '', value: '' }]);
  const removeField = (index: number) => setFields(fields.filter((_, i) => i !== index));
  const updateField = (index: number, key: string, value: string) => {
    const newFields = [...fields];
    newFields[index] = { key, value };
    setFields(newFields);
  };

  const customFieldsJson = JSON.stringify(fields.reduce((acc, f) => {
    if (f.key.trim()) acc[f.key.trim()] = f.value.trim();
    return acc;
  }, {} as Record<string, string>));

  return (
    <div className="md:col-span-2 border-t border-slate-200 dark:border-slate-800 pt-6 mt-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Özel Alanlar (Opsiyonel)</h3>
          <p className="text-xs text-slate-500 mt-1">Cihaza özgü RAM, İşlemci, Ekran Boyutu gibi ek bilgiler ekleyin.</p>
        </div>
        <button type="button" onClick={addField} className="text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors">
          <Plus size={16} /> Alan Ekle
        </button>
      </div>
      
      <input type="hidden" name="customFields" value={customFieldsJson} />

      <div className="space-y-3">
        {fields.map((f, i) => (
          <div key={i} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
            <input 
              placeholder="Özellik Adı (Örn: RAM)" 
              value={f.key}
              onChange={(e) => updateField(i, e.target.value, f.value)}
              className="flex-1 p-3 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            />
            <input 
              placeholder="Değer (Örn: 16 GB)" 
              value={f.value}
              onChange={(e) => updateField(i, f.key, e.target.value)}
              className="flex-1 p-3 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            />
            <button type="button" onClick={() => removeField(i)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors border border-transparent">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
