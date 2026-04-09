import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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

const REACTIONS = ["❤️", "😂", "😍", "😮", "😢", "🔥", "👏"];

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
  const pickerScale = useRef(new Animated.Value(0)).current;
  const pickerOpacity = useRef(new Animated.Value(0)).current;

  const [lastTap, setLastTap] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({
    "❤️": 48,
    "😂": 12,
    "😍": 23,
    "🔥": 8,
  });

  const openReactionPicker = () => {
    setShowReactions(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pickerScale.setValue(0.6);
    pickerOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(pickerScale, {
        toValue: 1,
        damping: 12,
        useNativeDriver: true,
      }),
      Animated.timing(pickerOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeReactionPicker = () => {
    Animated.parallel([
      Animated.timing(pickerScale, {
        toValue: 0.8,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(pickerOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => setShowReactions(false));
  };

  const pickReaction = (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReactionCounts((prev) => {
      const next = { ...prev };
      if (myReaction && myReaction !== emoji) {
        next[myReaction] = Math.max(0, (next[myReaction] ?? 1) - 1);
        if (next[myReaction] === 0) delete next[myReaction];
      }
      if (myReaction === emoji) {
        next[emoji] = Math.max(0, (next[emoji] ?? 1) - 1);
        if (next[emoji] === 0) delete next[emoji];
        setMyReaction(null);
      } else {
        next[emoji] = (next[emoji] ?? 0) + 1;
        setMyReaction(emoji);
      }
      return next;
    });
    closeReactionPicker();
    if (!post.liked && myReaction === null) onLike();
  };

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

  const topReactions = Object.entries(reactionCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

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
              pointerEvents: "none",
            },
          ]}
        >
          <Ionicons name="heart" size={90} color="#fff" />
        </Animated.View>
      </Pressable>

      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <View style={styles.likeContainer}>
            <Pressable
              onPress={handleLikePress}
              onLongPress={openReactionPicker}
              delayLongPress={400}
              style={styles.actionBtn}
              testID={`post-like-${post.id}`}
            >
              <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                {myReaction ? (
                  <Text style={styles.reactionIcon}>{myReaction}</Text>
                ) : (
                  <Ionicons
                    name={post.liked ? "heart" : "heart-outline"}
                    size={26}
                    color={post.liked ? colors.like : colors.foreground}
                  />
                )}
              </Animated.View>
            </Pressable>

            {showReactions && (
              <Animated.View
                style={[
                  styles.reactionPicker,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: pickerOpacity,
                    transform: [{ scale: pickerScale }],
                  },
                ]}
              >
                {REACTIONS.map((emoji) => (
                  <Pressable
                    key={emoji}
                    onPress={() => pickReaction(emoji)}
                    style={[
                      styles.reactionPickerItem,
                      myReaction === emoji && {
                        backgroundColor: colors.primary + "20",
                        borderRadius: 16,
                      },
                    ]}
                    testID={`reaction-${emoji}`}
                  >
                    <Text style={styles.reactionPickerEmoji}>{emoji}</Text>
                  </Pressable>
                ))}
              </Animated.View>
            )}
          </View>

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
          <Pressable
            style={[styles.actionBtn, styles.tipBtn, { backgroundColor: colors.primary + "15" }]}
            onPress={() =>
              router.push({
                pathname: "/send-tip" as any,
                params: {
                  creatorId: post.userId,
                  creatorName: post.username,
                  postId: post.id,
                },
              })
            }
            testID={`post-tip-${post.id}`}
          >
            <Ionicons name="heart" size={14} color={colors.primary} />
            <Text style={[styles.tipBtnText, { color: colors.primary }]}>Tip</Text>
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

      {showReactions && (
        <Pressable style={styles.reactionBackdrop} onPress={closeReactionPicker} />
      )}

      <View style={styles.info}>
        {topReactions.length > 0 && (
          <Pressable style={styles.reactionsRow} onPress={openReactionPicker} testID="reactions-row">
            <View style={styles.reactionBubbles}>
              {topReactions.map(([emoji]) => (
                <Text key={emoji} style={styles.reactionBubbleEmoji}>{emoji}</Text>
              ))}
            </View>
            <Text style={[styles.reactionTotal, { color: colors.mutedForeground }]}>
              {formatCount(topReactions.reduce((acc, [, c]) => acc + c, 0) + post.likes)}
            </Text>
          </Pressable>
        )}
        {topReactions.length === 0 && (
          <Text style={[styles.likes, { color: colors.foreground }]}>
            {formatCount(post.likes)} likes
          </Text>
        )}
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
  likeContainer: {
    position: "relative",
    zIndex: 10,
  },
  actionBtn: {
    marginRight: 14,
  },
  tipBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
    marginRight: 0,
  },
  tipBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  reactionIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  reactionPicker: {
    position: "absolute",
    bottom: 40,
    left: -8,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 32,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 2,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.15)" },
    }),
  },
  reactionPickerItem: {
    padding: 4,
  },
  reactionPickerEmoji: {
    fontSize: 26,
  },
  reactionBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9,
  },
  info: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  reactionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  reactionBubbles: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 1,
  },
  reactionBubbleEmoji: {
    fontSize: 14,
  },
  reactionTotal: {
    fontSize: 13,
    fontWeight: "600" as const,
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
