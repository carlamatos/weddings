import Stripe from 'stripe';

// Created on first use, not when this file is imported: the server actions
// import it, so without STRIPE_SECRET_KEY (local development) every page
// would fail to load instead of only payments failing (as with mail.ts).
let client: Stripe | null = null;
function stripeClient(): Stripe {
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-06-24.dahlia',
  });
  return client;
}

export const stripe = new Proxy({} as Stripe, {
  get: (_target, prop) => Reflect.get(stripeClient(), prop),
});
