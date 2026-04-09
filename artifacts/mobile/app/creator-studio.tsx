import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { usePayments } from "@/context/PaymentsContext";
import { useColors } from "@/hooks/useColors";

export default function CreatorStudioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { me } = useApp();
  const {
    tiers,
    earnings,
    loadTiers,
    deleteTier,
    loadEarnings,
    toggleDailyPayout,
  } = usePayments();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadTiers(me.id), loadEarnings(me.id)]);
      setLoading(false);
    };
    init();
  }, [me.id]);

  const handleDeleteTier = (tierId: number, tierName: string) => {
    Alert.alert("Delete Tier", `Remove "${tierName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTier(tierId);
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  const handleToggleDailyPayout = async (val: boolean) => {
    try {
      await toggleDailyPayout(me.id, val);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const s = styles(colors);

  if (loading) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={s.headerTitle}>Creator Studio</Text>
          <View style={{ width: 40 }} />
        </View>
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={s.headerTitle}>Creator Studio</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {earnings && (
          <View style={s.earningsCard}>
            <Text style={s.earningsTitle}>Quick Overview</Text>
            <View style={s.earningsRow}>
              <View style={s.earningsStat}>
                <Text style={s.earningsAmount}>
                  ${parseFloat(earnings.availableBalance).toFixed(2)}
                </Text>
                <Text style={s.earningsLabel}>Available</Text>
              </View>
              <View style={s.earningsDivider} />
              <View style={s.earningsStat}>
                <Text style={s.earningsAmount}>
                  ${parseFloat(earnings.totalEarned).toFixed(2)}
                </Text>
                <Text style={s.earningsLabel}>Total Earned</Text>
              </View>
              <View style={s.earningsDivider} />
              <View style={s.earningsStat}>
                <Text style={s.earningsAmount}>
                  ${parseFloat(earnings.totalPaidOut).toFixed(2)}
                </Text>
                <Text style={s.earningsLabel}>Paid Out</Text>
              </View>
            </View>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Monetization</Text>
          {[
            {
              icon: "bar-chart" as const,
              label: "Earnings Dashboard",
              subtitle: "View balance & stats",
              route: "/earnings-dashboard" as const,
            },
            {
              icon: "credit-card" as const,
              label: "Payout Accounts",
              subtitle: "PayPal, Venmo, Chime",
              route: "/payout-accounts" as const,
            },
            {
              icon: "clock" as const,
              label: "Payout History",
              subtitle: "Transaction history",
              route: "/payout-history" as const,
            },
          ].map((item) => (
            <Pressable
              key={item.label}
              style={s.menuRow}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[s.menuIcon, { backgroundColor: colors.primary + "20" }]}>
                <Feather name={item.icon} size={18} color={colors.primary} />
              </View>
              <View style={s.menuText}>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Text style={s.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>

        {earnings && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Auto Payouts</Text>
            <View style={[s.card, { flexDirection: "row", alignItems: "center" }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>Daily Payout</Text>
                <Text style={s.cardSubtitle}>
                  Auto-send balance over ${parseFloat(earnings.minimumPayoutThreshold).toFixed(0)} each day
                </Text>
              </View>
              <Switch
                value={earnings.dailyPayoutEnabled}
                onValueChange={handleToggleDailyPayout}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        )}

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Subscription Tiers</Text>
            <Pressable
              style={s.addBtn}
              onPress={() => router.push("/create-tier" as any)}
            >
              <Feather name="plus" size={16} color={colors.primaryForeground} />
              <Text style={s.addBtnText}>Add Tier</Text>
            </Pressable>
          </View>

          {tiers.length === 0 ? (
            <View style={s.emptyState}>
              <Feather name="star" size={32} color={colors.mutedForeground} />
              <Text style={s.emptyTitle}>No subscription tiers yet</Text>
              <Text style={s.emptySubtitle}>
                Create tiers to let fans support you monthly
              </Text>
            </View>
          ) : (
            tiers.map((tier) => (
              <View key={tier.id} style={s.tierCard}>
                <View style={s.tierHeader}>
                  <Text style={s.tierName}>{tier.name}</Text>
                  <Pressable
                    onPress={() => handleDeleteTier(tier.id, tier.name)}
                    style={s.tierDelete}
                  >
                    <Feather name="trash-2" size={16} color={colors.destructive} />
                  </Pressable>
                </View>
                <Text style={s.tierPrice}>
                  ${parseFloat(tier.monthlyPrice).toFixed(2)}/mo
                  {tier.annualPrice
                    ? ` · $${parseFloat(tier.annualPrice).toFixed(2)}/yr`
                    : ""}
                </Text>
                <Text style={s.tierDescription}>{tier.description}</Text>
                <Text style={s.tierPerks}>{tier.perks}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
      fontSize: 17,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    earningsCard: {
      margin: 16,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      padding: 16,
    },
    earningsTitle: {
      color: "#fff",
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      marginBottom: 12,
      opacity: 0.8,
    },
    earningsRow: { flexDirection: "row", alignItems: "center" },
    earningsStat: { flex: 1, alignItems: "center" },
    earningsAmount: {
      color: "#fff",
      fontSize: 18,
      fontFamily: "Inter_700Bold",
    },
    earningsLabel: {
      color: "#fff",
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      opacity: 0.75,
      marginTop: 2,
    },
    earningsDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.3)" },
    section: { marginBottom: 8 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    sectionTitle: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      gap: 4,
    },
    addBtnText: {
      color: colors.primaryForeground,
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
    },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: colors.radius,
      padding: 14,
      gap: 12,
    },
    menuIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    menuText: { flex: 1 },
    menuLabel: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    menuSubtitle: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 1,
    },
    card: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      borderRadius: colors.radius,
      padding: 16,
    },
    cardTitle: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    cardSubtitle: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 32,
      marginHorizontal: 16,
    },
    emptyTitle: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginTop: 12,
    },
    emptySubtitle: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 6,
      textAlign: "center",
      maxWidth: 240,
    },
    tierCard: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginBottom: 10,
      borderRadius: colors.radius,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tierHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    tierName: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    tierDelete: { padding: 4 },
    tierPrice: {
      fontSize: 14,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
      marginBottom: 4,
    },
    tierDescription: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      marginBottom: 4,
    },
    tierPerks: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
  });
