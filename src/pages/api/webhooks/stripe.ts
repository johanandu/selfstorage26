import type { APIRoute } from 'astro';
import { stripe, constructWebhookEvent } from '../../../lib/stripe';
import { createServiceClient } from '../../../lib/supabase';
import { createInvoice } from '../../../lib/fakturownia';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Brak podpisu Stripe', { status: 400 });
  }

  let event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (err: any) {
    console.error('Błąd weryfikacji webhooka:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object);
      break;
    default:
      console.log(`Nieobsługiwany typ eventu: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

async function handleCheckoutSessionCompleted(session: any) {
  const supabase = createServiceClient();
  
  try {
    const unitId = session.metadata?.unit_id;
    const customerEmail = session.customer_email || session.customer_details?.email;
    const customerId = session.customer;

    if (!unitId || !customerEmail) {
      throw new Error('Brak wymaganych danych w sesji');
    }

    // Pobierz użytkownika na podstawie emaila
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', customerEmail)
      .single();

    if (userError || !user) {
      throw new Error('Nie znaleziono użytkownika');
    }

    // Aktualizuj status jednostki
    const { error: unitError } = await supabase
      .from('units')
      .update({ status: 'occupied' })
      .eq('id', unitId);

    if (unitError) {
      throw new Error('Błąd aktualizacji jednostki');
    }

    // Stwórz subskrypcję
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        unit_id: unitId,
        status: 'active',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dni
        stripe_customer_id: customerId,
        stripe_subscription_id: session.subscription,
      });

    if (subError) {
      throw new Error('Błąd tworzenia subskrypcji');
    }

    // Pobierz dane jednostki
    const { data: unit, error: unitFetchError } = await supabase
      .from('units')
      .select('*')
      .eq('id', unitId)
      .single();

    if (unitFetchError || !unit) {
      throw new Error('Nie znaleziono jednostki');
    }

    // Wygeneruj fakturę VAT
    try {
      const invoice = await createInvoice({
        buyer_name: user.full_name || customerEmail,
        buyer_email: customerEmail,
        buyer_tax_no: user.nip,
        buyer_address: user.address,
        positions: [
          {
            name: `Wynajem magazynu ${unit.name} (${unit.size})`,
            tax: 23,
            total_price_gross: unit.price_gross / 100,
            quantity: 1,
          },
        ],
        send_invoice_automatically: true,
      });

      console.log('Faktura utworzona:', invoice.id);
    } catch (invoiceError) {
      console.error('Błąd podczas tworzenia faktury:', invoiceError);
      // Nie przerywamy flow - faktura może zostać wygenerowana później
    }

    console.log('Checkout session zakończony pomyślnie');
  } catch (error) {
    console.error('Błąd podczas obsługi checkout.session.completed:', error);
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const supabase = createServiceClient();
  
  try {
    const subscriptionId = invoice.subscription;
    
    if (!subscriptionId) return;

    // Znajdź subskrypcję i przedłuż ważność
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('Błąd aktualizacji subskrypcji:', error);
    }
  } catch (error) {
    console.error('Błąd podczas obsługi invoice.payment_succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  const supabase = createServiceClient();
  
  try {
    const subscriptionId = invoice.subscription;
    
    if (!subscriptionId) return;

    // Oznacz subskrypcję jako nieopłaconą
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'unpaid',
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('Błąd aktualizacji subskrypcji:', error);
    }
  } catch (error) {
    console.error('Błąd podczas obsługi invoice.payment_failed:', error);
  }
}