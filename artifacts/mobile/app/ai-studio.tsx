import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
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
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const THUMB = (width - 48) / 3;

const STYLES = [
  { id: "photorealistic", label: "Photorealistic", emoji: "📷", model: "flux-realism" },
  { id: "anime", label: "Anime", emoji: "🎌", model: "flux" },
  { id: "cyberpunk", label: "Cyberpunk", emoji: "🤖", model: "flux" },
  { id: "fantasy", label: "Fantasy", emoji: "🧙", model: "flux" },
  { id: "oil-painting", label: "Oil Painting", emoji: "🎨", model: "flux" },
  { id: "watercolor", label: "Watercolor", emoji: "💧", model: "flux" },
  { id: "digital-art", label: "Digital Art", emoji: "🖥️", model: "flux" },
  { id: "3d-render", label: "3D Render", emoji: "🌐", model: "flux" },
  { id: "pixel-art", label: "Pixel Art", emoji: "👾", model: "flux" },
  { id: "neon", label: "Neon Art", emoji: "💡", model: "turbo" },
  { id: "comic", label: "Comic Book", emoji: "💬", model: "flux" },
  { id: "cinematic", label: "Cinematic", emoji: "🎬", model: "flux-realism" },
];

const ASPECT_RATIOS = [
  { id: "square", label: "1:1", w: 512, h: 512 },
  { id: "portrait", label: "9:16", w: 512, h: 768 },
  { id: "landscape", label: "16:9", w: 768, h: 512 },
];

type ContentMode = "safe" | "mature" | "adult";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  timestamp: number;
  mode: ContentMode;
}

function makeId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function buildUrl(prompt: string, model: string, w: number, h: number, mode: ContentMode, seed: number): string {
  const styleHints: Record<string, string> = {
    anime: "anime style, vibrant colors, manga art",
    cyberpunk: "cyberpunk neon city, futuristic, dark atmosphere",
    fantasy: "fantasy art, magical, epic, detailed",
    "oil-painting": "oil painting style, classical art, textured brushstrokes",
    watercolor: "watercolor painting, soft colors, artistic",
    "digital-art": "digital art, clean lines, modern illustration",
    "3d-render": "3D render, CGI, detailed, photorealistic",
    "pixel-art": "pixel art, 8-bit style, retro gaming",
    neon: "neon lights, glowing, dark background, vivid colors",
    comic: "comic book style, bold outlines, flat colors",
    cinematic: "cinematic photography, dramatic lighting, film grain",
    photorealistic: "photorealistic, high detail, professional photography",
  };
  const styleHint = styleHints[model] ?? "";
  const fullPrompt = [prompt, styleHint].filter(Boolean).join(", ");
  const encoded = encodeURIComponent(fullPrompt);
  const nsfw = mode === "adult" ? "true" : "false";
  return `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&nologo=true&model=${model}&nsfw=${nsfw}&seed=${seed}`;
}

export default function AIStudioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;

  const [prompt, setPrompt] = useState("");
  const [negPrompt, setNegPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("photorealistic");
  const [selectedRatio, setSelectedRatio] = useState("square");
  const [contentMode, setContentMode] = useState<ContentMode>("safe");
  const [generating, setGenerating] = useState(false);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [showModeWarning, setShowModeWarning] = useState(false);
  const [pendingMode, setPendingMode] = useState<ContentMode>("safe");
  const [activeTab, setActiveTab] = useState<"create" | "gallery">("create");
  const [showFullImage, setShowFullImage] = useState<GeneratedImage | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const style = STYLES.find((s) => s.id === selectedStyle) ?? STYLES[0];
  const ratio = ASPECT_RATIOS.find((r) => r.id === selectedRatio) ?? ASPECT_RATIOS[0];

  const handleModeChange = (mode: ContentMode) => {
    if (mode === "adult") {
      setPendingMode(mode);
      setShowModeWarning(true);
    } else {
      setContentMode(mode);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      Alert.alert("Prompt Required", "Please describe what you want to generate.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGenerating(true);
    const seed = Math.floor(Math.random() * 99999999);
    const url = buildUrl(prompt, style?.model ?? "flux", ratio.w, ratio.h, contentMode, seed);

    const newImage: GeneratedImage = {
      id: makeId(),
      url,
      prompt: prompt.trim(),
      style: selectedStyle,
      timestamp: Date.now(),
      mode: contentMode,
    };

    await new Promise((res) => setTimeout(res, 2000));
    setGallery((prev) => [newImage, ...prev]);
    setGenerating(false);
    setActiveTab("gallery");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [prompt, style, ratio, contentMode, selectedStyle]);

  const MODE_COLORS: Record<ContentMode, string> = {
    safe: "#4CAF50",
    mature: "#F7931A",
    adult: "#E1306C",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#0d0d1a", "#1a0533"]}
        style={[styles.header, { paddingTop: headerTop + 8 }]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>AI Creative Studio</Text>
            <View style={styles.proBadge}>
              <FontAwesome5 name="infinity" size={10} color="#F7931A" />
              <Text style={styles.proText}>UNLIMITED</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push("/ai-gallery")}>
            <Ionicons name="images-outline" size={22} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.tabsRow}>
          {(["create", "gallery"] as const).map((t) => (
            <Pressable key={t} onPress={() => setActiveTab(t)} style={[styles.tab, activeTab === t && styles.tabActive]}>
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                {t === "create" ? "✨ Create" : `🖼️ Gallery (${gallery.length})`}
              </Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      {activeTab === "create" ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Prompt</Text>
            <View style={[styles.promptBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TextInput
                style={[styles.promptInput, { color: colors.foreground }]}
                placeholder="Describe your vision in detail..."
                placeholderTextColor={colors.mutedForeground}
                value={prompt}
                onChangeText={setPrompt}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{prompt.length}/500</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Art Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.styleScroll}>
              {STYLES.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => setSelectedStyle(s.id)}
                  style={[
                    styles.styleChip,
                    {
                      backgroundColor: selectedStyle === s.id ? colors.primary + "20" : colors.muted,
                      borderColor: selectedStyle === s.id ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={styles.styleEmoji}>{s.emoji}</Text>
                  <Text style={[styles.styleLabel, { color: selectedStyle === s.id ? colors.primary : colors.foreground }]}>
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Aspect Ratio</Text>
            <View style={styles.ratioRow}>
              {ASPECT_RATIOS.map((r) => (
                <Pressable
                  key={r.id}
                  onPress={() => setSelectedRatio(r.id)}
                  style={[
                    styles.ratioBtn,
                    {
                      backgroundColor: selectedRatio === r.id ? colors.primary : colors.muted,
                      borderColor: selectedRatio === r.id ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.ratioLabel, { color: selectedRatio === r.id ? "#fff" : colors.foreground }]}>
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Content Mode</Text>
            <View style={styles.modeRow}>
              {(["safe", "mature", "adult"] as ContentMode[]).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => handleModeChange(m)}
                  style={[
                    styles.modeBtn,
                    {
                      backgroundColor: contentMode === m ? MODE_COLORS[m] + "20" : colors.muted,
                      borderColor: contentMode === m ? MODE_COLORS[m] : colors.border,
                    },
                  ]}
                >
                  <Text style={styles.modeIcon}>
                    {m === "safe" ? "🌿" : m === "mature" ? "🔞" : "🔥"}
                  </Text>
                  <Text style={[styles.modeLabel, { color: contentMode === m ? MODE_COLORS[m] : colors.foreground }]}>
                    {m === "safe" ? "Safe" : m === "mature" ? "Mature" : "18+"}
                  </Text>
                </Pressable>
              ))}
            </View>
            {contentMode !== "safe" && (
              <View style={[styles.modeWarningInline, { backgroundColor: MODE_COLORS[contentMode] + "15" }]}>
                <Text style={[styles.modeWarningText, { color: MODE_COLORS[contentMode] }]}>
                  {contentMode === "mature"
                    ? "Mature content enabled. Artistic nudity and suggestive themes may appear."
                    : "18+ mode enabled. Explicit adult content may be generated."}
                </Text>
              </View>
            )}
          </View>

          <Pressable onPress={() => setShowAdvanced((v) => !v)} style={styles.advancedToggle}>
            <Text style={[styles.advancedLabel, { color: colors.mutedForeground }]}>Advanced Options</Text>
            <Feather name={showAdvanced ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
          </Pressable>

          {showAdvanced && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Negative Prompt (what to avoid)</Text>
              <TextInput
                style={[styles.negPromptInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
                placeholder="blurry, low quality, watermark..."
                placeholderTextColor={colors.mutedForeground}
                value={negPrompt}
                onChangeText={setNegPrompt}
                multiline
              />
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12, paddingBottom: 120 }}>
          {gallery.length === 0 ? (
            <View style={styles.emptyGallery}>
              <MaterialCommunityIcons name="image-plus" size={52} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No images yet</Text>
              <Pressable style={[styles.emptyBtn, { backgroundColor: colors.primary }]} onPress={() => setActiveTab("create")}>
                <Text style={styles.emptyBtnText}>Start Creating</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.galleryGrid}>
              {gallery.map((img) => (
                <Pressable key={img.id} onPress={() => setShowFullImage(img)} style={styles.galleryItem}>
                  <Image source={{ uri: img.url }} style={styles.galleryThumb} resizeMode="cover" />
                  <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.galleryOverlay}>
                    <Text style={styles.galleryStyle}>
                      {STYLES.find((s) => s.id === img.style)?.emoji ?? "✨"} {STYLES.find((s) => s.id === img.style)?.label}
                    </Text>
                  </LinearGradient>
                  {img.mode !== "safe" && (
                    <View style={[styles.modeBadge, { backgroundColor: img.mode === "adult" ? "#E1306C" : "#F7931A" }]}>
                      <Text style={styles.modeBadgeText}>{img.mode === "adult" ? "18+" : "M"}</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: (isWeb ? 34 : insets.bottom) + 12, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {generating ? (
          <View style={[styles.generateBtn, { backgroundColor: "#1a0533" }]}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.generateBtnText}>Generating your vision...</Text>
          </View>
        ) : (
          <Pressable
            style={[styles.generateBtn, { backgroundColor: prompt.trim() ? colors.primary : colors.muted }]}
            onPress={handleGenerate}
            disabled={!prompt.trim()}
          >
            <MaterialCommunityIcons name="creation" size={20} color="#fff" />
            <Text style={styles.generateBtnText}>Generate Image</Text>
          </Pressable>
        )}
      </View>

      <Modal visible={showModeWarning} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.warningCard, { backgroundColor: colors.card }]}>
            <Text style={styles.warningEmoji}>🔞</Text>
            <Text style={[styles.warningTitle, { color: colors.foreground }]}>Age Verification</Text>
            <Text style={[styles.warningBody, { color: colors.mutedForeground }]}>
              By enabling 18+ mode, you confirm you are 18 years or older and consent to viewing adult content. This content is for personal use only.
            </Text>
            <View style={styles.warningButtons}>
              <Pressable style={[styles.warningBtn, { backgroundColor: colors.muted }]} onPress={() => setShowModeWarning(false)}>
                <Text style={[styles.warningBtnText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.warningBtn, { backgroundColor: "#E1306C" }]}
                onPress={() => { setContentMode(pendingMode); setShowModeWarning(false); }}
              >
                <Text style={[styles.warningBtnText, { color: "#fff" }]}>I'm 18+ — Enable</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!showFullImage} transparent animationType="fade">
        <View style={styles.fullImageOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowFullImage(null)} />
          {showFullImage && (
            <View style={styles.fullImageCard}>
              <Image source={{ uri: showFullImage.url }} style={styles.fullImage} resizeMode="contain" />
              <View style={[styles.fullImageInfo, { backgroundColor: colors.card }]}>
                <Text style={[styles.fullImagePrompt, { color: colors.foreground }]} numberOfLines={2}>
                  {showFullImage.prompt}
                </Text>
                <View style={styles.fullImageActions}>
                  <Pressable
                    style={[styles.fullActionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      Alert.alert("Posted!", "Your AI creation has been shared to your feed.");
                      setShowFullImage(null);
                    }}
                  >
                    <Ionicons name="paper-plane" size={16} color="#fff" />
                    <Text style={styles.fullActionText}>Post to Feed</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.fullActionBtn, { backgroundColor: colors.muted }]}
                    onPress={() => setShowFullImage(null)}
                  >
                    <Feather name="download" size={16} color={colors.foreground} />
                    <Text style={[styles.fullActionText, { color: colors.foreground }]}>Save</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 0 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  headerCenter: { alignItems: "center", gap: 4 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  proBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(247,147,26,0.2)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  proText: { color: "#F7931A", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  tabsRow: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.15)" },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#E1306C" },
  tabText: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  section: { paddingHorizontal: 16, marginTop: 20 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  promptBox: { borderRadius: 16, borderWidth: 1, padding: 14, minHeight: 110 },
  promptInput: { fontSize: 15, lineHeight: 22, flex: 1 },
  charCount: { fontSize: 11, textAlign: "right", marginTop: 8 },
  styleScroll: { paddingRight: 16, gap: 8 },
  styleChip: { flexDirection: "column", alignItems: "center", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, gap: 4, minWidth: 78 },
  styleEmoji: { fontSize: 20 },
  styleLabel: { fontSize: 11, fontWeight: "600" },
  ratioRow: { flexDirection: "row", gap: 10 },
  ratioBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
  ratioLabel: { fontSize: 14, fontWeight: "700" },
  modeRow: { flexDirection: "row", gap: 10 },
  modeBtn: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, gap: 4 },
  modeIcon: { fontSize: 18 },
  modeLabel: { fontSize: 12, fontWeight: "700" },
  modeWarningInline: { marginTop: 10, borderRadius: 10, padding: 10 },
  modeWarningText: { fontSize: 12, lineHeight: 17 },
  advancedToggle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, marginTop: 10 },
  advancedLabel: { fontSize: 14, fontWeight: "600" },
  negPromptInput: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14, minHeight: 70, textAlignVertical: "top" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  generateBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, paddingVertical: 16 },
  generateBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  emptyGallery: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
  emptyBtn: { borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  galleryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  galleryItem: { width: THUMB, height: THUMB, borderRadius: 12, overflow: "hidden", position: "relative" },
  galleryThumb: { width: "100%", height: "100%" },
  galleryOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 6 },
  galleryStyle: { color: "#fff", fontSize: 9, fontWeight: "600" },
  modeBadge: { position: "absolute", top: 6, right: 6, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  modeBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 24 },
  warningCard: { borderRadius: 24, padding: 28, alignItems: "center", width: "100%" },
  warningEmoji: { fontSize: 40, marginBottom: 12 },
  warningTitle: { fontSize: 20, fontWeight: "800", marginBottom: 10 },
  warningBody: { fontSize: 14, lineHeight: 20, textAlign: "center", marginBottom: 24 },
  warningButtons: { flexDirection: "row", gap: 12, width: "100%" },
  warningBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  warningBtnText: { fontSize: 14, fontWeight: "700" },
  fullImageOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
  fullImageCard: { width: width - 32, borderRadius: 24, overflow: "hidden" },
  fullImage: { width: "100%", height: (width - 32) * 1.2, backgroundColor: "#111" },
  fullImageInfo: { padding: 16 },
  fullImagePrompt: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  fullImageActions: { flexDirection: "row", gap: 10 },
  fullActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 12 },
  fullActionText: { fontSize: 13, fontWeight: "700", color: "#fff" },
});
