import type { APIRoute } from 'astro';
import Stripe from 'stripe'; // ZMIANA: Importujemy bibliotekę, a nie plik z lib
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  // 1. Inicjalizacja Stripe (Bezpośrednio tutaj, tak jak w innych plikach)
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: 'Server Config Error' }), { status: 500 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
  });

  try {
    // 2. Sprawdzenie Autoryzacji
    const accessToken = cookies.get('sb-access-token')?.value;
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Musisz być zalogowany' }), { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Błąd sesji' }), { status: 401 });
    }

    // 3. Pobranie danych z żądania
    const { unitId } = await request.json();

    if (!unitId) {
      return new Response(JSON.stringify({ error: 'Brak ID magazynu' }), { status: 400 });
    }

    // 4. Znajdź aktywną subskrypcję dla tego unitu i usera
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('unit_id', unitId)
      .eq('status', 'active')
      .single();

    if (subError || !sub || !sub.stripe_subscription_id) {
      return new Response(JSON.stringify({ error: 'Nie znaleziono aktywnej subskrypcji' }), { status: 404 });
    }

    // 5. Anulowanie w Stripe (z końcem okresu - nie natychmiast!)
    // Dzięki temu klient ma dostęp do końca opłaconego miesiąca
    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // 6. Logujemy zdarzenie w bazie (opcjonalnie można zmienić status na 'pending_cancellation')
    // Na razie zostawiamy 'active', bo dostęp ma działać do końca okresu.
    // Webhook ze Stripe'a zmieni status na 'canceled' gdy okres faktycznie minie.

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Wypowiedzenie przyjęte. Dostęp wygaśnie z końcem okresu rozliczeniowego.' 
    }), { status: 200 });

  } catch (error) {
    console.error('Move-out Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Wystąpił błąd' }), { status: 500 });
  }
};