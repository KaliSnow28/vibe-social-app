import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
import { useApp } from "@/context/AppContext";
import { usePayments, type PayoutAccount } from "@/context/PaymentsContext";
import { useColors } from "@/hooks/useColors";

const METHOD_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  paypal: "dollar-sign",
  venmo: "credit-card",
  chime: "zap",
};

const METHOD_LABELS = {
  paypal: "PayPal",
  venmo: "Venmo",
  chime: "Chime",
};

const METHOD_COLORS = {
  paypal: "#003087",
  venmo: "#3D95CE",
  chime: "#00D532",
};

const METHOD_PLACEHOLDER = {
  paypal: "your@email.com",
  venmo: "@yourhandle",
  chime: "Account number or routing info",
};

export default function PayoutAccountsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { me } = useApp();
  const { payoutAccounts, loadPayoutAccounts, addPayoutAccount, deletePayoutAccount, setPrimaryAccount } =
    usePayments();

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [method, setMethod] = useState<"paypal" | "venmo" | "chime">("paypal");
  const [accountIdentifier, setAccountIdentifier] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPayoutAccounts(me.id).finally(() => setLoading(false));
  }, [me.id]);

  const resetForm = () => {
    setMethod("paypal");
    setAccountIdentifier("");
    setDisplayName("");
    setIsPrimary(payoutAccounts.length === 0);
  };

  const handleAdd = async () => {
    if (!accountIdentifier.trim()) {
      return Alert.alert("Error", "Account identifier is required");
    }
    if (!displayName.trim()) {
      return Alert.alert("Error", "Display name is required");
    }
    setSaving(true);
    try {
      await addPayoutAccount({
        userId: me.id,
        method,
        accountIdentifier: accountIdentifier.trim(),
        displayName: displayName.trim(),
        isPrimary: isPrimary || payoutAccounts.length === 0,
      });
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to add account");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (account: PayoutAccount) => {
    Alert.alert("Remove Account", `Remove ${account.displayName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePayoutAccount(account.id);
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  const handleSetPrimary = async (account: PayoutAccount) => {
    if (account.isPrimary) return;
    try {
      await setPrimaryAccount(account.id);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const s = styles(colors);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={s.headerTitle}>Payout Accounts</Text>
        <Pressable
          style={s.addBtn}
          onPress={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Feather name="plus" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={s.list}>
          <Text style={s.description}>
            Connect payout accounts to receive your earnings. Set one as primary for daily
            automatic payouts.
          </Text>

          {payoutAccounts.length === 0 ? (
            <View style={s.emptyState}>
              <Feather name="credit-card" size={40} color={colors.mutedForeground} />
              <Text style={s.emptyTitle}>No payout accounts</Text>
              <Text style={s.emptySubtitle}>
                Add a PayPal, Venmo, or Chime account to receive payouts
              </Text>
              <Pressable
                style={s.emptyAddBtn}
                onPress={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                <Text style={s.emptyAddBtnText}>Add Account</Text>
              </Pressable>
            </View>
          ) : (
            payoutAccounts.map((account) => (
              <View key={account.id} style={s.accountCard}>
                <View
                  style={[
                    s.methodBadge,
                    { backgroundColor: METHOD_COLORS[account.method] + "20" },
                  ]}
                >
                  <Feather
                    name={METHOD_ICONS[account.method]}
                    size={18}
                    color={METHOD_COLORS[account.method]}
                  />
                </View>
                <View style={s.accountInfo}>
                  <View style={s.accountNameRow}>
                    <Text style={s.accountName}>{account.displayName}</Text>
                    {account.isPrimary && (
                      <View style={s.primaryBadge}>
                        <Text style={s.primaryBadgeText}>Primary</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.accountMethod}>{METHOD_LABELS[account.method]}</Text>
                  <Text style={s.accountIdentifier}>{account.accountIdentifier}</Text>
                </View>
                <View style={s.accountActions}>
                  {!account.isPrimary && (
                    <Pressable
                      style={s.setPrimaryBtn}
                      onPress={() => handleSetPrimary(account)}
                    >
                      <Text style={s.setPrimaryBtnText}>Set Primary</Text>
                    </Pressable>
                  )}
                  <Pressable
                    style={s.deleteBtn}
                    onPress={() => handleDelete(account)}
                  >
                    <Feather name="trash-2" size={16} color={colors.destructive} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          style={[s.modal, { paddingTop: 20 }]}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={s.modalHeader}>
            <Pressable onPress={() => setShowModal(false)} style={s.backBtn}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </Pressable>
            <Text style={s.headerTitle}>Add Payout Account</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={s.modalContent}>
            <Text style={s.label}>Payment Method</Text>
            <View style={s.methodRow}>
              {(["paypal", "venmo", "chime"] as const).map((m) => (
                <Pressable
                  key={m}
                  style={[s.methodBtn, method === m && { borderColor: METHOD_COLORS[m] }]}
                  onPress={() => setMethod(m)}
                >
                  <Feather
                    name={METHOD_ICONS[m]}
                    size={20}
                    color={method === m ? METHOD_COLORS[m] : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      s.methodBtnText,
                      method === m && { color: METHOD_COLORS[m] },
                    ]}
                  >
                    {METHOD_LABELS[m]}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.label}>Display Name</Text>
            <TextInput
              style={s.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="e.g. My PayPal"
              placeholderTextColor={colors.mutedForeground}
            />

            <Text style={s.label}>
              {method === "paypal"
                ? "PayPal Email"
                : method === "venmo"
                ? "Venmo Handle"
                : "Chime Account Details"}
            </Text>
            <TextInput
              style={s.input}
              value={accountIdentifier}
              onChangeText={setAccountIdentifier}
              placeholder={METHOD_PLACEHOLDER[method]}
              placeholderTextColor={colors.mutedForeground}
              keyboardType={method === "paypal" ? "email-address" : "default"}
              autoCapitalize="none"
            />

            <Pressable
              style={s.primaryToggle}
              onPress={() => setIsPrimary(!isPrimary)}
            >
              <View
                style={[
                  s.checkbox,
                  isPrimary && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                {isPrimary && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={s.primaryToggleText}>Set as primary payout account</Text>
            </Pressable>

            <View style={s.methodNote}>
              <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
              <Text style={s.methodNoteText}>
                {method === "paypal"
                  ? "Funds will be sent directly to your PayPal account."
                  : method === "venmo"
                  ? "Venmo payouts are processed via PayPal to your linked Venmo handle."
                  : "Chime payouts are processed via bank transfer coordination."}
              </Text>
            </View>

            <Pressable
              style={[s.saveBtn, saving && { opacity: 0.5 }]}
              onPress={handleAdd}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.saveBtnText}>Add Account</Text>
              )}
            </Pressable>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
    addBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    list: { flex: 1 },
    description: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      padding: 16,
      lineHeight: 18,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 48,
      paddingHorizontal: 32,
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
    },
    emptyAddBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingHorizontal: 24,
      paddingVertical: 12,
      marginTop: 8,
    },
    emptyAddBtnText: {
      color: colors.primaryForeground,
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
    },
    accountCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginBottom: 10,
      borderRadius: colors.radius,
      padding: 14,
      gap: 12,
    },
    methodBadge: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    accountInfo: { flex: 1 },
    accountNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
    accountName: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    primaryBadge: {
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    primaryBadgeText: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
    accountMethod: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    accountIdentifier: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    accountActions: { alignItems: "flex-end", gap: 8 },
    setPrimaryBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
    },
    setPrimaryBtnText: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    deleteBtn: { padding: 4 },
    modal: { flex: 1, backgroundColor: colors.background },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    modalContent: { flex: 1, padding: 16 },
    label: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginBottom: 8,
      marginTop: 16,
    },
    methodRow: { flexDirection: "row", gap: 10 },
    methodBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 12,
      borderRadius: colors.radius,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    methodBtnText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
    },
    input: {
      backgroundColor: colors.input,
      borderRadius: colors.radius,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    primaryToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 20,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryToggleText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    methodNote: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 6,
      marginTop: 16,
      padding: 12,
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
    },
    methodNoteText: {
      flex: 1,
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 20,
    },
    saveBtnText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
    },
  });
