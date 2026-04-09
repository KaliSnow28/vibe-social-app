import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { usePayments, type PayoutRecord } from "@/context/PaymentsContext";
import { useColors } from "@/hooks/useColors";

const STATUS_CONFIG = {
  pending: { color: "#f59e0b", icon: "clock" as const, label: "Pending" },
  processing: { color: "#3b82f6", icon: "loader" as const, label: "Processing" },
  completed: { color: "#10b981", icon: "check-circle" as const, label: "Completed" },
  failed: { color: "#ef4444", icon: "x-circle" as const, label: "Failed" },
};

const METHOD_LABELS = {
  paypal: "PayPal",
  venmo: "Venmo",
  chime: "Chime",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PayoutHistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { me } = useApp();
  const { payoutHistory, loadPayoutHistory } = usePayments();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPayoutHistory(me.id).finally(() => setLoading(false));
  }, [me.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayoutHistory(me.id);
    setRefreshing(false);
  };

  const s = styles(colors);

  const renderItem = ({ item }: { item: PayoutRecord }) => {
    const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
    return (
      <View style={s.item}>
        <View style={[s.statusIcon, { backgroundColor: cfg.color + "20" }]}>
          <Feather name={cfg.icon} size={20} color={cfg.color} />
        </View>
        <View style={s.itemInfo}>
          <View style={s.itemTop}>
            <Text style={s.itemAmount}>${parseFloat(item.amount).toFixed(2)}</Text>
            <View style={[s.statusBadge, { backgroundColor: cfg.color + "20" }]}>
              <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
          <Text style={s.itemMethod}>
            {METHOD_LABELS[item.method]} · {item.accountIdentifier}
          </Text>
          <Text style={s.itemDate}>{formatDate(item.initiatedAt)}</Text>
          {item.failureReason && (
            <Text style={s.failureReason}>{item.failureReason}</Text>
          )}
          {item.completedAt && (
            <Text style={s.completedAt}>
              Completed {formatDate(item.completedAt)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={s.headerTitle}>Payout History</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : payoutHistory.length === 0 ? (
        <View style={s.emptyState}>
          <Feather name="inbox" size={48} color={colors.mutedForeground} />
          <Text style={s.emptyTitle}>No payouts yet</Text>
          <Text style={s.emptySubtitle}>
            Your payout transactions will appear here
          </Text>
          <Pressable
            style={s.goToEarningsBtn}
            onPress={() => router.push("/earnings-dashboard" as any)}
          >
            <Text style={s.goToEarningsBtnText}>Go to Earnings</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={payoutHistory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={s.listHeader}>{payoutHistory.length} payout{payoutHistory.length !== 1 ? "s" : ""}</Text>
          }
          ListFooterComponent={<View style={{ height: 40 }} />}
        />
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
      fontSize: 17,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    list: { padding: 16 },
    listHeader: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginBottom: 12,
    },
    item: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      marginBottom: 10,
      gap: 12,
      alignItems: "flex-start",
    },
    statusIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    itemInfo: { flex: 1 },
    itemTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    itemAmount: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    statusText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
    },
    itemMethod: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginBottom: 2,
    },
    itemDate: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    failureReason: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "#ef4444",
      marginTop: 4,
    },
    completedAt: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: "#10b981",
      marginTop: 2,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 32,
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
    },
    goToEarningsBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingHorizontal: 24,
      paddingVertical: 12,
      marginTop: 8,
    },
    goToEarningsBtnText: {
      color: colors.primaryForeground,
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
    },
  });
