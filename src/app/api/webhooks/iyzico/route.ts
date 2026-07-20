import { NextResponse } from 'next/server';
import iyzipay from '@/lib/iyzico';
import { masterDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    // Iyzico sends token via form-urlencoded POST
    const formData = await req.formData();
    const token = formData.get('token') as string;
    
    // Yönlendirmeden gelen URL parametrelerini al (örneğin tenantId)
    const url = new URL(req.url);
    const tenantId = url.searchParams.get('tenantId');
    const planName = url.searchParams.get('plan') || 'PRO';

    if (!token || !tenantId) {
      return NextResponse.redirect(new URL('/settings/billing?error=invalid_callback', req.url));
    }

    // Gerçek bir sistemde iyzipay.checkoutForm.retrieve kullanılır
    const request = {
      locale: 'tr',
      conversationId: `conv_${tenantId}`,
      token: token
    };

    return new Promise<Response>((resolve) => {
      iyzipay.checkoutForm.retrieve(request, async function (err: any, result: any) {
        if (err || result.status === 'failure' || result.paymentStatus !== 'SUCCESS') {
          console.error("Iyzico Payment Failed", err || result.errorMessage);
          const tenant = await masterDb.tenant.findUnique({ where: { id: tenantId } });
          const redirectDomain = tenant ? `${tenant.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}` : process.env.NEXT_PUBLIC_ROOT_DOMAIN;
          resolve(NextResponse.redirect(`http://${redirectDomain}/settings/billing?error=payment_failed`));
          return;
        }

        // Ödeme başarılı!
        const tenant = await masterDb.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) {
          resolve(NextResponse.redirect(new URL('/login?error=tenant_not_found', req.url)));
          return;
        }

        // Aboneliği aktif et
        await masterDb.tenant.update({
          where: { id: tenantId },
          data: {
            subscriptionStatus: 'ACTIVE',
            planName: planName,
            trialEndsAt: null,
            currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)), // 1 ay ekle
            stripeSubscriptionId: result.paymentId // Iyzico işlem numarasını log için saklayabiliriz
          }
        });

        const redirectDomain = `${tenant.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`;
        resolve(NextResponse.redirect(`http://${redirectDomain}/settings/billing?success=payment_completed`));
      });
    });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', req.url));
  }
}
