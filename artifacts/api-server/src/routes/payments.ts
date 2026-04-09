import { Router } from "express";
import { db } from "@workspace/db";
import {
  subscriptionTiersTable,
  subscriptionsTable,
  donationsTable,
  payoutAccountsTable,
  earningsTable,
  payoutHistoryTable,
  inAppNotificationsTable,
} from "@workspace/db";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import {
  createPayPalOrder,
  capturePayPalOrder,
  createPayPalProduct,
  createPayPalPlan,
  createPayPalSubscription,
  cancelPayPalSubscription,
  createPayPalPayout,
} from "../lib/paypal";

const router = Router();

const PAYPAL_CONFIGURED = !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);

function getBaseUrl(req: { protocol: string; get: (h: string) => string | undefined }) {
  const host = req.get("host") ?? "localhost";
  return `${req.protocol}://${host}`;
}

async function ensureEarnings(userId: string) {
  const existing = await db.select().from(earningsTable).where(eq(earningsTable.userId, userId));
  if (existing.length === 0) {
    await db.insert(earningsTable).values({ userId });
    return (await db.select().from(earningsTable).where(eq(earningsTable.userId, userId)))[0];
  }
  return existing[0];
}

async function addCreatorEarnings(creatorId: string, amount: number) {
  await ensureEarnings(creatorId);
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

router.get("/subscription-tiers/:creatorId", async (req, res) => {
  try {
    const { creatorId } = req.params;
    const tiers = await db
      .select()
      .from(subscriptionTiersTable)
      .where(
        and(
          eq(subscriptionTiersTable.creatorId, creatorId),
          eq(subscriptionTiersTable.isActive, true)
        )
      )
      .orderBy(subscriptionTiersTable.monthlyPrice);
    res.json({ tiers });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tiers" });
  }
});

router.post("/subscription-tiers", async (req, res) => {
  try {
    const { creatorId, name, description, monthlyPrice, annualPrice, perks } = req.body;

    if (!creatorId || !name || !description || !monthlyPrice || !perks) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let paypalPlanId: string | undefined;

    if (PAYPAL_CONFIGURED) {
      try {
        const product = await createPayPalProduct(name, description);
        const plan = await createPayPalPlan(product.id, {
          name,
          description,
          price: parseFloat(monthlyPrice),
          interval: "MONTH",
        });
        paypalPlanId = plan.id;
      } catch (ppErr) {
        console.error("PayPal plan creation failed:", ppErr);
      }
    }

    const [tier] = await db
      .insert(subscriptionTiersTable)
      .values({
        creatorId,
        name,
        description,
        monthlyPrice: monthlyPrice.toString(),
        annualPrice: annualPrice ? annualPrice.toString() : null,
        perks,
        paypalPlanId,
      })
      .returning();

    res.status(201).json({ tier });
  } catch (err) {
    res.status(500).json({ error: "Failed to create tier" });
  }
});

router.put("/subscription-tiers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, monthlyPrice, annualPrice, perks, isActive } = req.body;

    const [updated] = await db
      .update(subscriptionTiersTable)
      .set({
        ...(name && { name }),
        ...(description && { description }),
        ...(monthlyPrice && { monthlyPrice: monthlyPrice.toString() }),
        ...(annualPrice !== undefined && { annualPrice: annualPrice ? annualPrice.toString() : null }),
        ...(perks && { perks }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(eq(subscriptionTiersTable.id, id))
      .returning();

    res.json({ tier: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update tier" });
  }
});

router.delete("/subscription-tiers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db
      .update(subscriptionTiersTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(subscriptionTiersTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete tier" });
  }
});

router.post("/subscriptions/create", async (req, res) => {
  try {
    const { subscriberId, creatorId, tierId, billingCycle = "monthly" } = req.body;

    if (!subscriberId || !creatorId || !tierId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [tier] = await db
      .select()
      .from(subscriptionTiersTable)
      .where(eq(subscriptionTiersTable.id, parseInt(tierId)));

    if (!tier) {
      return res.status(404).json({ error: "Tier not found" });
    }

    const amount = billingCycle === "annual" && tier.annualPrice
      ? parseFloat(tier.annualPrice)
      : parseFloat(tier.monthlyPrice);

    const baseUrl = getBaseUrl(req as any);
    const returnUrl = `${baseUrl}/api/payments/subscriptions/confirm`;
    const cancelUrl = `${baseUrl}/api/payments/subscriptions/cancel`;

    let approvalUrl: string | undefined;
    let paypalSubscriptionId: string | undefined;

    if (PAYPAL_CONFIGURED && tier.paypalPlanId) {
      try {
        const ppSub = await createPayPalSubscription(tier.paypalPlanId, returnUrl, cancelUrl);
        paypalSubscriptionId = ppSub.id;
        const link = ppSub.links?.find((l: any) => l.rel === "approve");
        approvalUrl = link?.href;
      } catch (ppErr) {
        console.error("PayPal subscription creation failed:", ppErr);
      }
    }

    const expiresAt = new Date();
    if (billingCycle === "annual") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    const [subscription] = await db
      .insert(subscriptionsTable)
      .values({
        subscriberId,
        creatorId,
        tierId: tier.id,
        paypalSubscriptionId,
        status: paypalSubscriptionId ? "pending" : "active",
        billingCycle,
        amount: amount.toString(),
        startedAt: paypalSubscriptionId ? null : new Date(),
        expiresAt,
      })
      .returning();

    if (!paypalSubscriptionId) {
      await addCreatorEarnings(creatorId, amount);
    }

    res.json({ subscription, approvalUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to create subscription" });
  }
});

router.get("/subscriptions/confirm", async (req, res) => {
  try {
    const { subscription_id, ba_token } = req.query;
    if (subscription_id) {
      await db
        .update(subscriptionsTable)
        .set({ status: "active", startedAt: new Date(), updatedAt: new Date() })
        .where(eq(subscriptionsTable.paypalSubscriptionId, subscription_id as string));
    }
    res.json({ success: true, message: "Subscription confirmed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to confirm subscription" });
  }
});

router.post("/subscriptions/:id/cancel", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [sub] = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.id, id));

    if (!sub) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    if (PAYPAL_CONFIGURED && sub.paypalSubscriptionId) {
      try {
        await cancelPayPalSubscription(sub.paypalSubscriptionId, "User requested cancellation");
      } catch (ppErr) {
        console.error("PayPal cancel failed:", ppErr);
      }
    }

    await db
      .update(subscriptionsTable)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(subscriptionsTable.id, id));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

router.get("/subscriptions/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const subs = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.subscriberId, userId))
      .orderBy(desc(subscriptionsTable.createdAt));
    res.json({ subscriptions: subs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

router.post("/donations/create-order", async (req, res) => {
  try {
    const { donorId, creatorId, amount, postId, message } = req.body;

    if (!donorId || !creatorId || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const parsedAmount = parseFloat(amount);
    if (parsedAmount < 0.5) {
      return res.status(400).json({ error: "Minimum donation is $0.50" });
    }

    const baseUrl = getBaseUrl(req as any);

    let paypalOrderId: string | undefined;
    let approvalUrl: string | undefined;

    if (PAYPAL_CONFIGURED) {
      try {
        const order = await createPayPalOrder({
          amount: parsedAmount,
          description: `Tip for creator`,
          returnUrl: `${baseUrl}/api/payments/donations/capture`,
          cancelUrl: `${baseUrl}/api/payments/donations/cancel`,
        });
        paypalOrderId = order.id;
        const link = order.links?.find((l: any) => l.rel === "approve");
        approvalUrl = link?.href;
      } catch (ppErr) {
        console.error("PayPal order creation failed:", ppErr);
      }
    }

    const [donation] = await db
      .insert(donationsTable)
      .values({
        donorId,
        creatorId,
        postId: postId ?? null,
        amount: parsedAmount.toString(),
        message: message ?? null,
        paypalOrderId,
        status: paypalOrderId ? "pending" : "completed",
      })
      .returning();

    if (!paypalOrderId) {
      await addCreatorEarnings(creatorId, parsedAmount);
    }

    res.json({ donation, approvalUrl, orderId: paypalOrderId });
  } catch (err) {
    res.status(500).json({ error: "Failed to create donation" });
  }
});

router.post("/donations/capture", async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "orderId required" });
    }

    const [donation] = await db
      .select()
      .from(donationsTable)
      .where(eq(donationsTable.paypalOrderId, orderId));

    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }

    let captureId: string | undefined;

    if (PAYPAL_CONFIGURED) {
      try {
        const capture = await capturePayPalOrder(orderId);
        captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id;
      } catch (ppErr) {
        console.error("PayPal capture failed:", ppErr);
        return res.status(400).json({ error: "Payment capture failed" });
      }
    }

    await db
      .update(donationsTable)
      .set({ status: "completed", paypalCaptureId: captureId })
      .where(eq(donationsTable.paypalOrderId, orderId));

    await addCreatorEarnings(donation.creatorId, parseFloat(donation.amount));

    await db.insert(inAppNotificationsTable).values({
      userId: donation.creatorId,
      type: "donation",
      title: "New Tip Received!",
      message: `You received a $${parseFloat(donation.amount).toFixed(2)} tip!`,
      metadata: JSON.stringify({ donationId: donation.id }),
    });

    res.json({ success: true, captureId });
  } catch (err) {
    res.status(500).json({ error: "Failed to capture donation" });
  }
});

router.get("/payout-accounts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const accounts = await db
      .select()
      .from(payoutAccountsTable)
      .where(eq(payoutAccountsTable.userId, userId))
      .orderBy(desc(payoutAccountsTable.isPrimary));
    res.json({ accounts });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payout accounts" });
  }
});

router.post("/payout-accounts", async (req, res) => {
  try {
    const { userId, method, accountIdentifier, displayName, isPrimary } = req.body;

    if (!userId || !method || !accountIdentifier || !displayName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (isPrimary) {
      await db
        .update(payoutAccountsTable)
        .set({ isPrimary: false, updatedAt: new Date() })
        .where(eq(payoutAccountsTable.userId, userId));
    }

    const [account] = await db
      .insert(payoutAccountsTable)
      .values({
        userId,
        method,
        accountIdentifier,
        displayName,
        isPrimary: isPrimary ?? false,
      })
      .returning();

    res.status(201).json({ account });
  } catch (err) {
    res.status(500).json({ error: "Failed to add payout account" });
  }
});

router.put("/payout-accounts/:id/set-primary", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [account] = await db
      .select()
      .from(payoutAccountsTable)
      .where(eq(payoutAccountsTable.id, id));

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    await db
      .update(payoutAccountsTable)
      .set({ isPrimary: false, updatedAt: new Date() })
      .where(eq(payoutAccountsTable.userId, account.userId));

    await db
      .update(payoutAccountsTable)
      .set({ isPrimary: true, updatedAt: new Date() })
      .where(eq(payoutAccountsTable.id, id));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to set primary account" });
  }
});

router.delete("/payout-accounts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(payoutAccountsTable).where(eq(payoutAccountsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});

router.get("/earnings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const earnings = await ensureEarnings(userId);
    res.json({ earnings });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch earnings" });
  }
});

router.put("/earnings/:userId/daily-payout", async (req, res) => {
  try {
    const { userId } = req.params;
    const { enabled } = req.body;

    await ensureEarnings(userId);
    await db
      .update(earningsTable)
      .set({ dailyPayoutEnabled: enabled, updatedAt: new Date() })
      .where(eq(earningsTable.userId, userId));

    res.json({ success: true, dailyPayoutEnabled: enabled });
  } catch (err) {
    res.status(500).json({ error: "Failed to update daily payout setting" });
  }
});

router.get("/payout-history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await db
      .select()
      .from(payoutHistoryTable)
      .where(eq(payoutHistoryTable.userId, userId))
      .orderBy(desc(payoutHistoryTable.initiatedAt));
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payout history" });
  }
});

router.post("/payouts/trigger", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const earnings = await ensureEarnings(userId);
    const available = parseFloat(earnings.availableBalance ?? "0");
    const threshold = parseFloat(earnings.minimumPayoutThreshold ?? "10");

    if (available < threshold) {
      return res.status(400).json({
        error: `Balance $${available.toFixed(2)} is below minimum threshold $${threshold.toFixed(2)}`,
      });
    }

    const [primaryAccount] = await db
      .select()
      .from(payoutAccountsTable)
      .where(
        and(
          eq(payoutAccountsTable.userId, userId),
          eq(payoutAccountsTable.isPrimary, true)
        )
      );

    if (!primaryAccount) {
      return res.status(400).json({ error: "No primary payout account configured" });
    }

    let paypalPayoutBatchId: string | undefined;
    let paypalPayoutId: string | undefined;
    let status: "pending" | "processing" | "completed" | "failed" = "pending";
    let failureReason: string | undefined;

    if (PAYPAL_CONFIGURED && primaryAccount.method === "paypal") {
      try {
        const payout = await createPayPalPayout([
          {
            receiverEmail: primaryAccount.accountIdentifier,
            amount: available,
            senderItemId: `payout_${userId}_${Date.now()}`,
            note: "Your creator earnings payout",
          },
        ]);
        paypalPayoutBatchId = payout.batch_header?.payout_batch_id;
        paypalPayoutId = payout.items?.[0]?.payout_item_id;
        status = "processing";
      } catch (ppErr: any) {
        console.error("PayPal payout failed:", ppErr);
        failureReason = ppErr.message;
        status = "failed";
      }
    } else if (!PAYPAL_CONFIGURED) {
      status = "processing";
    } else {
      status = "processing";
    }

    const [payoutRecord] = await db
      .insert(payoutHistoryTable)
      .values({
        userId,
        payoutAccountId: primaryAccount.id,
        amount: available.toString(),
        method: primaryAccount.method,
        accountIdentifier: primaryAccount.accountIdentifier,
        status,
        paypalPayoutId,
        paypalPayoutBatchId,
        failureReason,
      })
      .returning();

    if (status !== "failed") {
      await db
        .update(earningsTable)
        .set({
          availableBalance: "0",
          totalPaidOut: sql`total_paid_out + ${available}`,
          updatedAt: new Date(),
        })
        .where(eq(earningsTable.userId, userId));

      await db.insert(inAppNotificationsTable).values({
        userId,
        type: "payout",
        title: "Payout Initiated",
        message: `$${available.toFixed(2)} payout has been initiated to your ${primaryAccount.method} account.`,
        metadata: JSON.stringify({ payoutId: payoutRecord.id }),
      });
    } else {
      await db.insert(inAppNotificationsTable).values({
        userId,
        type: "payout_failed",
        title: "Payout Failed",
        message: `Your payout of $${available.toFixed(2)} failed: ${failureReason}`,
        metadata: JSON.stringify({ payoutId: payoutRecord.id }),
      });
    }

    res.json({ payout: payoutRecord });
  } catch (err) {
    res.status(500).json({ error: "Failed to trigger payout" });
  }
});

router.post("/payouts/daily-cron", async (req, res) => {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && req.headers["x-cron-secret"] !== cronSecret) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const threshold = 10;
    const eligibleCreators = await db
      .select()
      .from(earningsTable)
      .where(
        and(
          eq(earningsTable.dailyPayoutEnabled, true),
          gte(earningsTable.availableBalance, threshold.toString())
        )
      );

    const results = [];
    for (const creator of eligibleCreators) {
      try {
        const available = parseFloat(creator.availableBalance ?? "0");
        const [primaryAccount] = await db
          .select()
          .from(payoutAccountsTable)
          .where(
            and(
              eq(payoutAccountsTable.userId, creator.userId),
              eq(payoutAccountsTable.isPrimary, true)
            )
          );

        if (!primaryAccount) {
          results.push({ userId: creator.userId, status: "skipped", reason: "No primary account" });
          continue;
        }

        let paypalPayoutBatchId: string | undefined;
        let status: "pending" | "processing" | "completed" | "failed" = "processing";
        let failureReason: string | undefined;

        if (PAYPAL_CONFIGURED && primaryAccount.method === "paypal") {
          try {
            const payout = await createPayPalPayout([
              {
                receiverEmail: primaryAccount.accountIdentifier,
                amount: available,
                senderItemId: `daily_${creator.userId}_${Date.now()}`,
                note: "Daily creator payout",
              },
            ]);
            paypalPayoutBatchId = payout.batch_header?.payout_batch_id;
          } catch (ppErr: any) {
            status = "failed";
            failureReason = ppErr.message;
          }
        }

        const [payoutRecord] = await db
          .insert(payoutHistoryTable)
          .values({
            userId: creator.userId,
            payoutAccountId: primaryAccount.id,
            amount: available.toString(),
            method: primaryAccount.method,
            accountIdentifier: primaryAccount.accountIdentifier,
            status,
            paypalPayoutBatchId,
            failureReason,
          })
          .returning();

        if (status !== "failed") {
          await db
            .update(earningsTable)
            .set({
              availableBalance: "0",
              totalPaidOut: sql`total_paid_out + ${available}`,
              updatedAt: new Date(),
            })
            .where(eq(earningsTable.userId, creator.userId));

          await db.insert(inAppNotificationsTable).values({
            userId: creator.userId,
            type: "payout",
            title: "Daily Payout Sent",
            message: `$${available.toFixed(2)} has been sent to your ${primaryAccount.method} account.`,
            metadata: JSON.stringify({ payoutId: payoutRecord.id }),
          });
        } else {
          await db.insert(inAppNotificationsTable).values({
            userId: creator.userId,
            type: "payout_failed",
            title: "Daily Payout Failed",
            message: `Your daily payout of $${available.toFixed(2)} failed: ${failureReason}`,
          });
        }

        results.push({ userId: creator.userId, status, amount: available });
      } catch (err: any) {
        results.push({ userId: creator.userId, status: "error", error: err.message });
      }
    }

    res.json({ processed: results.length, results });
  } catch (err) {
    res.status(500).json({ error: "Cron job failed" });
  }
});

router.get("/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const notifs = await db
      .select()
      .from(inAppNotificationsTable)
      .where(eq(inAppNotificationsTable.userId, userId))
      .orderBy(desc(inAppNotificationsTable.createdAt));
    res.json({ notifications: notifs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.put("/notifications/:id/read", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db
      .update(inAppNotificationsTable)
      .set({ isRead: true })
      .where(eq(inAppNotificationsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

router.post("/webhooks/paypal", async (req, res) => {
  try {
    const eventType = req.body?.event_type;
    const resource = req.body?.resource;

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const subscriptionId = resource?.id;
        if (subscriptionId) {
          await db
            .update(subscriptionsTable)
            .set({ status: "active", startedAt: new Date(), updatedAt: new Date() })
            .where(eq(subscriptionsTable.paypalSubscriptionId, subscriptionId));
        }
        break;
      }
      case "BILLING.SUBSCRIPTION.CANCELLED": {
        const subscriptionId = resource?.id;
        if (subscriptionId) {
          await db
            .update(subscriptionsTable)
            .set({ status: "cancelled", updatedAt: new Date() })
            .where(eq(subscriptionsTable.paypalSubscriptionId, subscriptionId));
        }
        break;
      }
      case "PAYMENT.SALE.COMPLETED": {
        const captureId = resource?.id;
        if (captureId) {
          const [donation] = await db
            .select()
            .from(donationsTable)
            .where(eq(donationsTable.paypalCaptureId, captureId));
          if (!donation) {
            const subLink = resource?.billing_agreement_id;
            if (subLink) {
              const [sub] = await db
                .select()
                .from(subscriptionsTable)
                .where(eq(subscriptionsTable.paypalSubscriptionId, subLink));
              if (sub) {
                await addCreatorEarnings(sub.creatorId, parseFloat(sub.amount));
              }
            }
          }
        }
        break;
      }
      case "PAYMENT.PAYOUTS-ITEM.SUCCEEDED": {
        const payoutItemId = resource?.payout_item_id;
        if (payoutItemId) {
          await db
            .update(payoutHistoryTable)
            .set({ status: "completed", completedAt: new Date() })
            .where(eq(payoutHistoryTable.paypalPayoutId, payoutItemId));
        }
        break;
      }
      case "PAYMENT.PAYOUTS-ITEM.FAILED": {
        const payoutItemId = resource?.payout_item_id;
        if (payoutItemId) {
          await db
            .update(payoutHistoryTable)
            .set({ status: "failed", failureReason: resource?.errors?.message })
            .where(eq(payoutHistoryTable.paypalPayoutId, payoutItemId));
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
