import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api-server/api`;

const PRESET_AMOUNTS = [1, 5, 10, 25, 50, 100];

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    type: string;
    creatorId: string;
    creatorName: string;
    postId: string;
    amount: string;
    title: string;
  }>();

  const [selectedAmount, setSelectedAmount] = useState(
    params.amount ? parseFloat(params.amount) : 5
  );
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [stripeAvailable, setStripeAvailable] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [success, setSuccess] = useState(false);

  const finalAmount = useCustom
    ? parseFloat(customAmount) || 0
    : selectedAmount;

  useEffect(() => {
    checkStripe();
  }, []);

  async function checkStripe() {
    try {
      const res = await fetch(`${API_BASE}/stripe/status`);
      const data = await res.json();
      setStripeAvailable(data.configured);
    } catch {
      setStripeAvailable(false);
    }
  }

  function formatCard(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  }

  async function handlePay() {
    if (finalAmount < 0.5) {
      Alert.alert("Minimum amount is $0.50");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Please enter the name on your card");
      return;
    }
    if (cardNumber.replace(/\s/g, "").length < 16) {
      Alert.alert("Please enter a valid card number");
      return;
    }
    if (expiry.length < 5) {
      Alert.alert("Please enter a valid expiry date");
      return;
    }
    if (cvc.length < 3) {
      Alert.alert("Please enter a valid CVC");
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        params.type === "tip" ? "/stripe/tip" : "/stripe/payment-intent";

      const body: Record<string, string> = {
        amount: finalAmount.toString(),
        donorId: "user_demo",
        creatorId: params.creatorId ?? "creator_demo",
        postId: params.postId ?? "",
        message,
      };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.error) {
        Alert.alert("Payment Error", data.error);
        return;
      }

      if (data.donationId && params.creatorId) {
        await fetch(`${API_BASE}/stripe/tip/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: data.paymentIntentId,
            donationId: data.donationId,
            creatorId: params.creatorId,
            amount: finalAmount.toString(),
          }),
        });
      }

      setSuccess(true);
    } catch (err) {
      Alert.alert("Error", "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View style={styles.successContainer}>
        <LinearGradient colors={["#E1306C", "#833AB4"]} style={styles.successGradient}>
          <Ionicons name="checkmark-circle" size={80} color="#fff" />
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            {params.type === "tip"
              ? `You sent $${finalAmount.toFixed(2)} to ${params.creatorName ?? "the creator"}`
              : `$${finalAmount.toFixed(2)} payment processed`}
          </Text>
          {message ? (
            <View style={styles.successMessage}>
              <Text style={styles.successMessageText}>"{message}"</Text>
            </View>
          ) : null}
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {params.title ?? (params.type === "tip" ? "Send a Tip" : "Payment")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {params.creatorName ? (
          <View style={styles.recipientCard}>
            <LinearGradient colors={["#E1306C22", "#833AB422"]} style={styles.recipientGradient}>
              <View style={styles.recipientAvatar}>
                <Text style={styles.recipientAvatarText}>
                  {params.creatorName[0]?.toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.recipientLabel}>Sending to</Text>
                <Text style={styles.recipientName}>{params.creatorName}</Text>
              </View>
            </LinearGradient>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Select Amount</Text>
        <View style={styles.amountGrid}>
          {PRESET_AMOUNTS.map((amt) => (
            <TouchableOpacity
              key={amt}
              style={[
                styles.amountChip,
                !useCustom && selectedAmount === amt && styles.amountChipSelected,
              ]}
              onPress={() => {
                setSelectedAmount(amt);
                setUseCustom(false);
              }}
            >
              <Text
                style={[
                  styles.amountChipText,
                  !useCustom && selectedAmount === amt && styles.amountChipTextSelected,
                ]}
              >
                ${amt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.customToggle, useCustom && styles.customToggleActive]}
          onPress={() => setUseCustom(!useCustom)}
        >
          <Ionicons
            name={useCustom ? "checkmark-circle" : "add-circle-outline"}
            size={18}
            color={useCustom ? "#E1306C" : "#888"}
          />
          <Text style={[styles.customToggleText, useCustom && { color: "#E1306C" }]}>
            Custom amount
          </Text>
        </TouchableOpacity>

        {useCustom && (
          <View style={styles.customInput}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.customInputField}
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#666"
              autoFocus
            />
          </View>
        )}

        {params.type === "tip" && (
          <>
            <Text style={styles.sectionTitle}>Add a Message (optional)</Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Say something nice..."
              placeholderTextColor="#666"
              multiline
              maxLength={150}
            />
          </>
        )}

        <Text style={styles.sectionTitle}>Card Details</Text>
        <View style={styles.cardForm}>
          <View style={styles.cardField}>
            <Ionicons name="person-outline" size={18} color="#888" style={styles.fieldIcon} />
            <TextInput
              style={styles.fieldInput}
              value={name}
              onChangeText={setName}
              placeholder="Name on card"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.cardField}>
            <Ionicons name="card-outline" size={18} color="#888" style={styles.fieldIcon} />
            <TextInput
              style={styles.fieldInput}
              value={cardNumber}
              onChangeText={(v) => setCardNumber(formatCard(v))}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              maxLength={19}
            />
          </View>

          <View style={styles.cardRow}>
            <View style={[styles.cardField, { flex: 1, marginRight: 8 }]}>
              <Ionicons name="calendar-outline" size={18} color="#888" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                value={expiry}
                onChangeText={(v) => setExpiry(formatExpiry(v))}
                placeholder="MM/YY"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
            <View style={[styles.cardField, { flex: 1 }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#888" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                value={cvc}
                onChangeText={(v) => setCvc(v.replace(/\D/g, "").slice(0, 4))}
                placeholder="CVC"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            ${finalAmount > 0 ? finalAmount.toFixed(2) : "0.00"}
          </Text>
        </View>

        <View style={styles.secureNote}>
          <Ionicons name="shield-checkmark" size={14} color="#4CAF50" />
          <Text style={styles.secureText}>
            Secured by Stripe · 256-bit encryption
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.payBtn, (loading || finalAmount < 0.5) && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={loading || finalAmount < 0.5}
        >
          <LinearGradient
            colors={["#E1306C", "#833AB4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.payBtnGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="flash" size={18} color="#fff" />
                <Text style={styles.payBtnText}>
                  Pay ${finalAmount > 0 ? finalAmount.toFixed(2) : "0.00"}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {!stripeAvailable && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={16} color="#FF9800" />
            <Text style={styles.warningText}>
              Demo mode — payments are simulated. Stripe is being configured.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  backBtn: { width: 40, alignItems: "flex-start" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  content: { padding: 20, paddingBottom: 60 },
  recipientCard: { marginBottom: 24, borderRadius: 16, overflow: "hidden" },
  recipientGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E1306C44",
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E1306C",
    alignItems: "center",
    justifyContent: "center",
  },
  recipientAvatarText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  recipientLabel: { color: "#888", fontSize: 12 },
  recipientName: { color: "#fff", fontSize: 16, fontWeight: "700" },
  sectionTitle: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 12,
    marginTop: 8,
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  amountChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
  },
  amountChipSelected: { backgroundColor: "#E1306C22", borderColor: "#E1306C" },
  amountChipText: { color: "#ccc", fontSize: 15, fontWeight: "600" },
  amountChipTextSelected: { color: "#E1306C" },
  customToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    marginBottom: 8,
  },
  customToggleActive: {},
  customToggleText: { color: "#888", fontSize: 14 },
  customInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1306C",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dollarSign: { color: "#E1306C", fontSize: 22, fontWeight: "700", marginRight: 4 },
  customInputField: { flex: 1, color: "#fff", fontSize: 22, fontWeight: "700", paddingVertical: 14 },
  messageInput: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    padding: 14,
    color: "#fff",
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  cardForm: { gap: 10, marginBottom: 20 },
  cardField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 14,
  },
  fieldIcon: { marginRight: 10 },
  fieldInput: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 14 },
  cardRow: { flexDirection: "row" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#222",
    marginBottom: 8,
  },
  totalLabel: { color: "#aaa", fontSize: 15 },
  totalAmount: { color: "#fff", fontSize: 24, fontWeight: "800" },
  secureNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  secureText: { color: "#4CAF50", fontSize: 12 },
  payBtn: { borderRadius: 16, overflow: "hidden", marginBottom: 16 },
  payBtnDisabled: { opacity: 0.5 },
  payBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
  },
  payBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FF980022",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FF980044",
  },
  warningText: { color: "#FF9800", fontSize: 12, flex: 1 },
  successContainer: { flex: 1 },
  successGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  successTitle: { color: "#fff", fontSize: 28, fontWeight: "800" },
  successSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 16, textAlign: "center" },
  successMessage: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  successMessageText: { color: "#fff", fontSize: 15, fontStyle: "italic", textAlign: "center" },
  doneBtn: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 48,
    paddingVertical: 16,
    marginTop: 16,
  },
  doneBtnText: { color: "#E1306C", fontSize: 17, fontWeight: "700" },
});
