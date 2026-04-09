import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ExploreSkeleton } from "@/components/SkeletonLoader";
import { useApp } from "@/context/AppContext";
import { useCharacters } from "@/context/CharacterContext";
import { useWallet } from "@/context/WalletContext";
import { useColors } from "@/hooks/useColors";
import { useInitialLoad } from "@/hooks/useInitialLoad";

const { width } = Dimensions.get("window");
const CELL = (width - 3) / 3;

const TRENDING_TAGS = [
  "#nature",
  "#travel",
  "#photography",
  "#food",
  "#fashion",
  "#fitness",
  "#art",
  "#music",
  "#lifestyle",
  "#tech",
];

const SUGGESTED_USERS = [
  { id: "u1", username: "natgeo_style", avatar: "https://i.pravatar.cc/150?img=20", followers: "2.4M" },
  { id: "u2", username: "travel_moments", avatar: "https://i.pravatar.cc/150?img=21", followers: "890K" },
  { id: "u3", username: "food.art", avatar: "https://i.pravatar.cc/150?img=22", followers: "1.1M" },
  { id: "u4", username: "urban.lens", avatar: "https://i.pravatar.cc/150?img=23", followers: "562K" },
];

const TRENDING_CREATORS = [
  { id: "tc1", username: "alex_creates", avatar: "https://i.pravatar.cc/150?img=12", earnings: "$4.2K", badge: "🔥" },
  { id: "tc2", username: "sarah.vibes", avatar: "https://i.pravatar.cc/150?img=5", earnings: "$2.8K", badge: "⚡" },
  { id: "tc3", username: "marco_photo", avatar: "https://i.pravatar.cc/150?img=9", earnings: "$1.9K", badge: "🌟" },
  { id: "tc4", username: "mia.art", avatar: "https://i.pravatar.cc/150?img=16", earnings: "$3.5K", badge: "💎" },
  { id: "tc5", username: "liamshots", avatar: "https://i.pravatar.cc/150?img=8", earnings: "$980", badge: "🚀" },
];

const HASHTAG_CHALLENGES = [
  { tag: "#VibeChallenge", posts: "8.2M", gradient: ["#E1306C", "#833AB4"] as [string, string], emoji: "🎵" },
  { tag: "#SunsetShots", posts: "3.4M", gradient: ["#F7931A", "#E1306C"] as [string, string], emoji: "🌅" },
  { tag: "#TravelVibes", posts: "12.1M", gradient: ["#833AB4", "#4C5BD4"] as [string, string], emoji: "✈️" },
  { tag: "#FoodArt", posts: "5.7M", gradient: ["#F7931A", "#FCBB3C"] as [string, string], emoji: "🍜" },
];

const TRENDING_REELS = [
  { id: "tr1", thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", plays: "12.4M", username: "@alex_creates" },
  { id: "tr2", thumbnail: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400", plays: "8.9M", username: "@sarah.vibes" },
  { id: "tr3", thumbnail: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400", plays: "6.2M", username: "@mia.art" },
  { id: "tr4", thumbnail: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400", plays: "4.8M", username: "@liamshots" },
];

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { posts } = useApp();
  const { characters } = useCharacters();
  const { tipCreator } = useWallet();
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const initialLoading = useInitialLoad();
  const isWeb = Platform.OS === "web";

  const headerTop = isWeb ? 67 : insets.top;

  const filteredUsers = search.length > 0
    ? SUGGESTED_USERS.filter((u) =>
        u.username.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const allImages = [...posts, ...posts].slice(0, 21);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            top: headerTop,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.muted,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            placeholder="Search"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              if (!search) setFocused(false);
            }}
            style={[styles.searchInput, { color: colors.foreground }]}
            returnKeyType="search"
            testID="explore-search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {initialLoading ? (
        <ExploreSkeleton />
      ) : focused && search.length > 0 ? (
        <View style={[styles.searchResults, { paddingTop: headerTop + 60 }]}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <Pressable
                key={u.id}
                style={[styles.userResult, { borderBottomColor: colors.border }]}
              >
                <Image source={{ uri: u.avatar }} style={styles.resultAvatar} />
                <View>
                  <Text style={[styles.resultUsername, { color: colors.foreground }]}>
                    {u.username}
                  </Text>
                  <Text style={[styles.resultFollowers, { color: colors.mutedForeground }]}>
                    {u.followers} followers
                  </Text>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.tagsSection}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Trending
              </Text>
              {TRENDING_TAGS.map((tag) => (
                <Pressable
                  key={tag}
                  style={[styles.tagRow, { borderBottomColor: colors.border }]}
                  onPress={() => setSearch(tag)}
                >
                  <View style={[styles.tagIcon, { backgroundColor: colors.muted }]}>
                    <Feather name="hash" size={18} color={colors.foreground} />
                  </View>
                  <View>
                    <Text style={[styles.tagName, { color: colors.foreground }]}>{tag}</Text>
                    <Text style={[styles.tagPosts, { color: colors.mutedForeground }]}>
                      {Math.floor(Math.random() * 900 + 100)}K posts
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={allImages}
          keyExtractor={(item, index) => item.id + index}
          numColumns={3}
          contentContainerStyle={[
            styles.gridContent,
            {
              paddingTop: headerTop + 60,
              paddingBottom: isWeb ? 84 + 34 : 90,
            },
          ]}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={() => (
            <View style={styles.charactersSection}>

              <Pressable
                style={styles.aiStudioBanner}
                onPress={() => router.push("/ai-studio")}
              >
                <LinearGradient
                  colors={["#1a0533", "#0d1a3a", "#0a1a10"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.aiStudioGradient}
                >
                  <View style={styles.aiStudioLeft}>
                    <Text style={styles.aiStudioEmoji}>✨</Text>
                    <View>
                      <Text style={styles.aiStudioTitle}>AI Creative Studio</Text>
                      <Text style={styles.aiStudioSub}>Unlimited image generation • 12 styles • NSFW</Text>
                    </View>
                  </View>
                  <View style={styles.aiStudioRight}>
                    <Text style={styles.aiStudioBadge}>FREE</Text>
                    <Feather name="chevron-right" size={16} color="#fff" />
                  </View>
                </LinearGradient>
              </Pressable>

              <View style={styles.sectionBlock}>
                <View style={styles.sectionRow}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🔥 Trending Creators</Text>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.creatorScroll}>
                  {TRENDING_CREATORS.map((c) => (
                    <View key={c.id} style={[styles.creatorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={styles.creatorBadge}>{c.badge}</Text>
                      <Image source={{ uri: c.avatar }} style={styles.creatorAvatar} />
                      <Text style={[styles.creatorName, { color: colors.foreground }]} numberOfLines={1}>@{c.username}</Text>
                      <Text style={[styles.creatorEarnings, { color: "#4CAF50" }]}>{c.earnings}/mo</Text>
                      <Pressable
                        style={[styles.tipBtn, { backgroundColor: colors.primary }]}
                        onPress={() => tipCreator(c.username, "USDC", 1.00)}
                      >
                        <FontAwesome5 name="coins" size={10} color="#fff" />
                        <Text style={styles.tipBtnText}>Tip</Text>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.sectionBlock}>
                <View style={styles.sectionRow}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🎯 Hashtag Challenges</Text>
                </View>
                <View style={styles.challengesGrid}>
                  {HASHTAG_CHALLENGES.map((h) => (
                    <Pressable key={h.tag} style={styles.challengeCard}>
                      <LinearGradient colors={h.gradient} style={styles.challengeGradient}>
                        <Text style={styles.challengeEmoji}>{h.emoji}</Text>
                        <Text style={styles.challengeTag}>{h.tag}</Text>
                        <Text style={styles.challengePosts}>{h.posts} posts</Text>
                      </LinearGradient>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <View style={styles.sectionRow}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>▶️ Viral Reels</Text>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reelScroll}>
                  {TRENDING_REELS.map((r) => (
                    <Pressable key={r.id} style={styles.reelCard}>
                      <Image source={{ uri: r.thumbnail }} style={styles.reelThumb} resizeMode="cover" />
                      <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.reelOverlay}>
                        <Ionicons name="play-circle" size={28} color="#fff" />
                        <View>
                          <Text style={styles.reelPlays}>{r.plays} plays</Text>
                          <Text style={styles.reelUser}>{r.username}</Text>
                        </View>
                      </LinearGradient>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.charactersSectionHeader}>
                <View style={styles.charactersSectionLeft}>
                  <MaterialCommunityIcons name="robot-outline" size={18} color={colors.primary} />
                  <Text style={[styles.charactersSectionTitle, { color: colors.foreground }]}>
                    AI Characters
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push("/characters")}
                  testID="see-all-characters"
                >
                  <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.charactersScroll}
              >
                {characters.slice(0, 5).map((char) => (
                  <Pressable
                    key={char.id}
                    style={styles.charItem}
                    onPress={() => router.push({ pathname: "/character-chat/[id]", params: { id: char.id } })}
                    testID={`explore-char-${char.id}`}
                  >
                    <View style={[styles.charAvatarWrap, { borderColor: colors.primary }]}>
                      <Image source={{ uri: char.avatar }} style={styles.charAvatar} />
                      <View style={[styles.aiBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.aiBadgeText}>AI</Text>
                      </View>
                    </View>
                    <Text style={[styles.charName, { color: colors.foreground }]} numberOfLines={1}>
                      {char.emoji} {char.name}
                    </Text>
                    <Text style={[styles.charCategory, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {char.category}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  style={styles.charItem}
                  onPress={() => router.push("/avatar-creator")}
                  testID="explore-avatar-creator"
                >
                  <View style={[styles.charAvatarWrap, { borderColor: colors.border, borderStyle: "dashed" }]}>
                    <View style={[styles.charAvatarPlaceholder, { backgroundColor: colors.muted }]}>
                      <MaterialCommunityIcons name="face-man-shimmer" size={28} color={colors.primary} />
                    </View>
                  </View>
                  <Text style={[styles.charName, { color: colors.foreground }]} numberOfLines={1}>
                    My Avatar
                  </Text>
                  <Text style={[styles.charCategory, { color: colors.mutedForeground }]} numberOfLines={1}>
                    Customize
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          )}
          renderItem={({ item, index }) => {
            const isLarge = index % 7 === 0 || index % 7 === 5;
            return (
              <Pressable
                style={[
                  styles.cell,
                  isLarge && { width: CELL * 2 + 1.5, height: CELL * 2 + 1.5 },
                ]}
                testID={`explore-post-${item.id}`}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={[
                    styles.cellImage,
                    isLarge && { width: CELL * 2 + 1.5, height: CELL * 2 + 1.5 },
                  ]}
                  resizeMode="cover"
                />
                {item.isReel && (
                  <View style={styles.reelBadge}>
                    <Ionicons name="play" size={12} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={allImages.length > 0}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 36,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: 36,
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 12,
    marginTop: 16,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 14,
  },
  tagIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  tagName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  tagPosts: {
    fontSize: 12,
    marginTop: 2,
  },
  tagsSection: {},
  aiStudioBanner: {
    marginHorizontal: 0,
    marginBottom: 20,
    borderRadius: 18,
    overflow: "hidden",
  },
  aiStudioGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
  },
  aiStudioLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  aiStudioEmoji: { fontSize: 32 },
  aiStudioTitle: { color: "#fff", fontSize: 16, fontWeight: "800", marginBottom: 2 },
  aiStudioSub: { color: "rgba(255,255,255,0.65)", fontSize: 12 },
  aiStudioRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiStudioBadge: { color: "#00C9A7", fontSize: 11, fontWeight: "800", backgroundColor: "rgba(0,201,167,0.15)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  sectionBlock: {
    marginBottom: 20,
    paddingHorizontal: 0,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  creatorScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  creatorCard: {
    width: 110,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    gap: 4,
    position: "relative",
  },
  creatorBadge: {
    position: "absolute",
    top: 6,
    right: 8,
    fontSize: 14,
  },
  creatorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 4,
  },
  creatorName: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  creatorEarnings: {
    fontSize: 11,
    fontWeight: "700" as const,
  },
  tipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 4,
  },
  tipBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700" as const,
  },
  challengesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
  },
  challengeCard: {
    width: (width - 42) / 2,
    height: 90,
    borderRadius: 16,
    overflow: "hidden",
  },
  challengeGradient: {
    flex: 1,
    padding: 14,
    justifyContent: "flex-end",
  },
  challengeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  challengeTag: {
    color: "#fff",
    fontWeight: "700" as const,
    fontSize: 13,
  },
  challengePosts: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    marginTop: 2,
  },
  reelScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  reelCard: {
    width: 130,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  reelThumb: {
    width: "100%",
    height: "100%",
  },
  reelOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  reelPlays: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700" as const,
  },
  reelUser: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
  },
  userResult: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 14,
  },
  resultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ccc",
  },
  resultUsername: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  resultFollowers: {
    fontSize: 12,
    marginTop: 2,
  },
  gridContent: {},
  row: {
    gap: 1.5,
    marginBottom: 1.5,
  },
  cell: {
    width: CELL,
    height: CELL,
    position: "relative",
  },
  cellImage: {
    width: CELL,
    height: CELL,
    backgroundColor: "#e0e0e0",
  },
  reelBadge: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  charactersSection: {
    width: "100%",
    paddingBottom: 12,
    paddingTop: 4,
  },
  charactersSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  charactersSectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  charactersSectionTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  charactersScroll: {
    paddingHorizontal: 12,
    gap: 14,
  },
  charItem: {
    alignItems: "center",
    width: 64,
    gap: 4,
  },
  charAvatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    position: "relative",
    overflow: "visible",
  },
  charAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ddd",
    margin: 2,
  },
  charAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    margin: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  aiBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    zIndex: 1,
  },
  aiBadgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "800" as const,
  },
  charName: {
    fontSize: 11,
    fontWeight: "600" as const,
    textAlign: "center",
    width: 64,
  },
  charCategory: {
    fontSize: 10,
    textAlign: "center",
    width: 64,
  },
});
