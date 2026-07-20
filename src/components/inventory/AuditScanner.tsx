'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScanLine, Play, CheckCircle2, AlertCircle, XCircle, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { startAudit, completeAudit, cancelAudit, getLocationAssets, getAllAssetCodes } from '@/app/actions/inventory';

interface Location {
  id: string;
  name: string;
}

interface ExpectedAsset {
  id: string;
  demiRbasNo: string;
  brandModel: string;
  category: { name: string };
  scanned: boolean;
  status?: 'FOUND' | 'MISSING' | 'WRONG_LOCATION' | 'UNKNOWN';
}

export function AuditScanner({ 
  subdomain, 
  locations,
  existingAudit 
}: { 
  subdomain: string, 
  locations: Location[],
  existingAudit?: { id: string, locationId: string } 
}) {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState(existingAudit ? existingAudit.locationId : '');
  const [isAuditing, setIsAuditing] = useState(!!existingAudit);
  const [isFinishing, setIsFinishing] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(existingAudit ? existingAudit.id : null);
  const [isLoaded, setIsLoaded] = useState(!existingAudit); // Eğer existingAudit varsa false başlar
  
  const [expectedAssets, setExpectedAssets] = useState<ExpectedAsset[]>([]);
  const [allAssetsDict, setAllAssetsDict] = useState<Record<string, string>>({}); // { demiRbasNo: id }
  
  const [scannedItems, setScannedItems] = useState<{
    code: string;
    assetId?: string;
    status: 'FOUND' | 'MISSING' | 'WRONG_LOCATION' | 'UNKNOWN';
    timestamp: Date;
    label?: string; // Gösterim için (Marka model vs)
  }[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const [scanInput, setScanInput] = useState('');

  // Keep focus on input while auditing
  useEffect(() => {
    if (isAuditing && isLoaded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAuditing, isLoaded]);

  // Sayfadan ayrılıp geri dönüldüğünde durumu (localStorage'dan) yüklemek veya ilk yükleme işlemleri
  useEffect(() => {
    if (existingAudit && !isLoaded) {
      resumeAuditData(existingAudit.id, existingAudit.locationId);
    }
  }, [existingAudit, isLoaded]);

  // Değişiklikleri localStorage'a kaydet (veri kaybını önlemek için)
  useEffect(() => {
    if (auditId && isAuditing && isLoaded) {
      const stateToSave = {
        expectedAssets,
        scannedItems: scannedItems.map(item => ({ ...item, timestamp: item.timestamp.toISOString() }))
      };
      localStorage.setItem(`audit_state_${auditId}`, JSON.stringify(stateToSave));
    }
  }, [expectedAssets, scannedItems, auditId, isAuditing, isLoaded]);

  const resumeAuditData = async (aId: string, locId: string) => {
    const loadToast = toast.loading('Kayıtlı sayım verileri yükleniyor...');
    try {
      // 1. Beklenen cihazları çek
      const assetsInLocation = await getLocationAssets(subdomain, locId);
      
      // 2. Sistemdeki tüm cihazları çek
      const allAssets = await getAllAssetCodes(subdomain);
      const dict: Record<string, string> = {};
      allAssets.forEach(a => { dict[a.demiRbasNo] = a.id; });
      setAllAssetsDict(dict);

      // 3. LocalStorage'dan önceki durumu oku
      const savedStateStr = localStorage.getItem(`audit_state_${aId}`);
      if (savedStateStr) {
        const savedState = JSON.parse(savedStateStr);
        if (savedState.expectedAssets && savedState.expectedAssets.length > 0) {
          setExpectedAssets(savedState.expectedAssets);
          setScannedItems(savedState.scannedItems.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          })));
        } else {
          // Eğer önceden localStorage'a yanlışlıkla boş dizi kaydedildiyse, DB'den sıfırdan kur
          setExpectedAssets(assetsInLocation.map(a => ({
            id: a.id,
            demiRbasNo: a.demiRbasNo,
            brandModel: a.brandModel,
            category: { name: a.category.name },
            scanned: false
          })));
        }
      } else {
        // İlk kez giriliyorsa veya localstorage temizlendiyse sıfırdan oluştur
        setExpectedAssets(assetsInLocation.map(a => ({
          id: a.id,
          demiRbasNo: a.demiRbasNo,
          brandModel: a.brandModel,
          category: { name: a.category.name },
          scanned: false
        })));
      }
      setIsLoaded(true);
      toast.success('Sayım verileri yüklendi!', { id: loadToast });
    } catch (e) {
      toast.error('Sayım verileri yüklenirken hata!', { id: loadToast });
      setIsLoaded(true); // Hata olsa bile sonsuz beklemesin
    }
  };

  const handleStart = async () => {
    if (!selectedLocation) {
      toast.error('Lütfen bir lokasyon seçin.');
      return;
    }

    const loadToast = toast.loading('Sayım başlatılıyor...');
    try {
      // 1. Audit kaydı oluştur
      const audit = await startAudit(subdomain, selectedLocation);
      setAuditId(audit.id);

      // 2. Beklenen cihazları çek
      const assetsInLocation = await getLocationAssets(subdomain, selectedLocation);
      setExpectedAssets(assetsInLocation.map(a => ({
        id: a.id,
        demiRbasNo: a.demiRbasNo,
        brandModel: a.brandModel,
        category: { name: a.category.name },
        scanned: false
      })));

      // 3. Yanlış lokasyon okumalarını tespit için tüm sistem cihazlarının barkodlarını al
      const allAssets = await getAllAssetCodes(subdomain);
      const dict: Record<string, string> = {};
      allAssets.forEach(a => { dict[a.demiRbasNo] = a.id; });
      setAllAssetsDict(dict);

      setIsAuditing(true);
      setIsLoaded(true);
      toast.success('Sayım başladı! Barkod okutabilirsiniz.', { id: loadToast });
    } catch (error) {
      toast.error('Sayım başlatılamadı.', { id: loadToast });
    }
  };

  const processScan = (code: string) => {
    if (!code.trim()) return;
    
    // Zaten okutulmuş mu?
    if (scannedItems.some(item => item.code === code)) {
      toast.error('Bu cihaz zaten okutuldu!');
      return;
    }

    const expectedIndex = expectedAssets.findIndex(a => a.demiRbasNo === code);
    
    if (expectedIndex >= 0) {
      // 1. Durum: Cihaz bu lokasyonda bekleniyordu ve BULUNDU
      const asset = expectedAssets[expectedIndex];
      const newExpected = [...expectedAssets];
      newExpected[expectedIndex].scanned = true;
      newExpected[expectedIndex].status = 'FOUND';
      setExpectedAssets(newExpected);

      setScannedItems(prev => [{
        code,
        assetId: asset.id,
        status: 'FOUND',
        timestamp: new Date(),
        label: `${asset.demiRbasNo} - ${asset.brandModel}`
      }, ...prev]);

      toast.success('Bulundu!', { icon: '🟢', duration: 1000 });
    } else {
      // 2. Durum: Cihaz bu lokasyonda beklenmiyor
      const globalAssetId = allAssetsDict[code];
      
      if (globalAssetId) {
        // Sistemde var ama başka lokasyonda! (WRONG LOCATION)
        setScannedItems(prev => [{
          code,
          assetId: globalAssetId,
          status: 'WRONG_LOCATION',
          timestamp: new Date(),
          label: `${code} (Yanlış Lokasyonda Bulundu)`
        }, ...prev]);
        toast.error('Cihaz sistemde var ama lokasyonu burası DEĞİL!', { icon: '🟠', duration: 2000 });
      } else {
        // Sistemde hiç yok (UNKNOWN)
        setScannedItems(prev => [{
          code,
          status: 'UNKNOWN',
          timestamp: new Date(),
          label: `${code} (Sistemde Yok)`
        }, ...prev]);
        toast.error('Tanımlanmayan Cihaz Barkodu!', { icon: '🔴', duration: 2000 });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processScan(scanInput);
      setScanInput(''); // Alanı temizle
    }
  };

  const handleFinish = async () => {
    if (!auditId) return;
    
    if (!confirm('Sayımı bitirmek istediğinize emin misiniz? Okutulmayan beklenen cihazlar KAYIP olarak işaretlenecektir!')) {
      return;
    }

    setIsFinishing(true);
    const loadToast = toast.loading('Sayım tamamlanıyor ve envanter güncelleniyor...');

    // Kayıp cihazları belirle
    const missingAssets = expectedAssets.filter(a => !a.scanned);
    const missingItems = missingAssets.map(a => ({
      assetId: a.id,
      scannedCode: a.demiRbasNo,
      status: 'MISSING'
    }));

    const allItemsToSave = [
      ...scannedItems.map(si => ({
        assetId: si.assetId,
        scannedCode: si.code,
        status: si.status
      })),
      ...missingItems
    ];

    try {
      await completeAudit(subdomain, auditId, {
        totalFound: scannedItems.filter(i => i.status === 'FOUND').length,
        totalMissing: missingItems.length,
        totalWrongLoc: scannedItems.filter(i => i.status === 'WRONG_LOCATION').length,
        totalUnknown: scannedItems.filter(i => i.status === 'UNKNOWN').length,
        items: allItemsToSave
      });

      toast.success('Sayım başarıyla tamamlandı!', { id: loadToast });
      localStorage.removeItem(`audit_state_${auditId}`);
      router.push(`/inventory`);
    } catch (error) {
      toast.error('Bir hata oluştu.', { id: loadToast });
      setIsFinishing(false);
    }
  };

  const handleCancel = async () => {
    if (!auditId) return;

    if (!confirm('Sayımı iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz ve okuttuğunuz veriler silinir.')) {
      return;
    }

    setIsFinishing(true);
    const loadToast = toast.loading('Sayım iptal ediliyor...');

    try {
      await cancelAudit(subdomain, auditId);
      localStorage.removeItem(`audit_state_${auditId}`);
      toast.success('Sayım iptal edildi.', { id: loadToast });
      router.push(`/inventory`);
    } catch (error) {
      toast.error('İptal işlemi başarısız oldu.', { id: loadToast });
      setIsFinishing(false);
    }
  };

  if (!isAuditing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[500px]">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6">
          <ScanLine size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Fiziksel Sayım (Audit)</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
          Sayım yapmak istediğiniz lokasyonu seçin. Sayım başladığında o lokasyondaki tüm beklenen cihazlar listelenecek ve okuttuğunuz cihazlar yeşile dönecektir.
        </p>

        <div className="w-full max-w-md space-y-4">
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-300 transition-all font-medium text-lg appearance-none"
            >
              <option value="" disabled>Sayım Yapılacak Lokasyon Seçin</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleStart}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/25 transition-all text-lg"
          >
            <Play size={20} fill="currentColor" />
            Sayımı Başlat
          </button>
        </div>
      </div>
    );
  }

  // AUDIT IN PROGRESS UI
  return (
    <div className="flex flex-col h-full min-h-[600px]">
      
      {/* Üst Bar: Barkod Okutma */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
          <input
            ref={inputRef}
            type="text"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Barkod okutun veya Demirbaş No yazıp Enter'a basın..."
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900/50 rounded-2xl focus:border-indigo-500 dark:focus:border-indigo-500 outline-none text-xl font-medium shadow-sm transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            autoFocus
          />
        </div>
        <div className="flex gap-4">
          <div className="text-center px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{scannedItems.length}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Okutulan</div>
          </div>
          <button
            onClick={handleCancel}
            disabled={isFinishing}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-2xl font-bold transition-all disabled:opacity-50"
          >
            İptal Et
          </button>
          <button
            onClick={handleFinish}
            disabled={isFinishing}
            className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-red-500/25 transition-all disabled:opacity-50"
          >
            {isFinishing ? 'Kaydediliyor...' : 'Sayımı Bitir'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
        {/* Sol Taraf: Beklenen Cihazlar */}
        <div className="border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
              Beklenen Cihazlar
              <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-sm">
                {expectedAssets.filter(a => a.scanned).length} / {expectedAssets.length}
              </span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[500px]">
            {expectedAssets.map(asset => (
              <div 
                key={asset.id} 
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  asset.scanned 
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' 
                    : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className={`font-bold ${asset.scanned ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {asset.demiRbasNo}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{asset.brandModel}</div>
                </div>
                <div>
                  {asset.scanned ? (
                    <CheckCircle2 className="text-emerald-500" size={24} />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-700"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ Taraf: Okutulan Geçmişi */}
        <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50">
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Okutma Geçmişi</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[500px]">
            {scannedItems.length === 0 ? (
              <div className="text-center py-10 text-slate-500">Henüz cihaz okutulmadı...</div>
            ) : (
              scannedItems.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-xl flex items-start gap-3 shadow-sm border ${
                    item.status === 'FOUND' ? 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800' :
                    item.status === 'WRONG_LOCATION' ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30' :
                    'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30'
                  }`}
                >
                  <div className="mt-0.5">
                    {item.status === 'FOUND' && <CheckCircle2 className="text-emerald-500" size={18} />}
                    {item.status === 'WRONG_LOCATION' && <AlertCircle className="text-amber-500" size={18} />}
                    {item.status === 'UNKNOWN' && <XCircle className="text-red-500" size={18} />}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.code}</div>
                    <div className={`text-xs ${
                      item.status === 'FOUND' ? 'text-slate-500 dark:text-slate-400' :
                      item.status === 'WRONG_LOCATION' ? 'text-amber-700 dark:text-amber-400 font-medium' :
                      'text-red-700 dark:text-red-400 font-medium'
                    }`}>
                      {item.label}
                    </div>
                  </div>
                  <div className="text-[10px] font-medium text-slate-400">
                    {item.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
