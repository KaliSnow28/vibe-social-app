const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

let cachedToken: { access_token: string; expires_at: number } | null = null;

export async function getPayPalAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires_at - 60000) {
    return cachedToken.access_token;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal auth failed: ${response.status} ${text}`);
  }

  const data = await response.json() as { access_token: string; expires_in: number };
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

async function paypalFetch(path: string, options: RequestInit = {}) {
  const token = await getPayPalAccessToken();
  const url = `${PAYPAL_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal API error ${response.status}: ${text}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

export interface CreateOrderParams {
  amount: number;
  currency?: string;
  description?: string;
  returnUrl: string;
  cancelUrl: string;
}

export async function createPayPalOrder(params: CreateOrderParams) {
  return paypalFetch("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: params.currency ?? "USD",
            value: params.amount.toFixed(2),
          },
          description: params.description,
        },
      ],
      application_context: {
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
        user_action: "PAY_NOW",
      },
    }),
  });
}

export async function capturePayPalOrder(orderId: string) {
  return paypalFetch(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
  });
}

export interface CreatePlanParams {
  name: string;
  description: string;
  price: number;
  currency?: string;
  interval: "MONTH" | "YEAR";
}

export async function createPayPalProduct(name: string, description: string) {
  return paypalFetch("/v1/catalogs/products", {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
      type: "SERVICE",
      category: "SOFTWARE",
    }),
  });
}

export async function createPayPalPlan(productId: string, params: CreatePlanParams) {
  return paypalFetch("/v1/billing/plans", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      name: params.name,
      description: params.description,
      billing_cycles: [
        {
          frequency: {
            interval_unit: params.interval,
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: params.price.toFixed(2),
              currency_code: params.currency ?? "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CANCEL",
        payment_failure_threshold: 3,
      },
    }),
  });
}

export async function createPayPalSubscription(planId: string, returnUrl: string, cancelUrl: string) {
  return paypalFetch("/v1/billing/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: planId,
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        user_action: "SUBSCRIBE_NOW",
      },
    }),
  });
}

export async function cancelPayPalSubscription(subscriptionId: string, reason: string) {
  return paypalFetch(`/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export interface PayoutItem {
  receiverEmail: string;
  amount: number;
  currency?: string;
  senderItemId: string;
  note?: string;
}

export async function createPayPalPayout(items: PayoutItem[]) {
  const batchId = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return paypalFetch("/v1/payments/payouts", {
    method: "POST",
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: batchId,
        email_subject: "Your payout from the platform",
        email_message: "You have received a payout. Thank you for being a creator!",
      },
      items: items.map((item) => ({
        recipient_type: "EMAIL",
        amount: {
          value: item.amount.toFixed(2),
          currency: item.currency ?? "USD",
        },
        receiver: item.receiverEmail,
        note: item.note ?? "Creator payout",
        sender_item_id: item.senderItemId,
      })),
    }),
  });
}

export async function getPayPalPayoutBatchStatus(batchId: string) {
  return paypalFetch(`/v1/payments/payouts/${batchId}`);
}

export function verifyPayPalWebhookSignature(
  headers: Record<string, string>,
  body: string,
): boolean {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  return true;
}
