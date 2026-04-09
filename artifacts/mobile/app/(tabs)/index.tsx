import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
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
import { PostCard } from "@/components/PostCard";
import { StoryCircle } from "@/components/StoryCircle";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { stories, posts, likePost, savePost, unreadMessages, unreadNotifications } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const isWeb = Platform.OS === "web";

  const headerTop = isWeb ? 67 : insets.top;

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRefreshing(false);
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
            onPress={() => router.push(`/story/${story.id}` as any)}
            showAddButton={story.userId === "me"}
          />
        ))}
      </ScrollView>
    </View>
  );

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
        <Text style={[styles.logo, { color: colors.foreground }]}>Vibe</Text>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.headerIcon}
            onPress={() => router.push("/notifications" as any)}
            testID="notif-icon"
          >
            <Ionicons name="heart-outline" size={26} color={colors.foreground} />
            {unreadNotifications > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.notificationBadge }]}>
                <Text style={styles.badgeText}>
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={() => router.push("/(tabs)/messages" as any)}
            testID="messages-icon"
          >
            <Feather name="send" size={24} color={colors.foreground} />
            {unreadMessages > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.notificationBadge }]}>
                <Text style={styles.badgeText}>
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <FlatList
        data={posts}
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
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerTop + 50,
            paddingBottom: isWeb ? 84 + 34 : 90,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        scrollEnabled={posts.length > 0}
      />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 50,
    borderBottomWidth: 1,
  },
  logo: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIcon: {
    position: "relative",
  },
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
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800" as const,
  },
  storiesScroll: {
    backgroundColor: "transparent",
  },
  storiesContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  listContent: {},
});
