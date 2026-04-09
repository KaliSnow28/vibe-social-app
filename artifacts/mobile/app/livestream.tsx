import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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

const { width, height } = Dimensions.get("window");

interface LiveComment {
  id: string;
  username: string;
  text: string;
  color: string;
}

interface LiveGift {
  id: string;
  username: string;
  gift: string;
  value: number;
}

const COMMENT_COLORS = ["#E1306C", "#833AB4", "#F7931A", "#4CAF50", "#00BCD4", "#FF9800"];

const MOCK_COMMENTS: LiveComment[] = [
  { id: "c1", username: "alex_creates", text: "🔥🔥 this is fire!", color: "#E1306C" },
  { id: "c2", username: "sarah.vibes", text: "omg hi!! 💕", color: "#833AB4" },
  { id: "c3", username: "marco_photo", text: "Best live ever", color: "#F7931A" },
  { id: "c4", username: "julia.world", text: "love you!! ❤️", color: "#4CAF50" },
  { id: "c5", username: "mia.art", text: "can you do a shoutout?", color: "#E1306C" },
];

const GIFTS = ["🌹", "👑", "💎", "🚀", "🦁", "⚡", "🎆", "💰"];

function makeId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 5);
}

export default function LivestreamScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const [live, setLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [duration, setDuration] = useState(0);
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [gifts, setGifts] = useState<LiveGift[]>([]);
  const [comment, setComment] = useState("");
  const [earning, setEarning] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const giftAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 600, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!live) return;
    const durationTimer = setInterval(() => setDuration((d) => d + 1), 1000);
    const viewerTimer = setInterval(() => setViewers((v) => Math.min(v + Math.floor(Math.random() * 8), 2400)), 2000);
    const commentTimer = setInterval(() => {
      const c = MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)];
      setComments((prev) => [...prev.slice(-29), { ...c, id: makeId() }]);
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 1800);
    const earningTimer = setInterval(() => {
      setEarning((e) => +(e + Math.random() * 0.5).toFixed(2));
    }, 3000);

    return () => {
      clearInterval(durationTimer);
      clearInterval(viewerTimer);
      clearInterval(commentTimer);
      clearInterval(earningTimer);
    };
  }, [live]);

  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`;
  };

  const handleGift = (gift: string) => {
    const newGift: LiveGift = {
      id: makeId(),
      username: "You",
      gift,
      value: [1, 5, 10, 25, 50, 100][Math.floor(Math.random() * 6)],
    };
    setGifts((prev) => [...prev.slice(-4), newGift]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(giftAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(giftAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const handleGoLive = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setLive(true);
    setViewers(3);
  };

  const handleSendComment = () => {
    if (!comment.trim()) return;
    setComments((prev) => [...prev.slice(-29), {
      id: makeId(),
      username: "you",
      text: comment,
      color: "#E1306C",
    }]);
    setComment("");
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1a0533", "#0d1a3a", "#000"]} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: (isWeb ? 67 : insets.top) + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={24} color="#fff" />
        </Pressable>

        {live && (
          <View style={styles.liveStats}>
            <Animated.View style={[styles.liveBadge, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.liveText}>LIVE</Text>
            </Animated.View>
            <View style={styles.viewersChip}>
              <Ionicons name="eye" size={14} color="#fff" />
              <Text style={styles.viewersText}>{viewers.toLocaleString()}</Text>
            </View>
            <Text style={styles.durationText}>{formatDuration(duration)}</Text>
          </View>
        )}

        <View style={styles.earningChip}>
          <MaterialCommunityIcons name="currency-usd" size={14} color="#4CAF50" />
          <Text style={styles.earningText}>${earning.toFixed(2)}</Text>
        </View>
      </View>

      {!live ? (
        <View style={styles.goLiveContainer}>
          <View style={styles.cameraPreview}>
            <Text style={styles.cameraEmoji}>📹</Text>
            <Text style={styles.cameraLabel}>Camera Preview</Text>
          </View>

          <View style={styles.goLiveInfo}>
            <Text style={styles.goLiveTitle}>Start Your Live</Text>
            <Text style={styles.goLiveSub}>Connect with your audience in real time. Earn coins from gifts!</Text>
          </View>

          <Pressable style={styles.goLiveBtn} onPress={handleGoLive}>
            <LinearGradient colors={["#E1306C", "#833AB4"]} style={styles.goLiveBtnGradient}>
              <Ionicons name="radio" size={22} color="#fff" />
              <Text style={styles.goLiveBtnText}>Go Live</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.cameraFull}>
            <Text style={styles.cameraFullEmoji}>📹</Text>
          </View>

          {gifts.length > 0 && (
            <Animated.View style={[styles.giftBanner, { opacity: giftAnim }]}>
              <Text style={styles.giftBannerText}>
                {gifts[gifts.length - 1]?.username} sent {gifts[gifts.length - 1]?.gift}
              </Text>
            </Animated.View>
          )}

          <View style={[styles.chatArea, { maxHeight: height * 0.35 }]}>
            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
              {comments.map((c) => (
                <View key={c.id} style={styles.commentRow}>
                  <Text style={[styles.commentUser, { color: c.color }]}>{c.username}</Text>
                  <Text style={styles.commentText}> {c.text}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.giftsRow}>
            {GIFTS.map((g) => (
              <Pressable key={g} onPress={() => handleGift(g)} style={styles.giftBtn}>
                <Text style={styles.giftEmoji}>{g}</Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.commentBar, { paddingBottom: (isWeb ? 34 : insets.bottom) + 8 }]}>
            <TextInput
              style={[styles.commentInput, { backgroundColor: "rgba(255,255,255,0.15)", color: "#fff" }]}
              placeholder="Say something..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={comment}
              onChangeText={setComment}
              onSubmitEditing={handleSendComment}
            />
            <Pressable style={styles.sendBtn} onPress={handleSendComment}>
              <Feather name="send" size={20} color="#fff" />
            </Pressable>
            <Pressable style={styles.endLiveBtn} onPress={() => { setLive(false); router.back(); }}>
              <Text style={styles.endLiveText}>End</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, zIndex: 10 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  liveStats: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveBadge: { backgroundColor: "#E1306C", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  liveText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  viewersChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  viewersText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  durationText: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  earningChip: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(76,175,80,0.25)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  earningText: { color: "#4CAF50", fontWeight: "700", fontSize: 13 },
  goLiveContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24, padding: 24 },
  cameraPreview: { width: width * 0.6, height: width * 0.6, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.15)" },
  cameraEmoji: { fontSize: 64 },
  cameraLabel: { color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 8 },
  goLiveInfo: { alignItems: "center" },
  goLiveTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  goLiveSub: { color: "rgba(255,255,255,0.6)", fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 },
  goLiveBtn: { width: "100%" },
  goLiveBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 18, paddingVertical: 18 },
  goLiveBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  cameraFull: { flex: 1, alignItems: "center", justifyContent: "center" },
  cameraFullEmoji: { fontSize: 80 },
  giftBanner: { position: "absolute", top: 120, alignSelf: "center", backgroundColor: "rgba(225,48,108,0.9)", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  giftBannerText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  chatArea: { paddingHorizontal: 16, paddingBottom: 8 },
  commentRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  commentUser: { fontSize: 13, fontWeight: "700" },
  commentText: { color: "#fff", fontSize: 13 },
  giftsRow: { flexDirection: "row", paddingHorizontal: 16, paddingBottom: 8, gap: 6 },
  giftBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  giftEmoji: { fontSize: 20 },
  commentBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8 },
  commentInput: { flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  endLiveBtn: { backgroundColor: "#E1306C", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 },
  endLiveText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
