import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "/api";

export interface SubscriptionTier {
  id: number;
  creatorId: string;
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string | null;
  perks: string;
  isActive: boolean;
  createdAt: string;
}

export interface Subscription {
  id: number;
  subscriberId: string;
  creatorId: string;
  tierId: number;
  status: "active" | "cancelled" | "expired" | "pending";
  billingCycle: string;
  amount: string;
  startedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface Donation {
  id: number;
  donorId: string;
  creatorId: string;
  postId: string | null;
  amount: string;
  message: string | null;
  status: string;
  createdAt: string;
}

export interface PayoutAccount {
  id: number;
  userId: string;
  method: "paypal" | "venmo" | "chime";
  accountIdentifier: string;
  displayName: string;
  isPrimary: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface Earnings {
  userId: string;
  totalEarned: string;
  availableBalance: string;
  pendingBalance: string;
  totalPaidOut: string;
  dailyPayoutEnabled: boolean;
  minimumPayoutThreshold: string;
}

export interface PayoutRecord {
  id: number;
  userId: string;
  amount: string;
  method: "paypal" | "venmo" | "chime";
  accountIdentifier: string;
  status: "pending" | "processing" | "completed" | "failed";
  failureReason: string | null;
  initiatedAt: string;
  completedAt: string | null;
}

export interface PaymentNotification {
  id: number;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface PaymentsContextType {
  tiers: SubscriptionTier[];
  subscriptions: Subscription[];
  payoutAccounts: PayoutAccount[];
  earnings: Earnings | null;
  payoutHistory: PayoutRecord[];
  paymentNotifications: PaymentNotification[];
  loadingEarnings: boolean;
  loadTiers: (creatorId: string) => Promise<void>;
  createTier: (data: Omit<SubscriptionTier, "id" | "creatorId" | "isActive" | "createdAt">) => Promise<void>;
  deleteTier: (tierId: number) => Promise<void>;
  subscribe: (creatorId: string, tierId: number, billingCycle: string) => Promise<{ approvalUrl?: string }>;
  cancelSubscription: (subId: number) => Promise<void>;
  sendTip: (creatorId: string, amount: number, postId?: string, message?: string) => Promise<{ approvalUrl?: string }>;
  loadPayoutAccounts: (userId: string) => Promise<void>;
  addPayoutAccount: (data: Omit<PayoutAccount, "id" | "isVerified" | "createdAt">) => Promise<void>;
  deletePayoutAccount: (accountId: number) => Promise<void>;
  setPrimaryAccount: (accountId: number) => Promise<void>;
  loadEarnings: (userId: string) => Promise<void>;
  toggleDailyPayout: (userId: string, enabled: boolean) => Promise<void>;
  loadPayoutHistory: (userId: string) => Promise<void>;
  triggerPayout: (userId: string) => Promise<void>;
  loadPaymentNotifications: (userId: string) => Promise<void>;
  markPaymentNotificationRead: (notifId: number) => Promise<void>;
}

const PaymentsContext = createContext<PaymentsContextType | null>(null);

async function apiFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? "Request failed");
  }
  return response.json();
}

export function PaymentsProvider({ children }: { children: React.ReactNode }) {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payoutAccounts, setPayoutAccounts] = useState<PayoutAccount[]>([]);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutRecord[]>([]);
  const [paymentNotifications, setPaymentNotifications] = useState<PaymentNotification[]>([]);
  const [loadingEarnings, setLoadingEarnings] = useState(false);

  const loadTiers = useCallback(async (creatorId: string) => {
    try {
      const data = await apiFetch(`/payments/subscription-tiers/${creatorId}`);
      setTiers(data.tiers ?? []);
    } catch {
      setTiers([]);
    }
  }, []);

  const createTier = useCallback(async (tierData: any) => {
    const data = await apiFetch("/payments/subscription-tiers", {
      method: "POST",
      body: JSON.stringify(tierData),
    });
    setTiers((prev) => [...prev, data.tier]);
  }, []);

  const deleteTier = useCallback(async (tierId: number) => {
    await apiFetch(`/payments/subscription-tiers/${tierId}`, { method: "DELETE" });
    setTiers((prev) => prev.filter((t) => t.id !== tierId));
  }, []);

  const subscribe = useCallback(async (creatorId: string, tierId: number, billingCycle: string) => {
    const data = await apiFetch("/payments/subscriptions/create", {
      method: "POST",
      body: JSON.stringify({ subscriberId: "me", creatorId, tierId, billingCycle }),
    });
    if (data.subscription) {
      setSubscriptions((prev) => [data.subscription, ...prev]);
    }
    return { approvalUrl: data.approvalUrl };
  }, []);

  const cancelSubscription = useCallback(async (subId: number) => {
    await apiFetch(`/payments/subscriptions/${subId}/cancel`, { method: "POST" });
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: "cancelled" } : s))
    );
  }, []);

  const sendTip = useCallback(async (creatorId: string, amount: number, postId?: string, message?: string) => {
    const data = await apiFetch("/payments/donations/create-order", {
      method: "POST",
      body: JSON.stringify({ donorId: "me", creatorId, amount, postId, message }),
    });
    return { approvalUrl: data.approvalUrl, orderId: data.orderId };
  }, []);

  const loadPayoutAccounts = useCallback(async (userId: string) => {
    try {
      const data = await apiFetch(`/payments/payout-accounts/${userId}`);
      setPayoutAccounts(data.accounts ?? []);
    } catch {
      setPayoutAccounts([]);
    }
  }, []);

  const addPayoutAccount = useCallback(async (accountData: any) => {
    const data = await apiFetch("/payments/payout-accounts", {
      method: "POST",
      body: JSON.stringify(accountData),
    });
    setPayoutAccounts((prev) => {
      if (accountData.isPrimary) {
        return [data.account, ...prev.map((a) => ({ ...a, isPrimary: false }))];
      }
      return [...prev, data.account];
    });
  }, []);

  const deletePayoutAccount = useCallback(async (accountId: number) => {
    await apiFetch(`/payments/payout-accounts/${accountId}`, { method: "DELETE" });
    setPayoutAccounts((prev) => prev.filter((a) => a.id !== accountId));
  }, []);

  const setPrimaryAccount = useCallback(async (accountId: number) => {
    await apiFetch(`/payments/payout-accounts/${accountId}/set-primary`, { method: "PUT" });
    setPayoutAccounts((prev) =>
      prev.map((a) => ({ ...a, isPrimary: a.id === accountId }))
    );
  }, []);

  const loadEarnings = useCallback(async (userId: string) => {
    setLoadingEarnings(true);
    try {
      const data = await apiFetch(`/payments/earnings/${userId}`);
      setEarnings(data.earnings);
    } catch {
      setEarnings(null);
    } finally {
      setLoadingEarnings(false);
    }
  }, []);

  const toggleDailyPayout = useCallback(async (userId: string, enabled: boolean) => {
    await apiFetch(`/payments/earnings/${userId}/daily-payout`, {
      method: "PUT",
      body: JSON.stringify({ enabled }),
    });
    setEarnings((prev) => prev ? { ...prev, dailyPayoutEnabled: enabled } : prev);
  }, []);

  const loadPayoutHistory = useCallback(async (userId: string) => {
    try {
      const data = await apiFetch(`/payments/payout-history/${userId}`);
      setPayoutHistory(data.history ?? []);
    } catch {
      setPayoutHistory([]);
    }
  }, []);

  const triggerPayout = useCallback(async (userId: string) => {
    await apiFetch("/payments/payouts/trigger", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }, []);

  const loadPaymentNotifications = useCallback(async (userId: string) => {
    try {
      const data = await apiFetch(`/payments/notifications/${userId}`);
      setPaymentNotifications(data.notifications ?? []);
    } catch {
      setPaymentNotifications([]);
    }
  }, []);

  const markPaymentNotificationRead = useCallback(async (notifId: number) => {
    await apiFetch(`/payments/notifications/${notifId}/read`, { method: "PUT" });
    setPaymentNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  }, []);

  return (
    <PaymentsContext.Provider
      value={{
        tiers,
        subscriptions,
        payoutAccounts,
        earnings,
        payoutHistory,
        paymentNotifications,
        loadingEarnings,
        loadTiers,
        createTier,
        deleteTier,
        subscribe,
        cancelSubscription,
        sendTip,
        loadPayoutAccounts,
        addPayoutAccount,
        deletePayoutAccount,
        setPrimaryAccount,
        loadEarnings,
        toggleDailyPayout,
        loadPayoutHistory,
        triggerPayout,
        loadPaymentNotifications,
        markPaymentNotificationRead,
      }}
    >
      {children}
    </PaymentsContext.Provider>
  );
}

export function usePayments() {
  const ctx = useContext(PaymentsContext);
  if (!ctx) throw new Error("usePayments must be used within PaymentsProvider");
  return ctx;
}
