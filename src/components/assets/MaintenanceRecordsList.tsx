'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { updateMaintenanceDocument } from '@/app/actions/maintenance';

export function MaintenanceRecordsList({ records, subdomain, assetId, canViewFinance = true }: { records: any[], subdomain: string, assetId: string, canViewFinance?: boolean }) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleFileUpload = async (maintenanceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan büyük olamaz.');
      return;
    }

    setUploadingId(maintenanceId);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Yükleme başarısız');
      }

      const result = await updateMaintenanceDocument(subdomain, maintenanceId, data.documentUrl, assetId);
      if (!result.success) throw new Error('Yükleme kaydedilemedi.');

      toast.success('Servis faturası/belgesi başarıyla yüklendi.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  if (records.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-4">Henüz bakım kaydı bulunmuyor.</p>;
  }

  return (
    <div className="space-y-4">
      {records.map(record => (
        <div key={record.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="w-full">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                record.type === 'REPAIR' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                record.type === 'UPGRADE' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
              }`}>
                {record.type === 'REPAIR' ? 'TAMİR' : record.type === 'UPGRADE' ? 'YÜKSELTME' : 'BAKIM'}
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{record.provider}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(record.startDate).toLocaleDateString('tr-TR')} {record.details && `- ${record.details}`}</p>
            
            {/* Document Upload Area */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center w-full">
              {record.documentUrl ? (
                <a href={record.documentUrl} target="_blank" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Fatura/Belge Görüntüle
                </a>
              ) : (
                <label className={`text-xs font-medium ${uploadingId === record.id ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer'} flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {uploadingId === record.id ? 'Yükleniyor...' : 'Fatura/Belge Yükle'}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,image/jpeg,image/png,image/jpg"
                    disabled={uploadingId === record.id}
                    onChange={(e) => handleFileUpload(record.id, e)}
                  />
                </label>
              )}
            </div>
          </div>
          {canViewFinance && record.cost && (
            <div className="text-right">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(record.cost)}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
