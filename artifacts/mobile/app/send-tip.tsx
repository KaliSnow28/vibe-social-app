import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePayments } from "@/context/PaymentsContext";
import { useColors } from "@/hooks/useColors";

const PRESET_AMOUNTS = [1, 5, 10, 20];

export default function SendTipScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    creatorId: string;
    creatorName: string;
    postId?: string;
  }>();
  const { sendTip } = usePayments();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const getAmount = () => {
    if (selectedAmount !== null) return selectedAmount;
    const custom = parseFloat(customAmount);
    return isNaN(custom) ? null : custom;
  };

  const handleSend = async () => {
    const amount = getAmount();
    if (!amount || amount < 0.5) {
      return Alert.alert("Error", "Minimum tip is $0.50");
    }
    setSending(true);
    try {
      const result = await sendTip(
        params.creatorId,
        amount,
        params.postId,
        message.trim() || undefined
      );
      if (result.approvalUrl) {
        await Linking.openURL(result.approvalUrl);
        Alert.alert("Tip Pending", "Complete payment via PayPal, then return here.");
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to send tip");
    } finally {
      setSending(false);
    }
  };

  const amount = getAmount();
  const s = styles(colors);

  if (success) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.successContainer}>
          <View style={s.successIcon}>
            <Ionicons name="heart" size={48} color={colors.primary} />
          </View>
          <Text style={s.successTitle}>Tip Sent!</Text>
          <Text style={s.successSubtitle}>
            ${amount?.toFixed(2)} sent to {params.creatorName ?? "creator"}
          </Text>
          <Pressable style={s.doneBtn} onPress={() => router.back()}>
            <Text style={s.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={s.headerTitle}>
          Send Tip to {params.creatorName ?? "Creator"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.content}>
        <Text style={s.sectionLabel}>Choose an amount</Text>
        <View style={s.presetRow}>
          {PRESET_AMOUNTS.map((amt) => (
            <Pressable
              key={amt}
              style={[
                s.presetBtn,
                selectedAmount === amt && s.presetBtnActive,
              ]}
              onPress={() => {
                setSelectedAmount(amt);
                setCustomAmount("");
              }}
            >
              <Text
                style={[
                  s.presetBtnText,
                  selectedAmount === amt && s.presetBtnTextActive,
                ]}
              >
                ${amt}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={s.orLabel}>or enter custom amount</Text>
        <View style={s.customRow}>
          <Text style={s.currencySymbol}>$</Text>
          <TextInput
            style={s.customInput}
            value={customAmount}
            onChangeText={(val) => {
              setCustomAmount(val);
              setSelectedAmount(null);
            }}
            placeholder="0.00"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
          />
        </View>

        <Text style={s.sectionLabel}>Add a message (optional)</Text>
        <TextInput
          style={s.messageInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Say something nice..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={3}
          maxLength={200}
        />

        {amount && amount >= 0.5 && (
          <View style={s.summaryCard}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={s.summaryText}>
              Sending ${amount.toFixed(2)} tip via PayPal
            </Text>
          </View>
        )}
      </View>

      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={[
            s.sendBtn,
            (!amount || amount < 0.5 || sending) && { opacity: 0.4 },
          ]}
          onPress={handleSend}
          disabled={!amount || amount < 0.5 || sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="heart" size={18} color="#fff" />
              <Text style={s.sendBtnText}>
                Send ${amount ? amount.toFixed(2) : "0.00"} Tip
              </Text>
            </>
          )}
        </Pressable>
        <Text style={s.footerNote}>Powered by PayPal · Secure payment</Text>
      </View>
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
    content: { flex: 1, padding: 20 },
    sectionLabel: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginBottom: 12,
      marginTop: 8,
    },
    presetRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    presetBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: colors.radius,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      backgroundColor: colors.card,
    },
    presetBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
    presetBtnText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    presetBtnTextActive: { color: colors.primary },
    orLabel: {
      textAlign: "center",
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginBottom: 12,
    },
    customRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.input,
      borderRadius: colors.radius,
      paddingHorizontal: 14,
      marginBottom: 20,
    },
    currencySymbol: {
      fontSize: 20,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginRight: 4,
    },
    customInput: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 20,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    messageInput: {
      backgroundColor: colors.input,
      borderRadius: colors.radius,
      padding: 14,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      minHeight: 80,
      textAlignVertical: "top",
    },
    summaryCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 16,
      padding: 12,
      backgroundColor: colors.primary + "15",
      borderRadius: colors.radius,
    },
    summaryText: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    footer: {
      padding: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      gap: 8,
    },
    sendBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    sendBtnText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
    },
    footerNote: {
      textAlign: "center",
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    successContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
    },
    successIcon: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    successTitle: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 8,
    },
    successSubtitle: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 32,
    },
    doneBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingHorizontal: 40,
      paddingVertical: 14,
    },
    doneBtnText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
    },
  });
