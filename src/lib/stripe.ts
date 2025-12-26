import Stripe from 'stripe';

const secretKey = import.meta.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error('Brak STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2024-06-20',
});

export const createCheckoutSession = async ({
  unit,
  customerEmail,
  customerId,
  successUrl,
  cancelUrl,
}: {
  unit: any;
  customerEmail?: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
}) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'p24'],
    line_items: [
      {
        price_data: {
          currency: 'pln',
          product_data: {
            name: `Wynajem magazynu ${unit.name}`,
            description: `Powierzchnia: ${unit.size}`,
            images: unit.image_url ? [unit.image_url] : [],
          },
          unit_amount: unit.price_gross,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    customer_email: customerEmail,
    customer: customerId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      unit_id: unit.id.toString(),
      unit_name: unit.name,
    },
    subscription_data: {
      metadata: {
        unit_id: unit.id.toString(),
        unit_name: unit.name,
      },
    },
    locale: 'pl',
  });

  return session;
};

export const constructWebhookEvent = (body: any, signature: string) => {
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('Brak STRIPE_WEBHOOK_SECRET');
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
};