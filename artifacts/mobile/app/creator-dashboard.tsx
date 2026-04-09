import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWallet } from "@/context/WalletContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const EARNINGS_DATA = [
  { day: "Mon", amount: 12.4 },
  { day: "Tue", amount: 8.2 },
  { day: "Wed", amount: 24.1 },
  { day: "Thu", amount: 18.7 },
  { day: "Fri", amount: 31.5 },
  { day: "Sat", amount: 45.2 },
  { day: "Sun", amount: 28.9 },
];

const TOP_CONTENT = [
  { title: "Golden hour reel", views: "124K", earnings: 24.80, type: "reel", engagement: "8.2%" },
  { title: "Morning routine story", views: "89K", earnings: 17.80, type: "story", engagement: "6.1%" },
  { title: "Travel photo series", views: "67K", earnings: 13.40, type: "post", engagement: "5.3%" },
  { title: "Cooking tutorial", views: "52K", earnings: 10.40, type: "reel", engagement: "7.8%" },
];

const STATS = [
  { label: "Followers", value: "24.8K", icon: "people-outline", color: "#E1306C" },
  { label: "Total Views", value: "1.2M", icon: "eye-outline", color: "#833AB4" },
  { label: "Engagement", value: "6.4%", icon: "heart-outline", color: "#F7931A" },
  { label: "Reach", value: "342K", icon: "globe-outline", color: "#4CAF50" },
];

function BarChart({ data }: { data: typeof EARNINGS_DATA }) {
  const max = Math.max(...data.map((d) => d.amount));
  const colors = useColors();
  return (
    <View style={styles.chartContainer}>
      {data.map((d, i) => (
        <View key={i} style={styles.chartBar}>
          <View style={styles.barWrapper}>
            <LinearGradient
              colors={["#E1306C", "#833AB4"]}
              style={[styles.bar, { height: `${(d.amount / max) * 100}%` }]}
            />
          </View>
          <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{d.day}</Text>
        </View>
      ))}
    </View>
  );
}

export default function CreatorDashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { totalUsd, earnReward } = useWallet();
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;
  const [activeTab, setActiveTab] = useState<"overview" | "content" | "payouts">("overview");

  const weekTotal = EARNINGS_DATA.reduce((s, d) => s + d.amount, 0);

  const handlePayout = () => {
    earnReward("USDC", weekTotal, "Weekly creator payout");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#1a0533", "#0d1a3a"]} style={[styles.header, { paddingTop: headerTop + 8 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Creator Dashboard</Text>
          <Pressable onPress={() => router.push("/wallet")}>
            <Ionicons name="wallet-outline" size={22} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.earningsOverview}>
          <View style={styles.earningMain}>
            <Text style={styles.earningLabel}>This Week</Text>
            <Text style={styles.earningAmount}>${weekTotal.toFixed(2)}</Text>
            <Text style={styles.earningChange}>▲ 18.3% vs last week</Text>
          </View>
          <Pressable style={styles.payoutBtn} onPress={handlePayout}>
            <Feather name="download" size={16} color="#fff" />
            <Text style={styles.payoutBtnText}>Payout Now</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {(["overview", "content", "payouts"] as const).map((t) => (
            <Pressable key={t} onPress={() => setActiveTab(t)} style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}>
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {activeTab === "overview" && (
          <>
            <View style={styles.statsGrid}>
              {STATS.map((s) => (
                <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name={s.icon as "people-outline"} size={22} color={s.color} />
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Daily Earnings (USD)</Text>
              <BarChart data={EARNINGS_DATA} />
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Next Payout</Text>
              <View style={styles.payoutRow}>
                <View>
                  <Text style={[styles.payoutAmount, { color: colors.primary }]}>${weekTotal.toFixed(2)} USDC</Text>
                  <Text style={[styles.payoutSub, { color: colors.mutedForeground }]}>Auto-payout in 14h 32m</Text>
                </View>
                <Pressable style={[styles.inlineBtn, { backgroundColor: colors.primary }]} onPress={handlePayout}>
                  <Text style={styles.inlineBtnText}>Claim Early</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}

        {activeTab === "content" && (
          <View style={styles.contentList}>
            <Text style={[styles.listTitle, { color: colors.foreground }]}>Top Performing Content</Text>
            {TOP_CONTENT.map((c, i) => (
              <View key={i} style={[styles.contentRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.contentType, { backgroundColor: c.type === "reel" ? "#E1306C20" : c.type === "story" ? "#833AB420" : "#F7931A20" }]}>
                  <MaterialCommunityIcons
                    name={c.type === "reel" ? "play-circle" : c.type === "story" ? "circle-slice-8" : "image"}
                    size={20}
                    color={c.type === "reel" ? "#E1306C" : c.type === "story" ? "#833AB4" : "#F7931A"}
                  />
                </View>
                <View style={styles.contentInfo}>
                  <Text style={[styles.contentTitle, { color: colors.foreground }]}>{c.title}</Text>
                  <Text style={[styles.contentStats, { color: colors.mutedForeground }]}>{c.views} views · {c.engagement} engagement</Text>
                </View>
                <Text style={[styles.contentEarnings, { color: "#4CAF50" }]}>+${c.earnings.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === "payouts" && (
          <View style={styles.payoutHistory}>
            <View style={[styles.payoutSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payout Methods</Text>
              {[
                { label: "Crypto (USDC/SOL)", icon: "logo-bitcoin", color: "#F7931A", enabled: true },
                { label: "PayPal", icon: "logo-paypal", color: "#003087", enabled: true },
                { label: "Bank Transfer", icon: "card-outline", color: "#4CAF50", enabled: false },
                { label: "Venmo", icon: "phone-portrait-outline", color: "#008CFF", enabled: false },
              ].map((m) => (
                <View key={m.label} style={[styles.methodRow, { borderTopColor: colors.border }]}>
                  <Ionicons name={m.icon as "logo-bitcoin"} size={22} color={m.color} />
                  <Text style={[styles.methodLabel, { color: colors.foreground }]}>{m.label}</Text>
                  <View style={[styles.methodBadge, { backgroundColor: m.enabled ? "#4CAF5020" : colors.muted }]}>
                    <Text style={[styles.methodBadgeText, { color: m.enabled ? "#4CAF50" : colors.mutedForeground }]}>
                      {m.enabled ? "Active" : "Add"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payout History</Text>
              {[
                { date: "Apr 7", amount: 45.20, method: "USDC" },
                { date: "Mar 31", amount: 38.90, method: "USDC" },
                { date: "Mar 24", amount: 52.10, method: "PayPal" },
                { date: "Mar 17", amount: 29.40, method: "USDC" },
              ].map((p, i) => (
                <View key={i} style={[styles.historyRow, { borderTopColor: colors.border }]}>
                  <View>
                    <Text style={[styles.historyDate, { color: colors.foreground }]}>{p.date}</Text>
                    <Text style={[styles.historyMethod, { color: colors.mutedForeground }]}>via {p.method}</Text>
                  </View>
                  <Text style={[styles.historyAmount, { color: "#4CAF50" }]}>${p.amount.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 0 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  earningsOverview: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  earningMain: {},
  earningLabel: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  earningAmount: { color: "#fff", fontSize: 34, fontWeight: "800", letterSpacing: -1 },
  earningChange: { color: "#4CAF50", fontSize: 13, marginTop: 2 },
  payoutBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#4CAF50", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 },
  payoutBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  tabs: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.2)" },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: "#fff" },
  tabText: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 10 },
  statCard: { width: (width - 44) / 2, borderRadius: 14, padding: 14, borderWidth: 1, gap: 4 },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 12 },
  section: { margin: 12, marginTop: 0, borderRadius: 16, padding: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 14 },
  chartContainer: { flexDirection: "row", alignItems: "flex-end", height: 120, gap: 6 },
  chartBar: { flex: 1, alignItems: "center", height: "100%" },
  barWrapper: { flex: 1, width: "100%", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 6 },
  barLabel: { fontSize: 10, marginTop: 4 },
  payoutRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  payoutAmount: { fontSize: 20, fontWeight: "800" },
  payoutSub: { fontSize: 12, marginTop: 2 },
  inlineBtn: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  inlineBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  contentList: { padding: 12 },
  listTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  contentRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  contentType: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  contentInfo: { flex: 1 },
  contentTitle: { fontSize: 14, fontWeight: "600" },
  contentStats: { fontSize: 12, marginTop: 2 },
  contentEarnings: { fontSize: 14, fontWeight: "700" },
  payoutHistory: { padding: 12, gap: 12 },
  payoutSummary: { borderRadius: 16, padding: 16, borderWidth: 1 },
  methodRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
  methodLabel: { flex: 1, fontSize: 14, fontWeight: "500" },
  methodBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  methodBadgeText: { fontSize: 12, fontWeight: "600" },
  historyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
  historyDate: { fontSize: 14, fontWeight: "600" },
  historyMethod: { fontSize: 12, marginTop: 2 },
  historyAmount: { fontSize: 16, fontWeight: "700" },
});
