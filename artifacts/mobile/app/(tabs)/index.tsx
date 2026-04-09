import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FeedSkeleton } from "@/components/SkeletonLoader";
import { PostCard } from "@/components/PostCard";
import { StoryCircle } from "@/components/StoryCircle";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useInitialLoad } from "@/hooks/useInitialLoad";

type FeedTab = "forYou" | "following";

function scorePost(post: { likes: number; comments: number; timestamp: number; isFollowing?: boolean }) {
  const recency = Math.max(0, 1 - (Date.now() - post.timestamp) / (1000 * 60 * 60 * 48));
  const engagement = Math.log1p(post.likes + post.comments * 2) / 10;
  return recency * 0.5 + engagement * 0.5;
}

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { stories, posts, likePost, savePost, unreadMessages, unreadNotifications } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [feedTab, setFeedTab] = useState<FeedTab>("forYou");
  const initialLoading = useInitialLoad();
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;

  const sortedPosts = useMemo(() => {
    if (feedTab === "following") return [...posts].filter((_, i) => i % 2 === 0);
    return [...posts].sort((a, b) => scorePost({ likes: b.likes, comments: Array.isArray(b.comments) ? b.comments.length : 0, timestamp: b.timestamp }) - scorePost({ likes: a.likes, comments: Array.isArray(a.comments) ? a.comments.length : 0, timestamp: a.timestamp }));
  }, [posts, feedTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRefreshing(false);
  };

  const switchTab = (t: FeedTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFeedTab(t);
  };

  const ListHeader = () => (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.storiesScroll, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
        contentContainerStyle={styles.storiesContent}
      >
        {stories.map((story) => (
          <StoryCircle
            key={story.id}
            story={story}
            onPress={() => router.push({ pathname: "/story/[id]", params: { id: story.id } })}
            showAddButton={story.userId === "me"}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { top: headerTop, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.logo, { color: colors.foreground }]}>Vibe</Text>
        <View style={styles.feedTabs}>
          <Pressable onPress={() => switchTab("forYou")} style={[styles.feedTab, { borderBottomColor: feedTab === "forYou" ? colors.primary : "transparent" }]}>
            <Text style={[styles.feedTabText, { color: feedTab === "forYou" ? colors.foreground : colors.mutedForeground }]}>For You</Text>
          </Pressable>
          <Pressable onPress={() => switchTab("following")} style={[styles.feedTab, { borderBottomColor: feedTab === "following" ? colors.primary : "transparent" }]}>
            <Text style={[styles.feedTabText, { color: feedTab === "following" ? colors.foreground : colors.mutedForeground }]}>Following</Text>
          </Pressable>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerIcon} onPress={() => router.push("/notifications")} testID="notif-icon">
            <Ionicons name="heart-outline" size={26} color={colors.foreground} />
            {unreadNotifications > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.notificationBadge }]}>
                <Text style={styles.badgeText}>{unreadNotifications > 9 ? "9+" : unreadNotifications}</Text>
              </View>
            )}
          </Pressable>
          <Pressable onPress={() => router.push("/(tabs)/messages")} testID="messages-icon">
            <Feather name="send" size={24} color={colors.foreground} />
            {unreadMessages > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.notificationBadge }]}>
                <Text style={styles.badgeText}>{unreadMessages > 9 ? "9+" : unreadMessages}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {initialLoading ? (
        <FeedSkeleton />
      ) : (
        <FlatList
          data={sortedPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onLike={() => likePost(item.id)}
              onSave={() => savePost(item.id)}
              onComment={() => {}}
              onUserPress={() => {}}
            />
          )}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={[styles.listContent, { paddingTop: headerTop + 50, paddingBottom: isWeb ? 84 + 34 : 90 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
          scrollEnabled={posts.length > 0}
        />
      )}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    height: 50,
    borderBottomWidth: 1,
  },
  logo: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  feedTabs: { flexDirection: "row", gap: 0 },
  feedTab: { paddingHorizontal: 12, height: 50, justifyContent: "center", borderBottomWidth: 2 },
  feedTabText: { fontSize: 14, fontWeight: "700" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 14 },
  headerIcon: { position: "relative" },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" as const },
  storiesScroll: { backgroundColor: "transparent" },
  storiesContent: { paddingHorizontal: 8, paddingVertical: 12 },
  listContent: {},
});
