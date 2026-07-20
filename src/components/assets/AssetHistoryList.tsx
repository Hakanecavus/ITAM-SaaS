'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { updateHistoryDocument } from '@/app/actions/history';

export function AssetHistoryList({ history, subdomain, assetId }: { history: any[], subdomain: string, assetId: string }) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleFileUpload = async (historyId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan büyük olamaz.');
      return;
    }

    setUploadingId(historyId);

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

      const result = await updateHistoryDocument(subdomain, historyId, data.documentUrl, assetId);
      if (result.error) throw new Error(result.error);

      toast.success('Belge başarıyla yüklendi.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
      {history.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 relative z-10 bg-slate-50 dark:bg-slate-900 py-2 text-center rounded-xl">Henüz işlem yapılmamış.</p>
      ) : (
        history.map(item => (
          <div key={item.id} className="relative z-10 flex items-center justify-between">
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full shadow-sm ring-4 ring-white dark:ring-slate-900
                  ${item.actionType === 'ASSIGN' ? 'bg-emerald-500' : 'bg-sky-500'}`}></div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="ml-6 p-4 bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {item.actionType === 'ASSIGN' ? 'Zimmetlendi' : 
                       item.actionType === 'RETURN' ? 'İade Alındı' :
                       item.actionType === 'STATUS_CHANGE' ? 'Durum Güncellendi' : item.actionType}
                    </p>
                    {item.user && <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">Kişi: {item.user.name}</p>}
                  </div>
                  
                  <div className="flex flex-col gap-2 items-end">
                    {/* Belge yükleme veya E-İmza formu linki aşağıda gösterilecek */}
                  </div>
                </div>
                {item.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">{item.notes}</p>}
                
                {/* Document Upload Area */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap justify-between items-center gap-4">
                  
                  {/* Action Buttons: Yazdır & Yükle */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Form Yazdır Button for Assign/Return actions */}
                    {(item.actionType === 'ASSIGN' || item.actionType === 'RETURN') && (
                      <a 
                        href={`/assets/${assetId}/form/${item.id}`} 
                        target="_blank"
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Form Yazdır
                      </a>
                    )}

                    {item.documentUrl ? (
                      <a href={item.documentUrl} target="_blank" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/30 transition-colors shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        İmzalı Belge
                      </a>
                    ) : (
                      <div>
                        <label className={`text-xs font-medium ${uploadingId === item.id ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer'} flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          {uploadingId === item.id ? 'Yükleniyor...' : 'Belge Yükle'}
                          <input 
                            type="file" 
                            className="hidden" 
                            accept=".pdf,image/jpeg,image/png,image/jpg"
                            disabled={uploadingId === item.id}
                            onChange={(e) => handleFileUpload(item.id, e)}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
