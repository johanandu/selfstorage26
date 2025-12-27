import type { APIRoute } from 'astro';
import Stripe from 'stripe';
// Importujemy Supabase (ścieżka sprawdzona przy poprzednim błędzie)
import { supabase } from '/src/lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  // 1. Konfiguracja zmiennych
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    console.error('Brak kluczy Stripe w zmiennych środowiskowych');
    return new Response('Server Config Error', { status: 500 });
  }

  // 2. Inicjalizacja Stripe LOKALNIE (omijamy src/lib/stripe.ts)
  const stripe = new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
  });
  
  // 3. Weryfikacja podpisu (Signature)
  const signature = request.headers.get('stripe-signature');
  if (!signature) return new Response('No Signature', { status: 400 });

  const bodyText = await request.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 4. Obsługa zdarzenia: Płatność udana
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Dane z metadata (ustawione w create-checkout.ts)
    const { userId, unitId, duration_value, duration_unit } = session.metadata || {};

    if (userId && unitId) {
      console.log(`Przetwarzanie płatności dla User: ${userId}, Unit: ${unitId}`);

      // Oblicz datę ważności
      const validUntil = new Date();
      const duration = parseInt(duration_value || '1');

      if (duration_unit === 'day') {
        validUntil.setDate(validUntil.getDate() + duration);
      } else {
        // Domyślnie miesiące
        validUntil.setMonth(validUntil.getMonth() + duration);
      }

      // A. Zmień status unitu na zajęty
      await supabase
        .from('units')
        .update({ status: 'occupied' })
        .eq('id', unitId);

      // B. Dodaj subskrypcję
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          unit_id: parseInt(unitId),
          status: 'active',
          valid_until: validUntil.toISOString(),
          stripe_session_id: session.id,
          // Jeśli masz kolumnę created_at, Supabase doda ją sam, ale można wymusić:
          // created_at: new Date().toISOString() 
        });

      if (subError) {
        console.error('Supabase Insert Error:', subError);
        return new Response('Database Error', { status: 500 });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};