import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

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

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { posts } = useApp();
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
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

      {focused && search.length > 0 ? (
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
});
