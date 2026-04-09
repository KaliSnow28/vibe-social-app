import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWallet, type CryptoAsset, type Transaction } from "@/context/WalletContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

function formatUsd(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTime(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TX_ICONS: Record<string, { name: string; color: string }> = {
  send: { name: "arrow-up-circle", color: "#E1306C" },
  receive: { name: "arrow-down-circle", color: "#4CAF50" },
  earn: { name: "star-circle", color: "#F7931A" },
  subscription: { name: "shield-checkmark", color: "#833AB4" },
  tip: { name: "heart-circle", color: "#E1306C" },
};

function AssetCard({ asset }: { asset: CryptoAsset }) {
  const colors = useColors();
  return (
    <View style={[styles.assetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.assetIcon, { backgroundColor: asset.color + "20" }]}>
        <Text style={[styles.assetIconText, { color: asset.color }]}>{asset.icon}</Text>
      </View>
      <View style={styles.assetInfo}>
        <Text style={[styles.assetName, { color: colors.foreground }]}>{asset.name}</Text>
        <Text style={[styles.assetBalance, { color: colors.mutedForeground }]}>
          {asset.balance.toFixed(asset.symbol === "USDC" ? 2 : 6)} {asset.symbol}
        </Text>
      </View>
      <View style={styles.assetRight}>
        <Text style={[styles.assetUsd, { color: colors.foreground }]}>{formatUsd(asset.usdValue)}</Text>
        <Text style={[styles.assetChange, { color: asset.change24h >= 0 ? "#4CAF50" : "#E1306C" }]}>
          {asset.change24h >= 0 ? "▲" : "▼"} {Math.abs(asset.change24h)}%
        </Text>
      </View>
    </View>
  );
}

function TxRow({ tx }: { tx: Transaction }) {
  const colors = useColors();
  const icon = TX_ICONS[tx.type] ?? TX_ICONS.receive;
  return (
    <View style={[styles.txRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.txIcon, { backgroundColor: icon.color + "15" }]}>
        <Ionicons name={icon.name as "star"} size={20} color={icon.color} />
      </View>
      <View style={styles.txInfo}>
        <Text style={[styles.txLabel, { color: colors.foreground }]} numberOfLines={1}>{tx.label}</Text>
        <Text style={[styles.txTime, { color: colors.mutedForeground }]}>{formatTime(tx.timestamp)}</Text>
      </View>
      <View style={styles.txAmounts}>
        <Text style={[styles.txCrypto, { color: tx.type === "send" ? "#E1306C" : "#4CAF50" }]}>
          {tx.type === "send" ? "-" : "+"}{tx.amount.toFixed(tx.symbol === "USDC" ? 2 : 5)} {tx.symbol}
        </Text>
        <Text style={[styles.txUsd, { color: colors.mutedForeground }]}>{formatUsd(tx.usdAmount)}</Text>
      </View>
    </View>
  );
}

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { assets, transactions, totalUsd, sendCrypto, earnReward } = useWallet();
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;

  const [tab, setTab] = useState<"assets" | "history">("assets");
  const [sendModal, setSendModal] = useState(false);
  const [sendSymbol, setSendSymbol] = useState("ETH");
  const [sendAmount, setSendAmount] = useState("");
  const [sendAddress, setSendAddress] = useState("");

  const handleSend = () => {
    const amount = parseFloat(sendAmount);
    const asset = assets.find((a) => a.symbol === sendSymbol);
    if (!amount || !asset || amount > asset.balance) {
      Alert.alert("Error", "Invalid amount or insufficient balance");
      return;
    }
    if (!sendAddress.trim()) {
      Alert.alert("Error", "Please enter a destination address");
      return;
    }
    sendCrypto(sendSymbol, amount, sendAddress, `Sent ${sendSymbol}`);
    setSendModal(false);
    setSendAmount("");
    setSendAddress("");
    Alert.alert("Sent!", `${amount} ${sendSymbol} sent successfully`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#1a0533", "#0d1a3a"]}
        style={[styles.header, { paddingTop: headerTop + 8 }]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Crypto Wallet</Text>
          <Pressable onPress={() => earnReward("USDC", 5.00, "Daily check-in reward")} style={styles.rewardBtn}>
            <Text style={styles.rewardBtnText}>Claim</Text>
          </Pressable>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Portfolio</Text>
          <Text style={styles.balanceAmount}>{formatUsd(totalUsd)}</Text>
          <Text style={styles.balanceSub}>+$18.40 (2.1%) today</Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.actionBtn} onPress={() => setSendModal(true)}>
            <View style={styles.actionIconWrap}>
              <Feather name="arrow-up" size={20} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Send</Text>
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <View style={styles.actionIconWrap}>
              <Feather name="arrow-down" size={20} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Receive</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={() => earnReward("USDC", 2.50, "Quick earn reward")}>
            <View style={styles.actionIconWrap}>
              <FontAwesome5 name="coins" size={18} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Earn</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={() => router.push("/premium")}>
            <View style={styles.actionIconWrap}>
              <Ionicons name="star" size={20} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Premium</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={() => router.push("/bundles")}>
            <View style={[styles.actionIconWrap, { backgroundColor: "rgba(247,147,26,0.3)" }]}>
              <FontAwesome5 name="gem" size={18} color="#F7931A" />
            </View>
            <Text style={styles.actionLabel}>Bundles</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <View style={styles.tabs}>
        {(["assets", "history"] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tabBtn, tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
            <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground }]}>
              {t === "assets" ? "Assets" : "History"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: isWeb ? 34 : 20 }}>
        {tab === "assets" ? (
          <View style={styles.assetList}>
            {assets.map((asset) => <AssetCard key={asset.symbol} asset={asset} />)}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                Earn crypto by creating viral content, receiving tips, and completing daily tasks. Payouts every 24h.
              </Text>
            </View>
          </View>
        ) : (
          <View>
            {transactions.map((tx) => <TxRow key={tx.id} tx={tx} />)}
          </View>
        )}
      </ScrollView>

      <Modal visible={sendModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Send Crypto</Text>
              <Pressable onPress={() => setSendModal(false)}>
                <Feather name="x" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Asset</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.symbolRow}>
              {assets.map((a) => (
                <Pressable
                  key={a.symbol}
                  onPress={() => setSendSymbol(a.symbol)}
                  style={[styles.symbolChip, { borderColor: sendSymbol === a.symbol ? a.color : colors.border, backgroundColor: sendSymbol === a.symbol ? a.color + "20" : colors.muted }]}
                >
                  <Text style={{ color: sendSymbol === a.symbol ? a.color : colors.foreground, fontWeight: "600" }}>{a.symbol}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Amount</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
              placeholder="0.00"
              placeholderTextColor={colors.mutedForeground}
              value={sendAmount}
              onChangeText={setSendAmount}
              keyboardType="decimal-pad"
            />

            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Destination Address</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
              placeholder="0x... or vibe:// address"
              placeholderTextColor={colors.mutedForeground}
              value={sendAddress}
              onChangeText={setSendAddress}
              autoCapitalize="none"
            />

            <Pressable style={[styles.sendBtn, { backgroundColor: colors.primary }]} onPress={handleSend}>
              <Text style={styles.sendBtnText}>Send {sendSymbol}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  backBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  rewardBtn: { backgroundColor: "#F7931A", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 6 },
  rewardBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  balanceCard: { alignItems: "center", marginBottom: 24 },
  balanceLabel: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 6 },
  balanceAmount: { color: "#fff", fontSize: 38, fontWeight: "800", letterSpacing: -1 },
  balanceSub: { color: "#4CAF50", fontSize: 13, marginTop: 4 },
  actionRow: { flexDirection: "row", justifyContent: "space-around" },
  actionBtn: { alignItems: "center", gap: 6 },
  actionIconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  actionLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  tabs: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 14 },
  tabText: { fontSize: 14, fontWeight: "600" },
  assetList: { padding: 16, gap: 10 },
  assetCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
  assetIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  assetIconText: { fontSize: 20, fontWeight: "700" },
  assetInfo: { flex: 1 },
  assetName: { fontSize: 15, fontWeight: "600" },
  assetBalance: { fontSize: 12, marginTop: 2 },
  assetRight: { alignItems: "flex-end" },
  assetUsd: { fontSize: 15, fontWeight: "700" },
  assetChange: { fontSize: 12, marginTop: 2 },
  infoCard: { flexDirection: "row", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
  txRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  txInfo: { flex: 1 },
  txLabel: { fontSize: 14, fontWeight: "500" },
  txTime: { fontSize: 12, marginTop: 2 },
  txAmounts: { alignItems: "flex-end" },
  txCrypto: { fontSize: 14, fontWeight: "600" },
  txUsd: { fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  inputLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  symbolRow: { marginBottom: 4 },
  symbolChip: { borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 4 },
  sendBtn: { borderRadius: 14, padding: 16, alignItems: "center", marginTop: 16 },
  sendBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
