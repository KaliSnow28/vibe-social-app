import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
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
import { useCharacters, type AvatarConfig } from "@/context/CharacterContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const SKIN_TONES = [
  { key: "light", color: "#FDDBB4", emoji: "🏻" },
  { key: "medium-light", color: "#EDB98A", emoji: "🏼" },
  { key: "medium", color: "#C68642", emoji: "🏽" },
  { key: "medium-dark", color: "#8D5524", emoji: "🏾" },
  { key: "dark", color: "#4C2E14", emoji: "🏿" },
];

const HAIR_STYLES = [
  { key: "short", label: "Short", emoji: "👦" },
  { key: "long", label: "Long", emoji: "👩" },
  { key: "curly", label: "Curly", emoji: "🧑‍🦱" },
  { key: "bun", label: "Bun", emoji: "👩‍🦲" },
  { key: "afro", label: "Afro", emoji: "🧑‍🦱" },
  { key: "bald", label: "Bald", emoji: "👨‍🦲" },
];

const HAIR_COLORS = [
  { key: "dark", label: "Black", color: "#1a1a1a" },
  { key: "brown", label: "Brown", color: "#6B3A2A" },
  { key: "blonde", label: "Blonde", color: "#F5D76E" },
  { key: "red", label: "Red", color: "#C0392B" },
  { key: "gray", label: "Gray", color: "#95A5A6" },
  { key: "blue", label: "Blue", color: "#3498DB" },
  { key: "purple", label: "Purple", color: "#9B59B6" },
  { key: "pink", label: "Pink", color: "#FF69B4" },
];

const EYES = [
  { key: "normal", label: "Normal", emoji: "👀" },
  { key: "happy", label: "Happy", emoji: "😊" },
  { key: "sleepy", label: "Sleepy", emoji: "😴" },
  { key: "surprised", label: "Wide", emoji: "😲" },
  { key: "wink", label: "Wink", emoji: "😉" },
  { key: "star", label: "Stars", emoji: "🤩" },
];

const EXPRESSIONS = [
  { key: "smile", label: "Smile", emoji: "😊" },
  { key: "laugh", label: "Laugh", emoji: "😄" },
  { key: "cool", label: "Cool", emoji: "😎" },
  { key: "sad", label: "Sad", emoji: "😢" },
  { key: "angry", label: "Fierce", emoji: "😠" },
  { key: "kiss", label: "Kiss", emoji: "😘" },
  { key: "silly", label: "Silly", emoji: "🤪" },
  { key: "think", label: "Think", emoji: "🤔" },
];

const ACCESSORIES = [
  { key: "none", label: "None", emoji: "❌" },
  { key: "glasses", label: "Glasses", emoji: "👓" },
  { key: "sunglasses", label: "Shades", emoji: "🕶️" },
  { key: "hat", label: "Cap", emoji: "🧢" },
  { key: "crown", label: "Crown", emoji: "👑" },
  { key: "headphones", label: "Music", emoji: "🎧" },
  { key: "flower", label: "Flower", emoji: "🌸" },
  { key: "bow", label: "Bow", emoji: "🎀" },
];

const BACKGROUNDS = [
  { key: "peach", colors: ["#FFF9C4", "#FFCCBC"] as const },
  { key: "sky", colors: ["#B3E5FC", "#81D4FA"] as const },
  { key: "lavender", colors: ["#E1BEE7", "#CE93D8"] as const },
  { key: "mint", colors: ["#C8E6C9", "#A5D6A7"] as const },
  { key: "rose", colors: ["#FCE4EC", "#F48FB1"] as const },
  { key: "dark", colors: ["#424242", "#212121"] as const },
  { key: "galaxy", colors: ["#1A237E", "#4A148C"] as const },
  { key: "fire", colors: ["#FF6F00", "#E53935"] as const },
];

const SECTIONS = [
  "Skin Tone",
  "Hair Style",
  "Hair Color",
  "Eyes",
  "Expression",
  "Accessories",
  "Background",
];

function getAvatarEmoji(config: AvatarConfig): string {
  const expr = EXPRESSIONS.find((e) => e.key === config.expression);
  const acc = ACCESSORIES.find((a) => a.key === config.accessory);
  const eyes = EYES.find((e) => e.key === config.eyes);
  return `${acc && acc.key !== "none" ? acc.emoji : ""}${expr?.emoji ?? "😊"}`;
}

export default function AvatarCreatorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { avatar, updateAvatar } = useCharacters();
  const [activeSection, setActiveSection] = useState(0);
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const bgColors: [string, string] = (BACKGROUNDS.find((b) => b.key === avatar.background)?.colors ?? ["#FFF9C4", "#FFCCBC"]) as [string, string];
  const skinColor = SKIN_TONES.find((s) => s.key === avatar.skinTone)?.color ?? "#FDDBB4";
  const hairColor = HAIR_COLORS.find((h) => h.key === avatar.hairColor)?.color ?? "#1a1a1a";
  const expression = EXPRESSIONS.find((e) => e.key === avatar.expression)?.emoji ?? "😊";
  const accessory = ACCESSORIES.find((a) => a.key === avatar.accessory);
  const hairStyle = HAIR_STYLES.find((h) => h.key === avatar.hairStyle);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const renderOptions = () => {
    switch (activeSection) {
      case 0:
        return (
          <View style={styles.optionGrid}>
            {SKIN_TONES.map((s) => (
              <Pressable
                key={s.key}
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor: s.color,
                    borderColor: avatar.skinTone === s.key ? colors.primary : "transparent",
                    borderWidth: 3,
                  },
                ]}
                onPress={() => { updateAvatar({ skinTone: s.key }); Haptics.selectionAsync(); }}
                testID={`skin-${s.key}`}
              />
            ))}
          </View>
        );
      case 1:
        return (
          <View style={styles.optionGrid}>
            {HAIR_STYLES.map((h) => (
              <Pressable
                key={h.key}
                style={[
                  styles.emojiOption,
                  {
                    backgroundColor: avatar.hairStyle === h.key ? colors.primary + "20" : colors.muted,
                    borderColor: avatar.hairStyle === h.key ? colors.primary : "transparent",
                    borderRadius: colors.radius,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => { updateAvatar({ hairStyle: h.key }); Haptics.selectionAsync(); }}
                testID={`hair-${h.key}`}
              >
                <Text style={styles.emojiText}>{h.emoji}</Text>
                <Text style={[styles.optionLabel, { color: colors.foreground }]}>{h.label}</Text>
              </Pressable>
            ))}
          </View>
        );
      case 2:
        return (
          <View style={styles.optionGrid}>
            {HAIR_COLORS.map((h) => (
              <Pressable
                key={h.key}
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor: h.color,
                    borderColor: avatar.hairColor === h.key ? colors.primary : "transparent",
                    borderWidth: 3,
                  },
                ]}
                onPress={() => { updateAvatar({ hairColor: h.key }); Haptics.selectionAsync(); }}
                testID={`haircolor-${h.key}`}
              >
                {avatar.hairColor === h.key && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </Pressable>
            ))}
          </View>
        );
      case 3:
        return (
          <View style={styles.optionGrid}>
            {EYES.map((e) => (
              <Pressable
                key={e.key}
                style={[
                  styles.emojiOption,
                  {
                    backgroundColor: avatar.eyes === e.key ? colors.primary + "20" : colors.muted,
                    borderColor: avatar.eyes === e.key ? colors.primary : "transparent",
                    borderRadius: colors.radius,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => { updateAvatar({ eyes: e.key }); Haptics.selectionAsync(); }}
                testID={`eyes-${e.key}`}
              >
                <Text style={styles.emojiText}>{e.emoji}</Text>
                <Text style={[styles.optionLabel, { color: colors.foreground }]}>{e.label}</Text>
              </Pressable>
            ))}
          </View>
        );
      case 4:
        return (
          <View style={styles.optionGrid}>
            {EXPRESSIONS.map((e) => (
              <Pressable
                key={e.key}
                style={[
                  styles.emojiOption,
                  {
                    backgroundColor: avatar.expression === e.key ? colors.primary + "20" : colors.muted,
                    borderColor: avatar.expression === e.key ? colors.primary : "transparent",
                    borderRadius: colors.radius,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => { updateAvatar({ expression: e.key }); Haptics.selectionAsync(); }}
                testID={`expr-${e.key}`}
              >
                <Text style={styles.emojiText}>{e.emoji}</Text>
                <Text style={[styles.optionLabel, { color: colors.foreground }]}>{e.label}</Text>
              </Pressable>
            ))}
          </View>
        );
      case 5:
        return (
          <View style={styles.optionGrid}>
            {ACCESSORIES.map((a) => (
              <Pressable
                key={a.key}
                style={[
                  styles.emojiOption,
                  {
                    backgroundColor: avatar.accessory === a.key ? colors.primary + "20" : colors.muted,
                    borderColor: avatar.accessory === a.key ? colors.primary : "transparent",
                    borderRadius: colors.radius,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => { updateAvatar({ accessory: a.key }); Haptics.selectionAsync(); }}
                testID={`acc-${a.key}`}
              >
                <Text style={styles.emojiText}>{a.emoji}</Text>
                <Text style={[styles.optionLabel, { color: colors.foreground }]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        );
      case 6:
        return (
          <View style={styles.optionGrid}>
            {BACKGROUNDS.map((b) => (
              <Pressable
                key={b.key}
                style={[
                  styles.bgSwatch,
                  {
                    borderColor: avatar.background === b.key ? colors.primary : "transparent",
                    borderWidth: 3,
                    borderRadius: colors.radius,
                    overflow: "hidden",
                  },
                ]}
                onPress={() => { updateAvatar({ background: b.key }); Haptics.selectionAsync(); }}
                testID={`bg-${b.key}`}
              >
                <LinearGradient colors={b.colors} style={StyleSheet.absoluteFill} />
                {avatar.background === b.key && (
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                )}
              </Pressable>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: headerTop,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()}>
          <Feather name="x" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Avatar Creator</Text>
        <Pressable
          style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          onPress={handleSave}
          testID="save-avatar"
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.previewSection}>
        <LinearGradient
          colors={bgColors as [string, string]}
          style={[styles.avatarPreviewBg, { borderRadius: 80 }]}
        >
          <View style={[styles.avatarFace, { backgroundColor: skinColor }]}>
            {hairStyle?.key !== "bald" && (
              <View style={[styles.hair, { backgroundColor: hairColor }]} />
            )}
            <Text style={styles.faceEmoji}>{expression}</Text>
            {accessory && accessory.key !== "none" && (
              <View style={styles.accessoryWrap}>
                <Text style={styles.accessoryEmoji}>{accessory.emoji}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.emojiDisplay}>
          <Text style={styles.bigEmoji}>{getAvatarEmoji(avatar)}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionTabs}
        style={[styles.sectionTabsScroll, { borderBottomColor: colors.border }]}
      >
        {SECTIONS.map((sec, i) => (
          <Pressable
            key={sec}
            style={[
              styles.sectionTab,
              {
                borderBottomColor: activeSection === i ? colors.primary : "transparent",
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => {
              setActiveSection(i);
              Haptics.selectionAsync();
            }}
          >
            <Text
              style={[
                styles.sectionTabText,
                {
                  color: activeSection === i ? colors.primary : colors.mutedForeground,
                  fontWeight: activeSection === i ? "700" : "400" as const,
                },
              ]}
            >
              {sec}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[
          styles.optionsScroll,
          { paddingBottom: bottomPad + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {renderOptions()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700" as const,
  },
  previewSection: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 12,
  },
  avatarPreviewBg: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFace: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    position: "relative",
  },
  hair: {
    position: "absolute",
    top: -8,
    left: 8,
    right: 8,
    height: 30,
    borderRadius: 20,
  },
  faceEmoji: {
    fontSize: 48,
    marginTop: 4,
  },
  accessoryWrap: {
    position: "absolute",
    top: -20,
    alignItems: "center",
  },
  accessoryEmoji: {
    fontSize: 32,
  },
  emojiDisplay: {
    alignItems: "center",
  },
  bigEmoji: {
    fontSize: 56,
  },
  sectionTabsScroll: {
    flexGrow: 0,
    borderBottomWidth: 1,
  },
  sectionTabs: {
    paddingHorizontal: 8,
    gap: 4,
  },
  sectionTab: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionTabText: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  optionsScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorSwatch: {
    width: (width - 80) / 5,
    height: (width - 80) / 5,
    borderRadius: (width - 80) / 10,
    alignItems: "center",
    justifyContent: "center",
  },
  bgSwatch: {
    width: (width - 72) / 4,
    height: (width - 72) / 4,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiOption: {
    width: (width - 72) / 4,
    alignItems: "center",
    paddingVertical: 10,
    gap: 4,
  },
  emojiText: {
    fontSize: 28,
  },
  optionLabel: {
    fontSize: 10,
    fontWeight: "500" as const,
  },
});
