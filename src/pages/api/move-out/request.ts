import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { stripe } from '../../../lib/stripe';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Pobierz token z ciasteczek
    const token = request.headers.get('cookie')?.match(/sb-access-token=([^;]+)/)?.[1];
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Brak autoryzacji' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Ustaw token dla Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Nieprawidłowa autoryzacja' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Pobierz dane z body
    const { unitId, subscriptionId, proofImageUrl } = await request.json();

    // Walidacja
    if (!unitId || !subscriptionId || !proofImageUrl) {
      return new Response(JSON.stringify({ error: 'Brak wymaganych danych' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Sprawdź czy użytkownik jest właścicielem
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('unit_id', unitId)
      .eq('stripe_subscription_id', subscriptionId)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return new Response(JSON.stringify({ error: 'Nie jesteś właścicielem tego magazynu' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Zaktualizuj subskrypcję w Stripe
    try {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (stripeError) {
      console.error('Błąd Stripe:', stripeError);
      return new Response(JSON.stringify({ error: 'Błąd podczas anulowania subskrypcji' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Zapisz żądanie move-out
    const { data: moveOutRequest, error: requestError } = await supabase
      .from('move_out_requests')
      .insert({
        user_id: user.id,
        unit_id: unitId,
        proof_image_url: proofImageUrl,
        stripe_subscription_id: subscriptionId,
        cancel_at_period_end: true,
      })
      .select()
      .single();

    if (requestError) {
      throw requestError;
    }

    // Zaktualizuj subskrypcję w bazie
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Błąd aktualizacji subskrypcji:', updateError);
    }

    // TODO: Wysłanie emaila z potwierdzeniem

    return new Response(JSON.stringify({ success: true, requestId: moveOutRequest.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Błąd API move-out/request:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Błąd serwera' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};