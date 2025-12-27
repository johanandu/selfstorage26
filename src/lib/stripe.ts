import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return new Response('Missing Stripe Config', { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
  
  // 1. Pobierz surową treść żądania (wymagane do weryfikacji podpisu)
  const signature = request.headers.get('stripe-signature');
  if (!signature) return new Response('No Signature', { status: 400 });

  const bodyText = await request.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 2. Obsługa Zdarzenia: Płatność udana
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Pobieramy dane zapisane w create-checkout.ts
    const { userId, unitId, duration_value, duration_unit } = session.metadata || {};

    if (!userId || !unitId) {
      console.error('Missing metadata in Stripe Session');
      return new Response('Missing Metadata', { status: 400 });
    }

    // 3. Oblicz datę ważności (Koniec wynajmu)
    const validUntil = new Date();
    const duration = parseInt(duration_value || '1');

    if (duration_unit === 'day') {
      validUntil.setDate(validUntil.getDate() + duration);
    } else {
      // Domyślnie miesiące
      validUntil.setMonth(validUntil.getMonth() + duration);
    }

    // 4. ZAPIS W BAZIE (SUPABASE)
    
    // A. Zmień status unitu na zajęty
    await supabase
      .from('units')
      .update({ status: 'occupied' })
      .eq('id', unitId);

    // B. Utwórz subskrypcję (Dostęp)
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        unit_id: parseInt(unitId),
        status: 'active',
        valid_until: validUntil.toISOString(),
        stripe_session_id: session.id,
        created_at: new Date().toISOString()
      });

    if (subError) console.error('Supabase Error:', subError);

    // 5. FAKTUROWNIA (Opcjonalnie - wywołanie API)
    // Tutaj możesz dodać logikę wysyłania do Fakturowni, jeśli masz klucz API
    // await createInvoiceInFakturownia(session, userId); 
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};