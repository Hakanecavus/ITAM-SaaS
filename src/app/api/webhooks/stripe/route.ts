import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { masterDb } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.subscription && session.metadata?.tenantId) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          await masterDb.tenant.update({
            where: { id: session.metadata.tenantId },
            data: {
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: session.customer as string,
              planName: 'PRO', // or map dynamically from price ID
              subscriptionStatus: subscription.status.toUpperCase(),
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        await masterDb.tenant.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status.toUpperCase(),
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        await masterDb.tenant.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: 'CANCELED',
            planName: 'FREE',
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
