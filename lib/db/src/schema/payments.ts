import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "cancelled",
  "expired",
  "pending",
]);

export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const payoutMethodEnum = pgEnum("payout_method", [
  "paypal",
  "venmo",
  "chime",
]);

export const subscriptionTiersTable = pgTable("subscription_tiers", {
  id: serial("id").primaryKey(),
  creatorId: text("creator_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  annualPrice: decimal("annual_price", { precision: 10, scale: 2 }),
  perks: text("perks").notNull(),
  paypalPlanId: text("paypal_plan_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  subscriberId: text("subscriber_id").notNull(),
  creatorId: text("creator_id").notNull(),
  tierId: integer("tier_id").notNull(),
  paypalSubscriptionId: text("paypal_subscription_id"),
  status: subscriptionStatusEnum("status").notNull().default("pending"),
  billingCycle: text("billing_cycle").notNull().default("monthly"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  startedAt: timestamp("started_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const donationsTable = pgTable("donations", {
  id: serial("id").primaryKey(),
  donorId: text("donor_id").notNull(),
  creatorId: text("creator_id").notNull(),
  postId: text("post_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  message: text("message"),
  paypalOrderId: text("paypal_order_id"),
  paypalCaptureId: text("paypal_capture_id"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payoutAccountsTable = pgTable("payout_accounts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  method: payoutMethodEnum("method").notNull(),
  accountIdentifier: text("account_identifier").notNull(),
  displayName: text("display_name").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const earningsTable = pgTable("earnings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  totalEarned: decimal("total_earned", { precision: 12, scale: 2 }).notNull().default("0"),
  availableBalance: decimal("available_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  pendingBalance: decimal("pending_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  totalPaidOut: decimal("total_paid_out", { precision: 12, scale: 2 }).notNull().default("0"),
  dailyPayoutEnabled: boolean("daily_payout_enabled").notNull().default(false),
  minimumPayoutThreshold: decimal("minimum_payout_threshold", { precision: 10, scale: 2 }).notNull().default("10"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const payoutHistoryTable = pgTable("payout_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  payoutAccountId: integer("payout_account_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: payoutMethodEnum("method").notNull(),
  accountIdentifier: text("account_identifier").notNull(),
  status: payoutStatusEnum("status").notNull().default("pending"),
  paypalPayoutId: text("paypal_payout_id"),
  paypalPayoutBatchId: text("paypal_payout_batch_id"),
  failureReason: text("failure_reason"),
  initiatedAt: timestamp("initiated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const inAppNotificationsTable = pgTable("in_app_notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubscriptionTierSchema = createInsertSchema(subscriptionTiersTable).omit({
  id: true,
  paypalPlanId: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSubscriptionTier = z.infer<typeof insertSubscriptionTierSchema>;
export type SubscriptionTier = typeof subscriptionTiersTable.$inferSelect;

export const insertSubscriptionSchema = createInsertSchema(subscriptionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptionsTable.$inferSelect;

export const insertDonationSchema = createInsertSchema(donationsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donationsTable.$inferSelect;

export const insertPayoutAccountSchema = createInsertSchema(payoutAccountsTable).omit({
  id: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPayoutAccount = z.infer<typeof insertPayoutAccountSchema>;
export type PayoutAccount = typeof payoutAccountsTable.$inferSelect;

export const insertEarningsSchema = createInsertSchema(earningsTable).omit({
  id: true,
  updatedAt: true,
});
export type InsertEarnings = z.infer<typeof insertEarningsSchema>;
export type Earnings = typeof earningsTable.$inferSelect;

export const insertPayoutHistorySchema = createInsertSchema(payoutHistoryTable).omit({
  id: true,
  initiatedAt: true,
  completedAt: true,
});
export type InsertPayoutHistory = z.infer<typeof insertPayoutHistorySchema>;
export type PayoutHistory = typeof payoutHistoryTable.$inferSelect;

export const insertInAppNotificationSchema = createInsertSchema(inAppNotificationsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertInAppNotification = z.infer<typeof insertInAppNotificationSchema>;
export type InAppNotification = typeof inAppNotificationsTable.$inferSelect;
