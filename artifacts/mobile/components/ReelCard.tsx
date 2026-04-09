import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { Post } from "@/context/AppContext";

const { width, height } = Dimensions.get("window");
const REEL_HEIGHT = height;

interface ReelCardProps {
  post: Post;
  onLike: () => void;
}

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export function ReelCard({ post, onLike }: ReelCardProps) {
  const colors = useColors();
  const [following, setFollowing] = useState(false);
  const [localLiked, setLocalLiked] = useState(post.liked);
  const likeScale = useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    Animated.sequence([
      Animated.spring(likeScale, { toValue: 1.4, useNativeDriver: true, damping: 5 }),
      Animated.spring(likeScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLocalLiked((v) => !v);
    onLike();
  };

  const handleFollow = () => {
    setFollowing((v) => !v);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { height: REEL_HEIGHT, backgroundColor: "#000" }]}>
      <Image
        source={{ uri: post.imageUrl }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.2)" }]} />

      <View style={styles.rightActions}>
        <Pressable onPress={handleLike} style={styles.actionItem} testID={`reel-like-${post.id}`}>
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <Ionicons
              name={localLiked ? "heart" : "heart-outline"}
              size={30}
              color={localLiked ? "#ed4956" : "#fff"}
            />
          </Animated.View>
          <Text style={styles.actionCount}>{formatCount(post.likes + (localLiked ? 1 : 0))}</Text>
        </Pressable>

        <Pressable style={styles.actionItem} testID={`reel-comment-${post.id}`}>
          <Ionicons name="chatbubble-outline" size={28} color="#fff" />
          <Text style={styles.actionCount}>{formatCount(post.commentsCount)}</Text>
        </Pressable>

        <Pressable style={styles.actionItem} testID={`reel-share-${post.id}`}>
          <Feather name="send" size={26} color="#fff" />
          <Text style={styles.actionCount}>Share</Text>
        </Pressable>

        <Pressable style={styles.actionItem} testID={`reel-save-${post.id}`}>
          <MaterialCommunityIcons name="bookmark-outline" size={28} color="#fff" />
        </Pressable>

        <Pressable style={styles.actionItem}>
          <Feather name="more-vertical" size={22} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.bottomInfo}>
        <View style={styles.userRow}>
          <Image source={{ uri: post.avatar }} style={styles.avatar} />
          <Text style={styles.username}>{post.username}</Text>
          {post.isVerified && (
            <Ionicons name="checkmark-circle" size={14} color="#3897f0" style={{ marginLeft: 2 }} />
          )}
          <Pressable
            style={[
              styles.followBtn,
              { borderColor: following ? "transparent" : "#fff", backgroundColor: following ? "rgba(255,255,255,0.2)" : "transparent" },
            ]}
            onPress={handleFollow}
          >
            <Text style={styles.followBtnText}>{following ? "Following" : "Follow"}</Text>
          </Pressable>
        </View>
        <Text style={styles.caption} numberOfLines={2}>
          {post.caption}
        </Text>
        <View style={styles.audioRow}>
          <Ionicons name="musical-notes" size={14} color="#fff" />
          <Text style={styles.audioText}>Original audio · {post.username}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    position: "relative",
  },
  rightActions: {
    position: "absolute",
    right: 12,
    bottom: 130,
    alignItems: "center",
  },
  actionItem: {
    alignItems: "center",
    marginBottom: 20,
  },
  actionCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600" as const,
    marginTop: 4,

  },
  bottomInfo: {
    position: "absolute",
    left: 12,
    right: 70,
    bottom: 80,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#ccc",
    marginRight: 8,
  },
  username: {
    color: "#fff",
    fontWeight: "700" as const,
    fontSize: 15,

  },
  followBtn: {
    marginLeft: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  followBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600" as const,
  },
  caption: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,

  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  audioText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 6,

  },
});
