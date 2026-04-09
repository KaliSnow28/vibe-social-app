import { Router } from "express";
import { createPaymentIntent, createStripeProduct, createStripePrice, STRIPE_CONFIGURED, stripe } from "../lib/stripe";
import { db } from "@workspace/db";
import { donationsTable, earningsTable, inAppNotificationsTable, subscriptionTiersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

async function addCreatorEarnings(creatorId: string, amount: number) {
  const existing = await db.select().from(earningsTable).where(eq(earningsTable.userId, creatorId));
  if (existing.length === 0) {
    await db.insert(earningsTable).values({ userId: creatorId });
  }
  const platformFee = amount * 0.05;
  const creatorAmount = amount - platformFee;
  await db
    .update(earningsTable)
    .set({
      totalEarned: sql`total_earned + ${creatorAmount}`,
      availableBalance: sql`available_balance + ${creatorAmount}`,
      updatedAt: new Date(),
    })
    .where(eq(earningsTable.userId, creatorId));
}

router.get("/status", (_req, res) => {
  res.json({ configured: STRIPE_CONFIGURED });
});

router.get("/publishable-key", (_req, res) => {
  const key = process.env.STRIPE_PUBLISHABLE_KEY ?? "";
  if (!key) return res.status(503).json({ error: "Stripe not configured" });
  res.json({ publishableKey: key });
});

router.post("/payment-intent", async (req, res) => {
  try {
    if (!STRIPE_CONFIGURED) {
      return res.status(503).json({ error: "Stripe not configured" });
    }
    const { amount, currency = "usd", metadata = {} } = req.body;
    if (!amount || amount < 0.5) {
      return res.status(400).json({ error: "Amount must be at least $0.50" });
    }
    const intent = await createPaymentIntent(parseFloat(amount), currency, metadata);
    res.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to create payment intent" });
  }
});

router.post("/tip", async (req, res) => {
  try {
    if (!STRIPE_CONFIGURED) {
      return res.status(503).json({ error: "Stripe not configured" });
    }
    const { donorId, creatorId, amount, postId, message } = req.body;
    if (!donorId || !creatorId || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const parsed = parseFloat(amount);
    if (parsed < 0.5) {
      return res.status(400).json({ error: "Minimum tip is $0.50" });
    }
    const intent = await createPaymentIntent(parsed, "usd", {
      type: "tip",
      donorId,
      creatorId,
      postId: postId ?? "",
    });

    const [donation] = await db
      .insert(donationsTable)
      .values({
        donorId,
        creatorId,
        postId: postId ?? null,
        amount: parsed.toString(),
        message: message ?? null,
        status: "pending",
      })
      .returning();

    res.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id, donationId: donation.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to create tip" });
  }
});

router.post("/tip/confirm", async (req, res) => {
  try {
    const { paymentIntentId, donationId, creatorId, amount } = req.body;
    if (!paymentIntentId || !donationId) {
      return res.status(400).json({ error: "Missing paymentIntentId or donationId" });
    }

    if (STRIPE_CONFIGURED && stripe) {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (intent.status !== "succeeded") {
        return res.status(400).json({ error: "Payment not yet succeeded" });
      }
    }

    await db
      .update(donationsTable)
      .set({ status: "completed" })
      .where(eq(donationsTable.id, parseInt(donationId)));

    if (creatorId && amount) {
      await addCreatorEarnings(creatorId, parseFloat(amount));
      await db.insert(inAppNotificationsTable).values({
        userId: creatorId,
        type: "donation",
        title: "New Tip Received!",
        message: `You received a $${parseFloat(amount).toFixed(2)} tip!`,
        metadata: JSON.stringify({ donationId }),
      });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to confirm tip" });
  }
});

router.post("/subscription-product", async (req, res) => {
  try {
    if (!STRIPE_CONFIGURED) {
      return res.status(503).json({ error: "Stripe not configured" });
    }
    const { name, description, monthlyPrice, annualPrice } = req.body;
    if (!name || !description || !monthlyPrice) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const product = await createStripeProduct(name, description);
    const monthlyStripePrice = await createStripePrice(product.id, parseFloat(monthlyPrice), "month");
    let annualStripePriceId: string | undefined;
    if (annualPrice) {
      const annualStripePrice = await createStripePrice(product.id, parseFloat(annualPrice), "year");
      annualStripePriceId = annualStripePrice.id;
    }
    res.json({
      stripeProductId: product.id,
      stripePriceIdMonthly: monthlyStripePrice.id,
      stripePriceIdAnnual: annualStripePriceId,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to create Stripe product" });
  }
});

router.post("/webhook", async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    if (!sig || !STRIPE_CONFIGURED) {
      return res.status(400).json({ error: "No signature or Stripe not configured" });
    }
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(200).json({ received: true });
    }
    const { constructWebhookEvent } = await import("../lib/stripe");
    const event = constructWebhookEvent(req.body as Buffer, sig as string);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as any;
        const { type, donorId, creatorId } = intent.metadata ?? {};
        if (type === "tip" && creatorId) {
          const amount = intent.amount / 100;
          await addCreatorEarnings(creatorId, amount);
        }
        break;
      }
      default:
        break;
    }
    res.json({ received: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
