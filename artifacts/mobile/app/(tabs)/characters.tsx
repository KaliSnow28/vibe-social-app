import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { useCharacters } from "@/context/CharacterContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const CATEGORIES = ["All", "Companion", "Friend", "Coach", "Anime", "Education", "Wellness"];

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export default function CharactersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { characters } = useCharacters();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;

  const filtered = characters.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    return matchSearch && matchCat;
  });

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
        <Text style={[styles.title, { color: colors.foreground }]}>Characters</Text>
        <Pressable
          style={[styles.avatarBtn, { backgroundColor: colors.muted, borderRadius: colors.radius }]}
          onPress={() => router.push("/avatar-creator" as any)}
          testID="open-avatar-creator"
        >
          <MaterialCommunityIcons name="face-man-shimmer" size={18} color={colors.primary} />
          <Text style={[styles.avatarBtnText, { color: colors.primary }]}>My Avatar</Text>
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerTop + 58,
            paddingBottom: isWeb ? 84 + 34 : 90,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            <Pressable
              style={[
                styles.featuredBanner,
                { backgroundColor: colors.primary + "18", borderColor: colors.primary + "30", borderRadius: colors.radius + 4 },
              ]}
              onPress={() => router.push(`/character-chat/${characters[0].id}` as any)}
              testID="featured-character"
            >
              <View style={styles.featuredLeft}>
                <Text style={[styles.featuredBadge, { color: colors.primary }]}>⭐ FEATURED</Text>
                <Text style={[styles.featuredName, { color: colors.foreground }]}>
                  {characters[0].emoji} {characters[0].name}
                </Text>
                <Text style={[styles.featuredDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {characters[0].description}
                </Text>
                <View style={[styles.featuredStartBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}>
                  <Text style={styles.featuredStartText}>Start Chatting</Text>
                </View>
              </View>
              <Image source={{ uri: characters[0].avatar }} style={styles.featuredAvatar} />
            </Pressable>

            <View
              style={[
                styles.searchBar,
                { backgroundColor: colors.muted, borderRadius: colors.radius, marginBottom: 12 },
              ]}
            >
              <Feather name="search" size={15} color={colors.mutedForeground} />
              <TextInput
                placeholder="Search characters..."
                placeholderTextColor={colors.mutedForeground}
                value={search}
                onChangeText={setSearch}
                style={[styles.searchInput, { color: colors.foreground }]}
                testID="character-search"
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categories}
            >
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor:
                        activeCategory === cat ? colors.primary : colors.muted,
                      borderRadius: 20,
                    },
                  ]}
                  onPress={() => {
                    setActiveCategory(cat);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text
                    style={[
                      styles.catText,
                      { color: activeCategory === cat ? "#fff" : colors.foreground },
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {activeCategory === "All" ? "All Characters" : activeCategory}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.charCard,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius + 2 },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/character-chat/${item.id}` as any);
            }}
            testID={`character-${item.id}`}
          >
            <Image source={{ uri: item.avatar }} style={styles.charAvatar} />
            <View style={styles.charInfo}>
              <View style={styles.charNameRow}>
                <Text style={[styles.charEmoji]}>{item.emoji}</Text>
                <Text style={[styles.charName, { color: colors.foreground }]}>{item.name}</Text>
                <View style={[styles.catBadge, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={[styles.catBadgeText, { color: colors.primary }]}>
                    {item.category}
                  </Text>
                </View>
              </View>
              <Text style={[styles.charDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.charStats}>
                <View style={styles.charStat}>
                  <Ionicons name="chatbubbles-outline" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.charStatText, { color: colors.mutedForeground }]}>
                    {formatCount(item.chats)}
                  </Text>
                </View>
                <View style={styles.charStat}>
                  <Ionicons name="heart-outline" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.charStatText, { color: colors.mutedForeground }]}>
                    {formatCount(item.likes)}
                  </Text>
                </View>
                <View style={styles.charStat}>
                  <Ionicons name="mic-outline" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.charStatText, { color: colors.mutedForeground }]}>
                    {item.voiceStyle}
                  </Text>
                </View>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        )}
        scrollEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  avatarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  avatarBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  featuredBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  featuredLeft: {
    flex: 1,
    marginRight: 12,
  },
  featuredBadge: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  featuredName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  featuredStartBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  featuredStartText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700" as const,
  },
  featuredAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ddd",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: 40,
  },
  categories: {
    paddingBottom: 12,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  catText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    marginTop: 4,
  },
  charCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  charAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#ddd",
  },
  charInfo: {
    flex: 1,
    gap: 4,
  },
  charNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  charEmoji: {
    fontSize: 16,
  },
  charName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  charDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  charStats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },
  charStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  charStatText: {
    fontSize: 11,
  },
});
