'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, Crown, Shield } from 'lucide-react';
import { createCheckoutSession } from '@/app/actions/iyzico';
import { useRouter } from 'next/navigation';

export default function BillingPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Normalde veritabanından gelecek abonelik durumu
  // Şimdilik demo verisi kullanıyoruz, ancak Server Action eklendiğinde gerçek veri çekilecek.
  const [subscription, setSubscription] = useState({
    status: 'TRIALING',
    planName: 'FREE',
    trialEndsAt: null as Date | null,
    currentPeriodEnd: null as Date | null
  });

  useEffect(() => {
    import('@/app/actions/billing').then(({ getBillingInfo }) => {
      getBillingInfo(subdomain).then(data => {
        if (data) {
          setSubscription({
            status: data.subscriptionStatus,
            planName: data.planName,
            trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null,
            currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null
          });
        }
      });
    });
  }, [subdomain]);

  const handleUpgrade = async (planName: 'STARTER' | 'PRO') => {
    setLoading(true);
    setError('');
    try {
      const res = await createCheckoutSession(subdomain, planName);
      if (res.success && res.paymentPageUrl) {
        window.location.href = res.paymentPageUrl; // Iyzico veya Mock sayfasına yönlendir
      } else {
        setError(res.error || 'Ödeme sistemi başlatılamadı.');
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysLeft = (date: Date | null) => {
    if (!date) return 0;
    const diffTime = Math.abs(date.getTime() - new Date().getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Abonelik ve Ödeme</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Fatura bilgilerinizi, abonelik paketlerinizi ve ödeme geçmişinizi yönetin.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {/* Mevcut Durum */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Mevcut Plan: {subscription.planName}</h2>
              {subscription.status === 'TRIALING' && (
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800">
                  Deneme Sürümü
                </span>
              )}
              {subscription.status === 'ACTIVE' && (
                <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">
                  Aktif
                </span>
              )}
              {subscription.status === 'PAST_DUE' && (
                <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium border border-red-200 dark:border-red-800">
                  Ödeme Bekliyor
                </span>
              )}
            </div>
            
            {subscription.status === 'TRIALING' ? (
              <p className="text-slate-600 dark:text-slate-400">
                Deneme sürenizin bitmesine <strong className="text-slate-800 dark:text-white">{calculateDaysLeft(subscription.trialEndsAt)} gün</strong> kaldı. Kesintisiz kullanım için paketinizi yükseltin.
              </p>
            ) : subscription.status === 'ACTIVE' ? (
              <p className="text-slate-600 dark:text-slate-400">
                Aboneliğiniz {subscription.currentPeriodEnd?.toLocaleDateString()} tarihinde yenilenecektir.
              </p>
            ) : (
              <p className="text-red-600 dark:text-red-400 font-medium">
                Sistemi kullanmaya devam etmek için ödemenizi güncellemeniz gerekmektedir.
              </p>
            )}
          </div>
          
          <div className="hidden sm:block">
            <CreditCard size={48} className="text-slate-200 dark:text-slate-800" />
          </div>
        </div>
      </div>

      {/* Paketler (Sadece Trialing veya Free ise veya Yükseltme isteniyorsa göster) */}
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-12 mb-6 text-center">İhtiyacınıza Uygun Paketi Seçin</h3>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Starter Plan */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Başlangıç Paketi</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 h-10">Küçük ölçekli işletmeler için temel envanter yönetimi.</p>
          
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₺499</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">/ay</span>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" /> Maksimum 100 Cihaz Kaydı
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" /> Sınırsız Kullanıcı Ekleme
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" /> Temel Zimmet Takibi
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" /> E-posta Destek
            </li>
          </ul>

          <button
            onClick={() => handleUpgrade('STARTER')}
            disabled={loading || subscription.planName === 'STARTER'}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              subscription.planName === 'STARTER' 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:bg-slate-800 dark:text-indigo-400 dark:hover:bg-slate-800/80'
            }`}
          >
            {subscription.planName === 'STARTER' ? 'Mevcut Paketiniz' : 'Seç ve İlerle'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-indigo-600 rounded-2xl p-8 shadow-lg relative overflow-hidden transform md:-translate-y-4">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            EN ÇOK TERCİH EDİLEN
          </div>
          <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Crown size={20} className="text-yellow-300" /> Profesyonel Paket
          </h4>
          <p className="text-indigo-200 text-sm mb-6 h-10">Gelişmiş güvenlik ve sınırsız varlık yönetimine ihtiyaç duyanlar için.</p>
          
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-white">₺999</span>
            <span className="text-indigo-200 font-medium">/ay</span>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-2 text-sm text-indigo-100">
              <CheckCircle2 size={18} className="text-yellow-300 shrink-0" /> <b>Sınırsız</b> Cihaz Kaydı
            </li>
            <li className="flex items-start gap-2 text-sm text-indigo-100">
              <CheckCircle2 size={18} className="text-yellow-300 shrink-0" /> İki Aşamalı Doğrulama (2FA)
            </li>
            <li className="flex items-start gap-2 text-sm text-indigo-100">
              <CheckCircle2 size={18} className="text-yellow-300 shrink-0" /> Active Directory / SSO
            </li>
            <li className="flex items-start gap-2 text-sm text-indigo-100">
              <CheckCircle2 size={18} className="text-yellow-300 shrink-0" /> Finansal Raporlar & Amortisman
            </li>
            <li className="flex items-start gap-2 text-sm text-indigo-100">
              <CheckCircle2 size={18} className="text-yellow-300 shrink-0" /> 7/24 Öncelikli Telefon Desteği
            </li>
          </ul>

          <button
            onClick={() => handleUpgrade('PRO')}
            disabled={loading || subscription.planName === 'PRO'}
            className={`w-full py-3 rounded-lg font-bold transition-all shadow-md ${
              subscription.planName === 'PRO' 
                ? 'bg-indigo-800 text-indigo-300 cursor-not-allowed shadow-none'
                : 'bg-white text-indigo-600 hover:bg-slate-50'
            }`}
          >
            {subscription.planName === 'PRO' ? 'Mevcut Paketiniz' : 'Profesyonel Başla'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-8 text-sm text-slate-500 dark:text-slate-400">
        <Shield size={16} /> Tüm ödemeleriniz Iyzico güvencesiyle 256-bit SSL ile korunmaktadır.
      </div>
    </div>
  );
}
