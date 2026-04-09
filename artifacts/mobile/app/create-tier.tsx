import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
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
import { usePayments } from "@/context/PaymentsContext";
import { useColors } from "@/hooks/useColors";

export default function CreateTierScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { me } = useApp();
  const { createTier } = usePayments();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [annualPrice, setAnnualPrice] = useState("");
  const [perks, setPerks] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert("Error", "Tier name is required");
    if (!description.trim()) return Alert.alert("Error", "Description is required");
    const price = parseFloat(monthlyPrice);
    if (isNaN(price) || price < 0.99) {
      return Alert.alert("Error", "Monthly price must be at least $0.99");
    }
    if (!perks.trim()) return Alert.alert("Error", "Please add some perks");

    setSaving(true);
    try {
      await createTier({
        name: name.trim(),
        description: description.trim(),
        monthlyPrice: price.toString(),
        annualPrice: annualPrice ? parseFloat(annualPrice).toString() : null,
        perks: perks.trim(),
      });
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to create tier");
    } finally {
      setSaving(false);
    }
  };

  const s = styles(colors);

  return (
    <KeyboardAvoidingView
      style={[s.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={s.headerTitle}>Create Tier</Text>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={[s.saveBtn, saving && { opacity: 0.5 }]}
        >
          <Text style={s.saveBtnText}>{saving ? "Saving..." : "Save"}</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={s.content}>
        <Text style={s.label}>Tier Name</Text>
        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Fan, Supporter, VIP"
          placeholderTextColor={colors.mutedForeground}
        />

        <Text style={s.label}>Description</Text>
        <TextInput
          style={[s.input, s.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="What do subscribers get?"
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={3}
        />

        <Text style={s.label}>Monthly Price (USD)</Text>
        <View style={s.priceRow}>
          <Text style={s.currencySymbol}>$</Text>
          <TextInput
            style={[s.input, s.priceInput]}
            value={monthlyPrice}
            onChangeText={setMonthlyPrice}
            placeholder="2.99"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
          />
        </View>

        <Text style={s.label}>Annual Price (USD, optional)</Text>
        <View style={s.priceRow}>
          <Text style={s.currencySymbol}>$</Text>
          <TextInput
            style={[s.input, s.priceInput]}
            value={annualPrice}
            onChangeText={setAnnualPrice}
            placeholder="24.99"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
          />
        </View>

        <Text style={s.label}>Perks & Benefits</Text>
        <TextInput
          style={[s.input, s.multiline]}
          value={perks}
          onChangeText={setPerks}
          placeholder="- Exclusive posts&#10;- Behind-the-scenes content&#10;- Monthly shoutout"
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={5}
        />

        <View style={s.hint}>
          <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
          <Text style={s.hintText}>
            Subscriptions are processed through PayPal. A 5% platform fee applies.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    saveBtn: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    saveBtnText: {
      color: colors.primaryForeground,
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
    content: { flex: 1, padding: 16 },
    label: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginBottom: 6,
      marginTop: 16,
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
    multiline: {
      minHeight: 80,
      textAlignVertical: "top",
      paddingTop: 12,
    },
    priceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    currencySymbol: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginTop: -2,
    },
    priceInput: { flex: 1 },
    hint: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 6,
      marginTop: 20,
      padding: 12,
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
    },
    hintText: {
      flex: 1,
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
  });
