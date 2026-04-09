import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
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

export default function EarningsDashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { me } = useApp();
  const {
    earnings,
    payoutAccounts,
    loadEarnings,
    loadPayoutAccounts,
    toggleDailyPayout,
    triggerPayout,
    loadingEarnings,
  } = usePayments();

  const [refreshing, setRefreshing] = useState(false);
  const [payingOut, setPayingOut] = useState(false);

  const load = async () => {
    await Promise.all([loadEarnings(me.id), loadPayoutAccounts(me.id)]);
  };

  useEffect(() => {
    load();
  }, [me.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleToggleDailyPayout = async (val: boolean) => {
    try {
      await toggleDailyPayout(me.id, val);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleManualPayout = async () => {
    if (!earnings) return;
    const available = parseFloat(earnings.availableBalance);
    const threshold = parseFloat(earnings.minimumPayoutThreshold);

    if (available < threshold) {
      return Alert.alert(
        "Insufficient Balance",
        `You need at least $${threshold.toFixed(2)} to initiate a payout. Your balance is $${available.toFixed(2)}.`
      );
    }

    const primary = payoutAccounts.find((a) => a.isPrimary);
    if (!primary) {
      return Alert.alert("No Payout Account", "Please add a primary payout account first.", [
        {
          text: "Add Account",
          onPress: () => router.push("/payout-accounts" as any),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    }

    Alert.alert(
      "Confirm Payout",
      `Send $${available.toFixed(2)} to ${primary.displayName} (${primary.method.toUpperCase()})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setPayingOut(true);
            try {
              await triggerPayout(me.id);
              await load();
              Alert.alert("Payout Initiated", "Your payout is being processed!");
            } catch (err: any) {
              Alert.alert("Error", err.message);
            } finally {
              setPayingOut(false);
            }
          },
        },
      ]
    );
  };

  const s = styles(colors);
  const primaryAccount = payoutAccounts.find((a) => a.isPrimary);

  if (loadingEarnings && !earnings) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={s.headerTitle}>Earnings Dashboard</Text>
          <View style={{ width: 40 }} />
        </View>
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      </View>
    );
  }

  const totalEarned = parseFloat(earnings?.totalEarned ?? "0");
  const available = parseFloat(earnings?.availableBalance ?? "0");
  const pending = parseFloat(earnings?.pendingBalance ?? "0");
  const totalPaidOut = parseFloat(earnings?.totalPaidOut ?? "0");

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={s.headerTitle}>Earnings Dashboard</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>Available Balance</Text>
          <Text style={s.balanceAmount}>${available.toFixed(2)}</Text>
          <Pressable
            style={[s.payoutBtn, (payingOut || available < 10) && { opacity: 0.5 }]}
            onPress={handleManualPayout}
            disabled={payingOut || available < parseFloat(earnings?.minimumPayoutThreshold ?? "10")}
          >
            {payingOut ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="send" size={16} color="#fff" />
                <Text style={s.payoutBtnText}>Withdraw Now</Text>
              </>
            )}
          </Pressable>
          {available < parseFloat(earnings?.minimumPayoutThreshold ?? "10") && (
            <Text style={s.minThresholdNote}>
              Min payout: ${parseFloat(earnings?.minimumPayoutThreshold ?? "10").toFixed(2)}
            </Text>
          )}
        </View>

        <View style={s.statsGrid}>
          {[
            { label: "Total Earned", value: totalEarned, icon: "trending-up" as const, color: colors.primary },
            { label: "Pending", value: pending, icon: "clock" as const, color: "#f59e0b" },
            { label: "Total Paid Out", value: totalPaidOut, icon: "check-circle" as const, color: "#10b981" },
          ].map((stat) => (
            <View key={stat.label} style={s.statCard}>
              <View style={[s.statIcon, { backgroundColor: stat.color + "20" }]}>
                <Feather name={stat.icon} size={18} color={stat.color} />
              </View>
              <Text style={s.statAmount}>${stat.value.toFixed(2)}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Auto Payouts</Text>
          <View style={s.settingCard}>
            <View style={s.settingInfo}>
              <Text style={s.settingTitle}>Daily Payout</Text>
              <Text style={s.settingSubtitle}>
                Automatically send your balance each day when it exceeds $
                {parseFloat(earnings?.minimumPayoutThreshold ?? "10").toFixed(0)}
              </Text>
            </View>
            <Switch
              value={earnings?.dailyPayoutEnabled ?? false}
              onValueChange={handleToggleDailyPayout}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {earnings?.dailyPayoutEnabled && !primaryAccount && (
            <Pressable
              style={s.warningCard}
              onPress={() => router.push("/payout-accounts" as any)}
            >
              <Ionicons name="warning-outline" size={18} color="#f59e0b" />
              <Text style={s.warningText}>
                Add a primary payout account to enable automatic payouts
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#f59e0b" />
            </Pressable>
          )}

          {primaryAccount && (
            <View style={s.primaryAccountCard}>
              <Feather name="check-circle" size={16} color="#10b981" />
              <View style={{ flex: 1 }}>
                <Text style={s.primaryAccountTitle}>Primary Account</Text>
                <Text style={s.primaryAccountSub}>
                  {primaryAccount.displayName} · {primaryAccount.method.toUpperCase()}
                </Text>
              </View>
              <Pressable onPress={() => router.push("/payout-accounts" as any)}>
                <Text style={s.changeText}>Change</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
          {[
            {
              icon: "credit-card" as const,
              label: "Payout Accounts",
              subtitle: "Manage PayPal, Venmo, Chime",
              route: "/payout-accounts",
            },
            {
              icon: "list" as const,
              label: "Payout History",
              subtitle: "View all transactions",
              route: "/payout-history",
            },
            {
              icon: "star" as const,
              label: "Subscription Tiers",
              subtitle: "Manage creator tiers",
              route: "/creator-studio",
            },
          ].map((item) => (
            <Pressable
              key={item.label}
              style={s.menuRow}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[s.menuIcon, { backgroundColor: colors.primary + "15" }]}>
                <Feather name={item.icon} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Text style={s.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))}
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
    balanceCard: {
      margin: 16,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      padding: 24,
      alignItems: "center",
    },
    balanceLabel: {
      color: "rgba(255,255,255,0.7)",
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      marginBottom: 8,
    },
    balanceAmount: {
      color: "#fff",
      fontSize: 42,
      fontFamily: "Inter_700Bold",
      marginBottom: 20,
    },
    payoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "rgba(255,255,255,0.25)",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 24,
    },
    payoutBtnText: {
      color: "#fff",
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
    minThresholdNote: {
      color: "rgba(255,255,255,0.7)",
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      marginTop: 10,
    },
    statsGrid: {
      flexDirection: "row",
      paddingHorizontal: 16,
      gap: 10,
      marginBottom: 8,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 12,
      alignItems: "center",
      gap: 6,
    },
    statIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    statAmount: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    statLabel: {
      fontSize: 10,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    section: { marginBottom: 8 },
    sectionTitle: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    settingCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: colors.radius,
      padding: 16,
      gap: 12,
    },
    settingInfo: { flex: 1 },
    settingTitle: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    settingSubtitle: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    warningCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "#f59e0b20",
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: colors.radius,
      padding: 12,
    },
    warningText: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: "#f59e0b",
    },
    primaryAccountCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: "#10b98120",
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: colors.radius,
      padding: 12,
    },
    primaryAccountTitle: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    primaryAccountSub: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    changeText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
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
  });
