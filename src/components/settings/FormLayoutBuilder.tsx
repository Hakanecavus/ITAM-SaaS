'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export type FormBlock = 'header' | 'assetInfo' | 'userInfo' | 'notes' | 'signatures';

const blockLabels: Record<FormBlock, string> = {
  header: 'Antet ve Şirket Kimliği',
  assetInfo: 'Cihaz Bilgileri',
  userInfo: 'Kullanıcı Bilgileri',
  notes: 'Notlar ve Taahhütname',
  signatures: 'İmzalar',
};

const DEFAULT_LAYOUT: FormBlock[] = ['header', 'assetInfo', 'userInfo', 'notes', 'signatures'];

export function FormLayoutBuilder({ initialLayoutStr }: { initialLayoutStr?: string }) {
  let initialLayout: FormBlock[] = DEFAULT_LAYOUT;
  try {
    if (initialLayoutStr) {
      initialLayout = JSON.parse(initialLayoutStr);
      // Fallback if some blocks are missing
      const missingBlocks = DEFAULT_LAYOUT.filter(b => !initialLayout.includes(b));
      if (missingBlocks.length > 0) {
        initialLayout = [...initialLayout, ...missingBlocks];
      }
    }
  } catch (e) {}

  const [layout, setLayout] = useState<FormBlock[]>(initialLayout);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newLayout = [...layout];
    const temp = newLayout[index - 1];
    newLayout[index - 1] = newLayout[index];
    newLayout[index] = temp;
    setLayout(newLayout);
  };

  const moveDown = (index: number) => {
    if (index === layout.length - 1) return;
    const newLayout = [...layout];
    const temp = newLayout[index + 1];
    newLayout[index + 1] = newLayout[index];
    newLayout[index] = temp;
    setLayout(newLayout);
  };

  return (
    <div className="space-y-3">
      {/* Hidden input to submit the layout array as JSON string */}
      <input type="hidden" name="formLayout" value={JSON.stringify(layout)} />
      
      {layout.map((block, index) => (
        <div key={block} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500 shadow-sm border border-slate-200 dark:border-slate-700">
              {index + 1}
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{blockLabels[block]}</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              type="button"
              onClick={() => moveUp(index)}
              disabled={index === 0}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
              title="Yukarı Taşı"
            >
              <ArrowUp size={20} />
            </button>
            <button 
              type="button"
              onClick={() => moveDown(index)}
              disabled={index === layout.length - 1}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
              title="Aşağı Taşı"
            >
              <ArrowDown size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
