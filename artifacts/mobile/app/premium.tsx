import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SUBSCRIPTION_TIERS, useWallet } from "@/context/WalletContext";
import { useColors } from "@/hooks/useColors";

export default function PremiumScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeTier, subscribeTier } = useWallet();
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;
  const [selected, setSelected] = useState(activeTier ?? "free");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const handleSubscribe = () => {
    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === selected);
    if (!tier) return;
    if (selected === "free") {
      Alert.alert("Free Plan", "You are on the Free plan.");
      return;
    }
    subscribeTier(selected);
    Alert.alert("Subscribed!", `Welcome to ${tier.name}! 🎉\nYour card has been charged $${tier.price}/mo.`);
  };

  const selectedTier = SUBSCRIPTION_TIERS.find((t) => t.id === selected);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#1a0533", "#0d1a3a"]} style={[styles.header, { paddingTop: headerTop + 8 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Vibe Premium</Text>
          <View style={{ width: 22 }} />
        </View>
        <Text style={styles.headerSub}>Unlock the full Vibe experience</Text>

        <View style={styles.billingToggle}>
          {(["monthly", "annual"] as const).map((b) => (
            <Pressable
              key={b}
              onPress={() => setBilling(b)}
              style={[styles.billingBtn, billing === b && styles.billingBtnActive]}
            >
              <Text style={[styles.billingText, billing === b && styles.billingTextActive]}>
                {b === "annual" ? "Annual (Save 20%)" : "Monthly"}
              </Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {SUBSCRIPTION_TIERS.map((tier) => {
          const isActive = activeTier === tier.id;
          const isSelected = selected === tier.id;
          const price = billing === "annual" && tier.price > 0 ? +(tier.price * 0.8).toFixed(2) : tier.price;
          return (
            <Pressable
              key={tier.id}
              onPress={() => setSelected(tier.id)}
              style={[
                styles.tierCard,
                {
                  borderColor: isSelected ? tier.color : colors.border,
                  backgroundColor: isSelected ? tier.color + "12" : colors.card,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              {tier.popular && (
                <View style={[styles.popularBadge, { backgroundColor: tier.color }]}>
                  <Text style={styles.popularText}>⭐ MOST POPULAR</Text>
                </View>
              )}
              {isActive && (
                <View style={[styles.activeBadge, { backgroundColor: "#4CAF50" }]}>
                  <Text style={styles.popularText}>✓ CURRENT PLAN</Text>
                </View>
              )}
              <View style={styles.tierHeader}>
                <View>
                  <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
                  <View style={styles.tierPriceRow}>
                    {tier.price === 0 ? (
                      <Text style={[styles.tierPrice, { color: colors.foreground }]}>Free</Text>
                    ) : (
                      <>
                        <Text style={[styles.tierPrice, { color: colors.foreground }]}>${price}</Text>
                        <Text style={[styles.tierPricePer, { color: colors.mutedForeground }]}>/mo</Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={[styles.tierCheck, { borderColor: isSelected ? tier.color : colors.border, backgroundColor: isSelected ? tier.color : "transparent" }]}>
                  {isSelected && <Feather name="check" size={14} color="#fff" />}
                </View>
              </View>
              <View style={styles.perksList}>
                {tier.perks.map((perk) => (
                  <View key={perk} style={styles.perkRow}>
                    <Ionicons name="checkmark-circle" size={16} color={tier.color} />
                    <Text style={[styles.perkText, { color: colors.foreground }]}>{perk}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}

        <View style={[styles.cryptoInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="logo-bitcoin" size={24} color="#F7931A" />
          <View style={styles.cryptoInfoText}>
            <Text style={[styles.cryptoInfoTitle, { color: colors.foreground }]}>Pay with Crypto</Text>
            <Text style={[styles.cryptoInfoSub, { color: colors.mutedForeground }]}>Accept BTC, ETH, USDC, SOL. Get 5% bonus on crypto payments.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: isWeb ? 34 : insets.bottom + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <View style={styles.footerInfo}>
          <Text style={[styles.footerTitle, { color: colors.foreground }]}>{selectedTier?.name}</Text>
          {selectedTier && selectedTier.price > 0 && (
            <Text style={[styles.footerPrice, { color: colors.mutedForeground }]}>
              ${billing === "annual" ? +(selectedTier.price * 0.8).toFixed(2) : selectedTier.price}/month
            </Text>
          )}
        </View>
        <Pressable
          style={[styles.subscribeBtn, { backgroundColor: selectedTier?.color ?? colors.primary }]}
          onPress={handleSubscribe}
        >
          <Text style={styles.subscribeBtnText}>
            {activeTier === selected ? "Current Plan" : selected === "free" ? "Downgrade to Free" : "Subscribe Now"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 14, textAlign: "center", marginBottom: 16 },
  billingToggle: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 3, gap: 3 },
  billingBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  billingBtnActive: { backgroundColor: "#fff" },
  billingText: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" },
  billingTextActive: { color: "#1a0533" },
  tierCard: { borderRadius: 18, padding: 18, marginBottom: 12, position: "relative", overflow: "hidden" },
  popularBadge: { position: "absolute", top: 0, right: 0, paddingHorizontal: 12, paddingVertical: 5, borderBottomLeftRadius: 12 },
  activeBadge: { position: "absolute", top: 0, left: 0, paddingHorizontal: 12, paddingVertical: 5, borderBottomRightRadius: 12 },
  popularText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  tierHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, marginTop: 8 },
  tierName: { fontSize: 20, fontWeight: "800" },
  tierPriceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 4 },
  tierPrice: { fontSize: 28, fontWeight: "800" },
  tierPricePer: { fontSize: 13, marginLeft: 2 },
  tierCheck: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  perksList: { gap: 8 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  perkText: { fontSize: 14 },
  cryptoInfo: { flexDirection: "row", gap: 12, padding: 16, borderRadius: 14, borderWidth: 1, alignItems: "center", marginTop: 8 },
  cryptoInfoText: { flex: 1 },
  cryptoInfoTitle: { fontWeight: "700", fontSize: 15 },
  cryptoInfoSub: { fontSize: 13, marginTop: 2 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, gap: 12 },
  footerInfo: { flex: 1 },
  footerTitle: { fontWeight: "700", fontSize: 16 },
  footerPrice: { fontSize: 13, marginTop: 2 },
  subscribeBtn: { borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
  subscribeBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
