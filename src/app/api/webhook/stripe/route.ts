import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase/client';
import { createMetrica } from '@/lib/supabase/mutations';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  if (event.type === 'checkout.session.completed') {
    const leadId = session.metadata?.lead_id;
    const amountTotal = session.amount_total / 100; // Value in BRL/USD

    if (leadId) {
      // 1. Update Lead status and value
      const { error: leadError } = await supabase
        .from('leads')
        .update({
          payment_status: 'pago',
          payment_value: amountTotal,
        })
        .eq('id', leadId);

      if (leadError) {
        console.error('Error updating lead payment:', leadError);
      }

      // 2. Update Daily Metrics (Optional but recommended for the Financeiro page)
      const today = new Date().toISOString().split('T')[0];
      
      // Check if we already have a metric for today to update it
      // Actually, createMetrica just inserts. In a real scenario, we might want to upsert or add to existing.
      // For now, let's just create a record or let the user manage aggregate stats.
      // The user requested "status no cliente".
      
      console.log(`Payment confirmed for lead ${leadId}: ${amountTotal}`);
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const leadId = session.metadata?.lead_id;
    if (leadId) {
      await supabase
        .from('leads')
        .update({ payment_status: 'falhou' })
        .eq('id', leadId);
    }
  }

  return new NextResponse(null, { status: 200 });
}
