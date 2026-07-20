import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { masterDb } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');
    
    if (!authSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const sessionData = JSON.parse(Buffer.from(authSession.value, 'base64').toString());
    const subdomain = sessionData.subdomain;

    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain not found in session' }, { status: 400 });
    }

    const tenant = await masterDb.tenant.findUnique({
      where: { subdomain },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    if (!tenant.stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe Customer ID found. Please subscribe first.' }, { status: 400 });
    }

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
    const returnUrl = `http://${subdomain}.${rootDomain}/settings/billing`;

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Portal Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
