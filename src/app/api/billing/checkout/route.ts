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
      include: { users: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
    const returnUrl = `http://${subdomain}.${rootDomain}/settings/billing`;

    // The Stripe Price ID should ideally come from env variables or a config
    // We'll use a placeholder or read from body for a realistic scenario
    const body = await req.json();
    const priceId = body.priceId || process.env.STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Determine or create Stripe Customer
    let stripeCustomerId = tenant.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: tenant.users[0]?.email || sessionData.email,
        name: tenant.name,
        metadata: {
          tenantId: tenant.id,
          subdomain: tenant.subdomain,
        },
      });
      stripeCustomerId = customer.id;

      await masterDb.tenant.update({
        where: { id: tenant.id },
        data: { stripeCustomerId },
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
        tenantId: tenant.id,
        subdomain: tenant.subdomain,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
