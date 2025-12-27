import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return new Response(JSON.stringify({ error: 'Server Config Error' }), { status: 500 });

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

  try {
    // 1. Odbierz nowe parametry: durationValue i durationUnit
    const { unitId, durationValue, durationUnit, invoiceData } = await request.json();
    
    // Walidacja
    const value = parseInt(durationValue) || 1;
    const unitType = durationUnit === 'day' ? 'day' : 'month';

    // 2. Auth
    const accessToken = cookies.get('sb-access-token')?.value;
    if (!accessToken) return new Response(JSON.stringify({ error: 'Zaloguj się' }), { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) return new Response(JSON.stringify({ error: 'Błąd sesji' }), { status: 401 });

    // 3. Update Profilu
    await supabase.from('profiles').update({
      full_name: invoiceData.fullName,
      nip: invoiceData.nip,
      address: invoiceData.address,
      phone_number: invoiceData.phone
    }).eq('id', user.id);

    // 4. Pobierz Unit
    const { data: unit } = await supabase.from('units').select('*').eq('id', unitId).single();
    if (!unit) return new Response(JSON.stringify({ error: 'Magazyn nie istnieje' }), { status: 404 });

    // 5. KALKULACJA CENY (SERWEROWA)
    let finalAmount = 0;
    let description = '';

    if (unitType === 'day') {
      // Logika: Cena dzienna = CenaMiesięczna / 20 (narzut)
      const pricePerDay = Math.ceil(unit.price_gross / 20);
      finalAmount = pricePerDay * value;
      description = `Wynajem na ${value} dni`;
    } else {
      // Logika miesięczna z rabatami
      let baseTotal = unit.price_gross * value;
      if (value === 6) baseTotal *= 0.95;
      if (value === 12) baseTotal *= 0.90;
      finalAmount = Math.round(baseTotal);
      description = `Wynajem na ${value} mies.`;
    }

    // 6. Stripe Session
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
          unit_amount: finalAmount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/checkout?unitId=${unitId}`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        unitId: unit.id.toString(),
        // Przekazujemy do webhooka info, czy dodać DNI czy MIESIĄCE
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