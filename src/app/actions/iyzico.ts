'use server';

import iyzipay from '@/lib/iyzico';
import { requireAuth } from '@/lib/auth';
import { masterDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createCheckoutSession(subdomain: string, planName: 'STARTER' | 'PRO') {
  const session = await requireAuth();
  
  // Master DB'den Tenant bul
  const tenant = await masterDb.tenant.findUnique({
    where: { subdomain },
  });

  if (!tenant) throw new Error('Tenant not found');

  // Iyzico API Key kontrolü (Sandbox veya Gerçek yoksa simüle et)
  if (!process.env.IYZICO_API_KEY) {
    // API anahtarı yoksa süreci simüle etmek için doğrudan başarılı sayfasına veya kendi mock sayfamıza yönlendir
    return { 
      success: true, 
      paymentPageUrl: `/settings/billing/mock-payment?plan=${planName}` 
    };
  }

  // Gerçek Iyzico Checkout Form Initialize
  return new Promise<{ success: boolean; paymentPageUrl?: string; error?: string }>((resolve) => {
    
    // Not: Gerçek bir abonelik sistemi için Iyzico Abonelik API'si (iyzipay.subscriptionCheckoutFormInitialize) kullanılmalı.
    // Ancak bu örnek genel Checkout Form API üzerinden kurgulanmıştır.
    
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: `conv_${tenant.id}`,
      price: planName === 'PRO' ? '999.0' : '499.0',
      paidPrice: planName === 'PRO' ? '999.0' : '499.0',
      currency: Iyzipay.CURRENCY.TRY,
      basketId: `basket_${planName}`,
      paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/webhooks/iyzico?tenantId=${tenant.id}&plan=${planName}`,
      enabledInstallments: [1],
      buyer: {
        id: session.userId,
        name: session.name || 'Firma Yetkilisi',
        surname: tenant.name,
        gsmNumber: '+905555555555',
        email: session.email,
        identityNumber: '11111111111',
        lastLoginDate: '2023-10-10 15:12:09',
        registrationDate: '2023-10-10 15:12:09',
        registrationAddress: 'Firma Adresi',
        ip: '85.34.78.112',
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34732'
      },
      shippingAddress: {
        contactName: session.name || 'Firma Yetkilisi',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Firma Adresi',
        zipCode: '34732'
      },
      billingAddress: {
        contactName: session.name || 'Firma Yetkilisi',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Firma Adresi',
        zipCode: '34732'
      },
      basketItems: [
        {
          id: planName,
          name: `${planName} Paketi`,
          category1: 'SaaS',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: planName === 'PRO' ? '999.0' : '499.0'
        }
      ]
    };

    iyzipay.checkoutFormInitialize.create(request, function (err: any, result: any) {
      if (err || result.status === 'failure') {
        resolve({ success: false, error: err?.message || result?.errorMessage || 'Iyzico API hatası' });
      } else {
        resolve({ success: true, paymentPageUrl: result.paymentPageUrl + '&token=' + result.token });
      }
    });
  });
}

export async function processMockPayment(subdomain: string, planName: string) {
  const session = await requireAuth();
  
  // Ödemeyi Master DB'ye yansıt (Aboneliği Aktifleştir)
  await masterDb.tenant.update({
    where: { subdomain },
    data: {
      planName: planName,
      subscriptionStatus: 'ACTIVE',
      trialEndsAt: null, // Deneme bitti, gerçek abonelik
      currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)) // 1 Ay eklendi
    }
  });

  revalidatePath(`/tenant/${subdomain}/settings/billing`);
  revalidatePath(`/tenant/${subdomain}/dashboard`);
  
  return { success: true };
}
