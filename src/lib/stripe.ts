import type { APIRoute } from 'astro';
import Stripe from 'stripe';
// Ścieżka: Wychodzimy z 'create-checkout.ts' -> 'api' -> 'pages' -> 'src' -> 'lib'
import { supabase } from '../../lib/supabase'; 

export const POST: APIRoute = async ({ request, cookies }) => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: 'Server Config Error: Brak klucza Stripe' }), { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

  try {
    const { unitId, durationValue, durationUnit, invoiceData } = await request.json();
    
    // Walidacja danych wejściowych
    const value = parseInt(durationValue) || 1;
    const unitType = durationUnit === 'day' ? 'day' : 'month';

    // Autoryzacja
    const accessToken = cookies.get('sb-access-token')?.value;
    if (!accessToken) return new Response(JSON.stringify({ error: 'Zaloguj się' }), { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) return new Response(JSON.stringify({ error: 'Błąd sesji' }), { status: 401 });

    // Update Profilu
    if (invoiceData) {
      await supabase.from('profiles').update({
        full_name: invoiceData.fullName,
        nip: invoiceData.nip,
        address: invoiceData.address,
        phone_number: invoiceData.phone
      }).eq('id', user.id);
    }

    // Pobranie Unitu
    const { data: unit } = await supabase.from('units').select('*').eq('id', unitId).single();
    if (!unit) return new Response(JSON.stringify({ error: 'Magazyn nie istnieje' }), { status: 404 });

    // Kalkulacja Ceny
    let amount = 0;
    let description = '';

    if (unitType === 'day') {
      const pricePerDay = Math.ceil(unit.price_gross / 20); // Narzut na krótki termin
      amount = pricePerDay * value;
      description = `Wynajem na ${value} dni`;
    } else {
      let baseTotal = unit.price_gross * value;
      if (value === 6) baseTotal *= 0.95; // Rabat 5%
      if (value === 12) baseTotal *= 0.90; // Rabat 10%
      amount = Math.round(baseTotal);
      description = `Wynajem na ${value} mies.`;
    }

    // Stripe Session
    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik', 'p24'],
      line_items: [{
        price_data: {
          currency: 'pln',
          product_data: {
            name: `Magazyn: ${unit.name}`,
            description: description,
            images: unit.image_url ? [unit.image_url] : [],
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment', // Payment = Jednorazowa wpłata (obsługuje BLIK)
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/checkout?unitId=${unitId}`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        unitId: unit.id.toString(),
        duration_value: value.toString(),
        duration_unit: unitType,
        type: 'rental_prepaid'
      },
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};