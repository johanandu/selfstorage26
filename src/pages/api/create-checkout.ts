import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  // 1. Sprawdź klucz Stripe
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: 'Brak konfiguracji Stripe (Server Key)' }), { status: 500 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
  });

  try {
    // 2. Pobierz UnitID z żądania
    const body = await request.json();
    const { unitId } = body;

    if (!unitId) {
      return new Response(JSON.stringify({ error: 'Brak ID magazynu' }), { status: 400 });
    }

    // 3. Sprawdź autoryzację użytkownika
    const accessToken = cookies.get('sb-access-token')?.value;
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Musisz być zalogowany' }), { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Błąd autoryzacji' }), { status: 401 });
    }

    // 4. Pobierz dane magazynu z bazy
    const { data: unit } = await supabase
      .from('units')
      .select('*')
      .eq('id', unitId)
      .single();

    if (!unit) {
      return new Response(JSON.stringify({ error: 'Magazyn nie istnieje' }), { status: 404 });
    }

    // 5. Utwórz sesję Stripe Checkout
    const origin = new URL(request.url).origin;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik', 'p24'],
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: `Wynajem: ${unit.name}`,
              description: `Rozmiar: ${unit.size}. Subskrypcja miesięczna.`,
              images: unit.image_url ? [unit.image_url] : [],
            },
            unit_amount: unit.price_gross, // Cena w groszach
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/checkout?unitId=${unitId}&cancel=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        unitId: unit.id.toString(),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200 });

  } catch (error) {
    console.error('Stripe Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};