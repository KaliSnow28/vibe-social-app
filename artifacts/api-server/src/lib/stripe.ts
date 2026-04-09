import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2025-01-27.acacia" })
  : null;

export const STRIPE_CONFIGURED = !!stripeSecretKey;

export async function createPaymentIntent(amount: number, currency = "usd", metadata: Record<string, string> = {}) {
  if (!stripe) throw new Error("Stripe not configured");
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}

export async function createStripeCustomer(email: string, name: string) {
  if (!stripe) throw new Error("Stripe not configured");
  return stripe.customers.create({ email, name });
}

export async function createStripeSubscription(customerId: string, priceId: string) {
  if (!stripe) throw new Error("Stripe not configured");
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });
}

export async function createStripePrice(productId: string, amount: number, interval: "month" | "year" = "month") {
  if (!stripe) throw new Error("Stripe not configured");
  return stripe.prices.create({
    product: productId,
    unit_amount: Math.round(amount * 100),
    currency: "usd",
    recurring: { interval },
  });
}

export async function createStripeProduct(name: string, description: string) {
  if (!stripe) throw new Error("Stripe not configured");
  return stripe.products.create({ name, description });
}

export async function constructWebhookEvent(payload: Buffer, signature: string) {
  if (!stripe) throw new Error("Stripe not configured");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
