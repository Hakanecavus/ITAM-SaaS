'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { importMappedAssets } from '@/app/actions/assetImport';

// Gerekli sistem alanları
const SYSTEM_FIELDS = [
  { key: 'demirbasNo', label: 'Demirbaş No (*)', required: true },
  { key: 'categoryName', label: 'Kategori (*)', required: true },
  { key: 'brandModel', label: 'Marka & Model (*)', required: true },
  { key: 'locationName', label: 'Lokasyon (*)', required: true },
  { key: 'serialNo', label: 'Seri No', required: false },
  { key: 'status', label: 'Durum', required: false },
  { key: 'purchaseDate', label: 'Satın Alma Tarihi', required: false },
  { key: 'purchaseCost', label: 'Maliyet', required: false }
];

export default function ImportWizard({ subdomain }: { subdomain: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  
  // Excel parse results
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  
  // Mapping: { [systemKey]: "FileHeaderName" }
  const [mapping, setMapping] = useState<Record<string, string>>({});
  
  // Loading state
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Dosya Yükleme (Handle File)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (typeof bstr !== 'string' && !(bstr instanceof ArrayBuffer)) return;
      
      try {
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Tabloyu json'a çevir, boş olanları atla
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' }) as any[];
        
        if (json.length === 0) {
          toast.error('Dosya boş.');
          return;
        }

        // Başlıkları bul
        const headers = Object.keys(json[0]);
        setFileHeaders(headers);
        setRawData(json);

        // Akıllı eşleştirme (Otomatik eşleştirme dener)
        const autoMapping: Record<string, string> = {};
        SYSTEM_FIELDS.forEach(field => {
          // Çok basit bir string benzerliği kontrolü
          const match = headers.find(h => 
            h.toLowerCase().replace(/[^a-z0-9]/g, '') === field.label.toLowerCase().replace(/[^a-z0-9]/g, '') ||
            h.toLowerCase().replace(/[^a-z0-9]/g, '') === field.key.toLowerCase().replace(/[^a-z0-9]/g, '')
          );
          if (match) autoMapping[field.key] = match;
        });
        setMapping(autoMapping);
        
        setStep(2);
      } catch (err) {
        toast.error('Dosya okunamadı. Geçerli bir Excel veya CSV dosyası yükleyin.');
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // 2. Kolon Eşleştirme Onayı
  const handleConfirmMapping = () => {
    // Check if required fields are mapped
    const missing = SYSTEM_FIELDS.filter(f => f.required && !mapping[f.key]);
    if (missing.length > 0) {
      toast.error(`Eksik zorunlu eşleştirmeler: ${missing.map(m => m.label).join(', ')}`);
      return;
    }
    setStep(3);
  };

  // Veriyi Eşleşen Formata Çevir (Preview & Submit için)
  const getMappedData = () => {
    return rawData.map(row => {
      const mappedRow: any = {};
      SYSTEM_FIELDS.forEach(field => {
        const fileHeader = mapping[field.key];
        mappedRow[field.key] = fileHeader ? row[fileHeader] : null;
      });
      return mappedRow;
    });
  };

  // 3. Veritabanına Gönder
  const handleSubmit = async () => {
    const finalData = getMappedData();
    // Validate again
    const invalidRows = finalData.filter(r => !r.demirbasNo || !r.categoryName || !r.brandModel || !r.locationName);
    
    if (invalidRows.length === finalData.length) {
      toast.error('Tüm satırlar hatalı, içe aktarım iptal edildi.');
      return;
    }

    if (invalidRows.length > 0) {
      const proceed = window.confirm(`${invalidRows.length} satırda zorunlu alanlar eksik olduğu için atlanacak. Devam etmek istiyor musunuz?`);
      if (!proceed) return;
    }

    setIsProcessing(true);
    const validData = finalData.filter(r => r.demirbasNo && r.categoryName && r.brandModel && r.locationName);

    const result = await importMappedAssets(subdomain, validData);
    setIsProcessing(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || 'Başarıyla içe aktarıldı.');
      router.push(`/assets`);
    }
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4">
      
      {/* Progress Bar */}
      <div className="flex items-center mb-10 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 rounded-full z-0 transition-all duration-500"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        ></div>
        
        <div className="w-full flex justify-between z-10 relative">
          {[1, 2, 3].map((num) => (
            <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 ${
              step >= num 
                ? 'bg-indigo-600 border-indigo-100 dark:border-indigo-900/50 text-white' 
                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'
            } transition-colors duration-300`}>
              {step > num ? <CheckCircle2 size={20} /> : num}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="space-y-6 text-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dosya Yükle</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Lütfen .xlsx, .xls veya .csv formatında envanter dosyanızı yükleyin.
            </p>
          </div>
          
          <div className="flex justify-center gap-4">
            <a 
              href="/api/import-template" 
              download 
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 font-medium text-sm transition-colors"
            >
              <Download size={18} /> Örnek Şablonu İndir
            </a>
          </div>

          <label className="block w-full max-w-2xl mx-auto p-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer transition-colors group">
            <input 
              type="file" 
              className="hidden" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileUpload} 
            />
            <div className="flex flex-col items-center">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-full group-hover:scale-110 transition-transform mb-4">
                <UploadCloud size={40} />
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Tıklayın veya Sürükleyip Bırakın
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sadece Excel (.xlsx, .xls) ve CSV dosyaları
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Step 2: Mapping */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Sütunları Eşleştirin</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Sistem alanları ile yüklediğiniz dosyadaki sütun başlıklarını eşleştirin.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Sistem Alanı</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Dosyadaki Sütun</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {SYSTEM_FIELDS.map(field => (
                  <tr key={field.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {field.label}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={mapping[field.key] || ''}
                        onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- Sütun Seçin --</option>
                        {fileHeaders.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between max-w-3xl mx-auto pt-6">
            <button 
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={18} /> Geri Dön
            </button>
            <button 
              onClick={handleConfirmMapping}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
            >
              Sonraki Adım <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ön İzleme ve Onay</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Veriler aktarılmadan önce hatalı kayıtları kontrol edin.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 sticky top-0">
                <tr>
                  <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Durum</th>
                  {SYSTEM_FIELDS.map(f => (
                    <th key={f.key} className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
                {getMappedData().slice(0, 100).map((row, i) => {
                  const isInvalid = !row.demirbasNo || !row.categoryName || !row.brandModel || !row.locationName;
                  return (
                    <tr key={i} className={`${isInvalid ? 'bg-rose-50/50 dark:bg-rose-500/5 text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      <td className="py-3 px-4">
                        {isInvalid ? (
                          <div className="flex items-center gap-1 font-medium">
                            <AlertCircle size={16} /> Hatalı
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 size={16} /> Geçerli
                          </div>
                        )}
                      </td>
                      {SYSTEM_FIELDS.map(f => (
                        <td key={f.key} className={`py-3 px-4 ${f.required && !row[f.key] ? 'border border-rose-300 dark:border-rose-500/50 rounded-md bg-rose-100/50 dark:bg-rose-500/20' : ''}`}>
                          {row[f.key] || '-'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {getMappedData().length > 100 && (
              <div className="p-4 text-center text-sm text-slate-500 border-t border-slate-100 dark:border-slate-700">
                Sadece ilk 100 kayıt ön izleniyor. Toplam {getMappedData().length} kayıt aktarılacak.
              </div>
            )}
          </div>

          <div className="flex justify-between pt-6">
            <button 
              onClick={() => setStep(2)}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <ArrowLeft size={18} /> Geri Dön
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-70"
            >
              {isProcessing ? 'Aktarılıyor...' : `Tüm Kayıtları Aktar (${getMappedData().length})`}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
