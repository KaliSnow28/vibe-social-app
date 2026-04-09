import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface CryptoAsset {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  change24h: number;
  icon: string;
  color: string;
}

export type TxType = "send" | "receive" | "earn" | "subscription" | "tip";

export interface Transaction {
  id: string;
  type: TxType;
  symbol: string;
  amount: number;
  usdAmount: number;
  address: string;
  label: string;
  timestamp: number;
  confirmed: boolean;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  perks: string[];
  color: string;
  popular?: boolean;
}

interface WalletContextType {
  assets: CryptoAsset[];
  transactions: Transaction[];
  totalUsd: number;
  activeTier: string | null;
  sendCrypto: (symbol: string, amount: number, toAddress: string, label: string) => void;
  earnReward: (symbol: string, amount: number, label: string) => void;
  subscribeTier: (tierId: string) => void;
  tipCreator: (username: string, symbol: string, amount: number) => void;
}

const TIERS: SubscriptionTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    perks: ["Basic feed", "Stories", "DMs (10/day)", "Standard quality"],
    color: "#8e8e8e",
  },
  {
    id: "plus",
    name: "Vibe+",
    price: 4.99,
    perks: ["Everything in Free", "HD video", "Unlimited DMs", "Early features", "No ads"],
    color: "#E1306C",
    popular: true,
  },
  {
    id: "pro",
    name: "Vibe Pro",
    price: 14.99,
    perks: ["Everything in Vibe+", "Creator monetization", "Priority support", "Analytics dashboard", "Custom badges"],
    color: "#833AB4",
  },
  {
    id: "creator",
    name: "Creator Elite",
    price: 29.99,
    perks: ["Everything in Pro", "Daily crypto payouts", "Live streaming", "Co-stream features", "Verified badge"],
    color: "#F77737",
  },
];

export const SUBSCRIPTION_TIERS = TIERS;

const INITIAL_ASSETS: CryptoAsset[] = [
  { symbol: "BTC", name: "Bitcoin", balance: 0.00412, usdValue: 248.52, change24h: 2.3, icon: "₿", color: "#F7931A" },
  { symbol: "ETH", name: "Ethereum", balance: 0.215, usdValue: 681.25, change24h: -0.8, icon: "Ξ", color: "#627EEA" },
  { symbol: "USDC", name: "USD Coin", balance: 124.50, usdValue: 124.50, change24h: 0.0, icon: "$", color: "#2775CA" },
  { symbol: "SOL", name: "Solana", balance: 3.72, usdValue: 558.00, change24h: 5.1, icon: "◎", color: "#9945FF" },
];

const INITIAL_TXS: Transaction[] = [
  { id: "tx1", type: "earn", symbol: "USDC", amount: 12.50, usdAmount: 12.50, address: "vibe://reward", label: "Content creator reward", timestamp: Date.now() - 1000 * 60 * 30, confirmed: true },
  { id: "tx2", type: "receive", symbol: "ETH", amount: 0.01, usdAmount: 31.65, address: "0x1a2b3c4d", label: "Tip from @alex_creates", timestamp: Date.now() - 1000 * 60 * 60 * 3, confirmed: true },
  { id: "tx3", type: "earn", symbol: "USDC", amount: 8.20, usdAmount: 8.20, address: "vibe://reward", label: "Daily payout - 2.1K views", timestamp: Date.now() - 1000 * 60 * 60 * 24, confirmed: true },
  { id: "tx4", type: "send", symbol: "ETH", amount: 0.005, usdAmount: 15.82, address: "0x9f8e7d6c", label: "Gift to @sarah.vibes", timestamp: Date.now() - 1000 * 60 * 60 * 26, confirmed: true },
  { id: "tx5", type: "earn", symbol: "SOL", amount: 0.5, usdAmount: 75.00, address: "vibe://reward", label: "Viral reel bonus", timestamp: Date.now() - 1000 * 60 * 60 * 48, confirmed: true },
  { id: "tx6", type: "subscription", symbol: "USDC", amount: 14.99, usdAmount: 14.99, address: "vibe://sub", label: "Vibe Pro subscription", timestamp: Date.now() - 1000 * 60 * 60 * 72, confirmed: true },
];

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [assets, setAssets] = useState<CryptoAsset[]>(INITIAL_ASSETS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TXS);
  const [activeTier, setActiveTier] = useState<string | null>("pro");

  useEffect(() => {
    AsyncStorage.getItem("vibe:wallet_tier").then((tier) => {
      if (tier) setActiveTier(tier);
    }).catch(() => {});
  }, []);

  const totalUsd = assets.reduce((sum, a) => sum + a.usdValue, 0);

  const sendCrypto = useCallback((symbol: string, amount: number, toAddress: string, label: string) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.symbol === symbol
          ? { ...a, balance: Math.max(0, a.balance - amount), usdValue: Math.max(0, a.usdValue - amount * (a.usdValue / a.balance)) }
          : a
      )
    );
    const usdRate = assets.find((a) => a.symbol === symbol)?.usdValue ?? 0;
    const balance = assets.find((a) => a.symbol === symbol)?.balance ?? 1;
    setTransactions((prev) => [
      {
        id: makeId(),
        type: "send",
        symbol,
        amount,
        usdAmount: (usdRate / balance) * amount,
        address: toAddress,
        label,
        timestamp: Date.now(),
        confirmed: true,
      },
      ...prev,
    ]);
  }, [assets]);

  const earnReward = useCallback((symbol: string, amount: number, label: string) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.symbol === symbol
          ? { ...a, balance: a.balance + amount, usdValue: a.usdValue + amount }
          : a
      )
    );
    setTransactions((prev) => [
      {
        id: makeId(),
        type: "earn",
        symbol,
        amount,
        usdAmount: amount,
        address: "vibe://reward",
        label,
        timestamp: Date.now(),
        confirmed: true,
      },
      ...prev,
    ]);
  }, []);

  const subscribeTier = useCallback((tierId: string) => {
    setActiveTier(tierId);
    AsyncStorage.setItem("vibe:wallet_tier", tierId).catch(() => {});
    const tier = TIERS.find((t) => t.id === tierId);
    if (tier && tier.price > 0) {
      setTransactions((prev) => [
        {
          id: makeId(),
          type: "subscription",
          symbol: "USDC",
          amount: tier.price,
          usdAmount: tier.price,
          address: "vibe://sub",
          label: `${tier.name} subscription`,
          timestamp: Date.now(),
          confirmed: true,
        },
        ...prev,
      ]);
    }
  }, []);

  const tipCreator = useCallback((username: string, symbol: string, amount: number) => {
    sendCrypto(symbol, amount, `vibe://${username}`, `Tip to @${username}`);
  }, [sendCrypto]);

  return (
    <WalletContext.Provider value={{ assets, transactions, totalUsd, activeTier, sendCrypto, earnReward, subscribeTier, tipCreator }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
