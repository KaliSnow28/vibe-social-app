import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const CELL = (width - 36) / 2;

const SHOWCASE_IMAGES = [
  {
    id: "s1",
    url: "https://image.pollinations.ai/prompt/beautiful%20sunset%20over%20mountains%2C%20photorealistic?width=512&height=512&nologo=true&model=flux-realism&seed=42",
    prompt: "Beautiful sunset over mountains",
    style: "Photorealistic",
    emoji: "📷",
  },
  {
    id: "s2",
    url: "https://image.pollinations.ai/prompt/anime%20girl%20in%20cherry%20blossom%20garden%2C%20vibrant%20colors?width=512&height=512&nologo=true&model=flux&seed=123",
    prompt: "Anime girl in cherry blossom garden",
    style: "Anime",
    emoji: "🎌",
  },
  {
    id: "s3",
    url: "https://image.pollinations.ai/prompt/cyberpunk%20city%20at%20night%2C%20neon%20lights%2C%20rain?width=512&height=512&nologo=true&model=flux&seed=456",
    prompt: "Cyberpunk city at night, neon lights",
    style: "Cyberpunk",
    emoji: "🤖",
  },
  {
    id: "s4",
    url: "https://image.pollinations.ai/prompt/fantasy%20dragon%20on%20crystal%20mountain%2C%20epic%20art?width=512&height=512&nologo=true&model=flux&seed=789",
    prompt: "Fantasy dragon on crystal mountain",
    style: "Fantasy",
    emoji: "🧙",
  },
  {
    id: "s5",
    url: "https://image.pollinations.ai/prompt/watercolor%20painting%20of%20Paris%20streets?width=512&height=512&nologo=true&model=flux&seed=101",
    prompt: "Watercolor painting of Paris streets",
    style: "Watercolor",
    emoji: "💧",
  },
  {
    id: "s6",
    url: "https://image.pollinations.ai/prompt/3D%20render%20of%20futuristic%20spacecraft%2C%20detailed?width=512&height=512&nologo=true&model=flux&seed=202",
    prompt: "3D render of futuristic spacecraft",
    style: "3D Render",
    emoji: "🌐",
  },
  {
    id: "s7",
    url: "https://image.pollinations.ai/prompt/neon%20geometric%20abstract%20art%2C%20glowing%20colors?width=512&height=512&nologo=true&model=turbo&seed=303",
    prompt: "Neon geometric abstract art",
    style: "Neon Art",
    emoji: "💡",
  },
  {
    id: "s8",
    url: "https://image.pollinations.ai/prompt/cinematic%20portrait%20of%20warrior%20woman%2C%20dramatic%20lighting?width=512&height=512&nologo=true&model=flux-realism&seed=404",
    prompt: "Cinematic portrait of warrior woman",
    style: "Cinematic",
    emoji: "🎬",
  },
];

export default function AIGalleryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#0d0d1a", "#1a0533"]} style={[styles.header, { paddingTop: headerTop + 8 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>AI Gallery</Text>
          <Pressable onPress={() => setView(view === "grid" ? "list" : "grid")}>
            <MaterialCommunityIcons
              name={view === "grid" ? "view-list" : "view-grid"}
              size={22}
              color="#fff"
            />
          </Pressable>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>{SHOWCASE_IMAGES.length} AI Creations</Text>
          <View style={styles.proBadge}>
            <Text style={styles.proText}>✨ UNLIMITED GENERATIONS</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>Community AI Showcase</Text>
            <Text style={[styles.infoSub, { color: colors.mutedForeground }]}>
              Real AI-generated art from our community. Tap to view full size, share or post to your feed.
            </Text>
          </View>
        </View>

        {view === "grid" ? (
          <View style={styles.grid}>
            {SHOWCASE_IMAGES.map((img, i) => (
              <Pressable key={img.id} style={[styles.gridItem, i % 3 === 0 && styles.gridItemWide]}>
                <Image
                  source={{ uri: img.url }}
                  style={[styles.gridImage, i % 3 === 0 && styles.gridImageWide]}
                  resizeMode="cover"
                />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.75)"]} style={styles.gridOverlay}>
                  <Text style={styles.gridEmoji}>{img.emoji}</Text>
                  <Text style={styles.gridStyle}>{img.style}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            {SHOWCASE_IMAGES.map((img) => (
              <View key={img.id} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Image source={{ uri: img.url }} style={styles.listThumb} resizeMode="cover" />
                <View style={styles.listInfo}>
                  <Text style={[styles.listStyle, { color: colors.primary }]}>
                    {img.emoji} {img.style}
                  </Text>
                  <Text style={[styles.listPrompt, { color: colors.foreground }]} numberOfLines={2}>
                    {img.prompt}
                  </Text>
                  <View style={styles.listActions}>
                    <Pressable style={[styles.listBtn, { backgroundColor: colors.primary }]}>
                      <Text style={styles.listBtnText}>Post</Text>
                    </Pressable>
                    <Pressable style={[styles.listBtn, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.listBtnText, { color: colors.foreground }]}>Save</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <Pressable
          style={[styles.createMoreBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/ai-studio")}
        >
          <MaterialCommunityIcons name="creation" size={20} color="#fff" />
          <Text style={styles.createMoreText}>Create Your Own</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  headerStats: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statsText: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  proBadge: { backgroundColor: "rgba(225,48,108,0.25)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  proText: { color: "#E1306C", fontSize: 10, fontWeight: "800" },
  infoCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 14, padding: 14, borderRadius: 14, backgroundColor: "rgba(131,58,180,0.1)" },
  infoEmoji: { fontSize: 28 },
  infoTitle: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  infoSub: { fontSize: 12, lineHeight: 17 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  gridItem: { width: CELL, height: CELL, borderRadius: 14, overflow: "hidden" },
  gridItemWide: { width: "100%", height: CELL * 1.4 },
  gridImage: { width: "100%", height: "100%" },
  gridImageWide: {},
  gridOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 10 },
  gridEmoji: { fontSize: 16 },
  gridStyle: { color: "#fff", fontSize: 11, fontWeight: "600" },
  list: { gap: 10 },
  listItem: { flexDirection: "row", borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  listThumb: { width: 100, height: 100 },
  listInfo: { flex: 1, padding: 12, justifyContent: "space-between" },
  listStyle: { fontSize: 12, fontWeight: "700" },
  listPrompt: { fontSize: 13, lineHeight: 18 },
  listActions: { flexDirection: "row", gap: 8, marginTop: 8 },
  listBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  listBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  createMoreBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, paddingVertical: 16, marginTop: 20 },
  createMoreText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
