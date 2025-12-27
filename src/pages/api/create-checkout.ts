import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return new Response(JSON.stringify({ error: 'Server Config Error' }), { status: 500 });

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

  try {
    const { unitId, duration, invoiceData } = await request.json();
    const months = duration || 1;

    // 1. Walidacja usera
    const accessToken = cookies.get('sb-access-token')?.value;
    if (!accessToken) return new Response(JSON.stringify({ error: 'Zaloguj się' }), { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) return new Response(JSON.stringify({ error: 'Błąd sesji' }), { status: 401 });

    // 2. Aktualizacja danych do faktury w profilu (żeby były gotowe dla webhooka Fakturowni)
    await supabase.from('profiles').update({
      full_name: invoiceData.fullName,
      nip: invoiceData.nip,
      address: invoiceData.address,
      phone_number: invoiceData.phone
    }).eq('id', user.id);

    // 3. Pobranie magazynu
    const { data: unit } = await supabase.from('units').select('*').eq('id', unitId).single();
    if (!unit) return new Response(JSON.stringify({ error: 'Magazyn nie istnieje' }), { status: 404 });

    // 4. Kalkulacja Ceny i Rabatu (Backend - bezpiecznie)
    let finalAmount = unit.price_gross * months;
    let description = `Wynajem na ${months} mies.`;

    if (months === 6) {
      finalAmount = Math.round(finalAmount * 0.95);
      description += ' (Rabat -5%)';
    } else if (months === 12) {
      finalAmount = Math.round(finalAmount * 0.90);
      description += ' (Rabat -10%)';
    }

    // 5. Stripe Session (Tryb PAYMENT - działa z BLIK)
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
          unit_amount: finalAmount, // Cena całkowita za cały okres
        },
        quantity: 1,
      }],
      mode: 'payment', // KLUCZOWE: Payment = BLIK działa. Subscription = BLIK nie działa.
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/checkout?unitId=${unitId}`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        unitId: unit.id.toString(),
        duration_months: months.toString(), // Webhook musi wiedzieć, na ile przedłużyć
        type: 'rental_prepaid'
      },
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};