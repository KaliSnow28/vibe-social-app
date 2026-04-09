import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { Post } from "@/context/AppContext";

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onSave: () => void;
  onComment?: () => void;
  onUserPress?: () => void;
}

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function PostCard({
  post,
  onLike,
  onSave,
  onComment,
  onUserPress,
}: PostCardProps) {
  const colors = useColors();
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const likeScale = useRef(new Animated.Value(1)).current;
  const [lastTap, setLastTap] = useState(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      if (!post.liked) {
        onLike();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      heartOpacity.setValue(1);
      heartScale.setValue(0);
      Animated.sequence([
        Animated.spring(heartScale, {
          toValue: 1.2,
          useNativeDriver: true,
          damping: 6,
        }),
        Animated.spring(heartScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.delay(600),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
    setLastTap(now);
  };

  const handleLikePress = () => {
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.3,
        useNativeDriver: true,
        damping: 5,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLike();
  };

  const handleSavePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.userInfo} onPress={onUserPress} testID={`post-user-${post.id}`}>
          <Image
            source={{ uri: post.avatar }}
            style={styles.avatar}
          />
          <View style={styles.userText}>
            <View style={styles.usernameRow}>
              <Text
                style={[styles.username, { color: colors.foreground }]}
              >
                {post.username}
              </Text>
              {post.isVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={colors.primary}
                  style={{ marginLeft: 3 }}
                />
              )}
            </View>
            {post.location && (
              <Text
                style={[styles.location, { color: colors.mutedForeground }]}
              >
                {post.location}
              </Text>
            )}
          </View>
        </Pressable>
        <Pressable hitSlop={12} testID={`post-more-${post.id}`}>
          <Feather name="more-horizontal" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      <Pressable onPress={handleDoubleTap} testID={`post-image-${post.id}`}>
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.postImage}
          resizeMode="cover"
        />
        <Animated.View
          style={[
            styles.heartOverlay,
            {
              opacity: heartOpacity,
              transform: [{ scale: heartScale }],
            },
          ]}
          pointerEvents="none"
        >
          <Ionicons name="heart" size={90} color="#fff" />
        </Animated.View>
      </Pressable>

      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <Pressable onPress={handleLikePress} style={styles.actionBtn} testID={`post-like-${post.id}`}>
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <Ionicons
                name={post.liked ? "heart" : "heart-outline"}
                size={26}
                color={post.liked ? colors.like : colors.foreground}
              />
            </Animated.View>
          </Pressable>
          <Pressable
            onPress={onComment}
            style={styles.actionBtn}
            testID={`post-comment-${post.id}`}
          >
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={colors.foreground}
            />
          </Pressable>
          <Pressable style={styles.actionBtn} testID={`post-share-${post.id}`}>
            <Feather name="send" size={22} color={colors.foreground} />
          </Pressable>
        </View>
        <Pressable onPress={handleSavePress} testID={`post-save-${post.id}`}>
          <MaterialCommunityIcons
            name={post.saved ? "bookmark" : "bookmark-outline"}
            size={26}
            color={colors.foreground}
          />
        </Pressable>
      </View>

      <View style={styles.info}>
        <Text style={[styles.likes, { color: colors.foreground }]}>
          {formatCount(post.likes)} likes
        </Text>
        <View style={styles.captionRow}>
          <Text style={[styles.captionUsername, { color: colors.foreground }]}>
            {post.username}
          </Text>
          <Text style={[styles.caption, { color: colors.foreground }]}>
            {" "}
            {post.caption}
          </Text>
        </View>
        {post.commentsCount > 0 && (
          <Pressable onPress={onComment}>
            <Text
              style={[styles.viewComments, { color: colors.mutedForeground }]}
            >
              View all {formatCount(post.commentsCount)} comments
            </Text>
          </Pressable>
        )}
        {post.comments.slice(0, 1).map((c) => (
          <View key={c.id} style={styles.commentRow}>
            <Text
              style={[styles.commentUsername, { color: colors.foreground }]}
            >
              {c.username}
            </Text>
            <Text style={[styles.commentText, { color: colors.foreground }]}>
              {" "}
              {c.text}
            </Text>
          </View>
        ))}
        <Text style={[styles.timestamp, { color: colors.mutedForeground }]}>
          {formatTime(post.timestamp)} ago
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ccc",
  },
  userText: {
    marginLeft: 10,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontWeight: "600" as const,
    fontSize: 14,
  },
  location: {
    fontSize: 11,
    marginTop: 1,
  },
  postImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#e0e0e0",
  },
  heartOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    marginRight: 14,
  },
  info: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  likes: {
    fontWeight: "600" as const,
    fontSize: 14,
    marginBottom: 4,
  },
  captionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  captionUsername: {
    fontWeight: "600" as const,
    fontSize: 14,
  },
  caption: {
    fontSize: 14,
  },
  viewComments: {
    fontSize: 13,
    marginBottom: 3,
  },
  commentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 2,
  },
  commentUsername: {
    fontWeight: "600" as const,
    fontSize: 13,
  },
  commentText: {
    fontSize: 13,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});
