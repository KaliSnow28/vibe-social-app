import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePayments, type SubscriptionTier } from "@/context/PaymentsContext";
import { useColors } from "@/hooks/useColors";

export default function SubscribeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ creatorId: string; creatorName: string }>();
  const { tiers, loadTiers, subscribe } = usePayments();
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (params.creatorId) {
      loadTiers(params.creatorId).finally(() => setLoading(false));
    }
  }, [params.creatorId]);

  const handleSubscribe = async () => {
    if (!selectedTier) return Alert.alert("Error", "Please select a tier");
    setSubscribing(true);
    try {
      const result = await subscribe(params.creatorId, selectedTier.id, billingCycle);
      if (result.approvalUrl) {
        await Linking.openURL(result.approvalUrl);
        Alert.alert("Subscription Pending", "Complete payment via PayPal, then return here.");
      } else {
        Alert.alert("Subscribed!", `You're now subscribed to ${selectedTier.name}!`, [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to subscribe");
    } finally {
      setSubscribing(false);
    }
  };

  const getPrice = (tier: SubscriptionTier) => {
    if (billingCycle === "annual" && tier.annualPrice) {
      return `$${parseFloat(tier.annualPrice).toFixed(2)}/year`;
    }
    return `$${parseFloat(tier.monthlyPrice).toFixed(2)}/month`;
  };

  const getSavings = (tier: SubscriptionTier) => {
    if (!tier.annualPrice) return null;
    const monthly = parseFloat(tier.monthlyPrice) * 12;
    const annual = parseFloat(tier.annualPrice);
    const pct = Math.round(((monthly - annual) / monthly) * 100);
    return pct > 0 ? `Save ${pct}%` : null;
  };

  const s = styles(colors);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={s.headerTitle}>
          Subscribe to {params.creatorName ?? "Creator"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : tiers.length === 0 ? (
        <View style={s.emptyState}>
          <Ionicons name="star-outline" size={48} color={colors.mutedForeground} />
          <Text style={s.emptyTitle}>No subscription tiers</Text>
          <Text style={s.emptySubtitle}>
            This creator hasn't set up subscription tiers yet.
          </Text>
        </View>
      ) : (
        <>
          <View style={s.billingToggle}>
            <Pressable
              style={[s.toggleBtn, billingCycle === "monthly" && s.toggleActive]}
              onPress={() => setBillingCycle("monthly")}
            >
              <Text style={[s.toggleText, billingCycle === "monthly" && s.toggleActiveText]}>
                Monthly
              </Text>
            </Pressable>
            <Pressable
              style={[s.toggleBtn, billingCycle === "annual" && s.toggleActive]}
              onPress={() => setBillingCycle("annual")}
            >
              <Text style={[s.toggleText, billingCycle === "annual" && s.toggleActiveText]}>
                Annual
              </Text>
              <View style={s.savingsBadge}>
                <Text style={s.savingsText}>Save more</Text>
              </View>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={s.tierList}>
            {tiers.map((tier) => {
              const isSelected = selectedTier?.id === tier.id;
              const savings = getSavings(tier);
              return (
                <Pressable
                  key={tier.id}
                  style={[s.tierCard, isSelected && s.tierCardSelected]}
                  onPress={() => setSelectedTier(tier)}
                >
                  <View style={s.tierCardHeader}>
                    <View style={s.tierCardLeft}>
                      <Text style={s.tierCardName}>{tier.name}</Text>
                      <Text style={s.tierCardPrice}>{getPrice(tier)}</Text>
                    </View>
                    <View
                      style={[
                        s.radioOuter,
                        isSelected && { borderColor: colors.primary },
                      ]}
                    >
                      {isSelected && <View style={s.radioInner} />}
                    </View>
                  </View>
                  <Text style={s.tierCardDesc}>{tier.description}</Text>
                  <Text style={s.tierCardPerks}>{tier.perks}</Text>
                  {billingCycle === "annual" && savings && (
                    <View style={s.savingsTag}>
                      <Text style={s.savingsTagText}>{savings}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
            <View style={{ height: 120 }} />
          </ScrollView>

          <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
            {selectedTier && (
              <Text style={s.footerSummary}>
                {selectedTier.name} · {getPrice(selectedTier)}
              </Text>
            )}
            <Pressable
              style={[s.subscribeBtn, (!selectedTier || subscribing) && { opacity: 0.5 }]}
              onPress={handleSubscribe}
              disabled={!selectedTier || subscribing}
            >
              {subscribing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.subscribeBtnText}>
                  {selectedTier ? `Subscribe · ${getPrice(selectedTier)}` : "Select a Tier"}
                </Text>
              )}
            </Pressable>
            <Text style={s.footerNote}>
              Powered by PayPal · Cancel anytime
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    backBtn: { width: 40, height: 40, justifyContent: "center" },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    billingToggle: {
      flexDirection: "row",
      margin: 16,
      backgroundColor: colors.muted,
      borderRadius: 10,
      padding: 3,
    },
    toggleBtn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },
    toggleActive: { backgroundColor: colors.background },
    toggleText: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    toggleActiveText: { color: colors.foreground },
    savingsBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    savingsText: { color: "#fff", fontSize: 10, fontFamily: "Inter_600SemiBold" },
    tierList: { flex: 1, paddingHorizontal: 16 },
    tierCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: "transparent",
    },
    tierCardSelected: { borderColor: colors.primary },
    tierCardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    tierCardLeft: { flex: 1 },
    tierCardName: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    tierCardPrice: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
      marginTop: 2,
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
    tierCardDesc: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginBottom: 6,
    },
    tierCardPerks: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    savingsTag: {
      marginTop: 8,
      alignSelf: "flex-start",
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    savingsTagText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    emptyTitle: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    emptySubtitle: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      maxWidth: 260,
    },
    footer: {
      padding: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
      gap: 8,
    },
    footerSummary: {
      textAlign: "center",
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    subscribeBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 14,
      alignItems: "center",
    },
    subscribeBtnText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
    },
    footerNote: {
      textAlign: "center",
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
  });
