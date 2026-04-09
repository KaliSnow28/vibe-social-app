import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

interface ScheduledPost {
  id: string;
  image: string;
  caption: string;
  scheduledFor: string;
  platform: string[];
  type: "post" | "reel" | "story";
  status: "scheduled" | "draft" | "published";
}

const SCHEDULED_POSTS: ScheduledPost[] = [
  { id:"sp1", image:"https://picsum.photos/seed/s1/300/300", caption:"Morning vibes ✨ Starting the week right with some good energy and great coffee! #MondayMotivation", scheduledFor:"Today · 9:00 AM",  platform:["Feed","Stories"], type:"post",  status:"scheduled" },
  { id:"sp2", image:"https://picsum.photos/seed/s2/300/300", caption:"Behind the scenes of my latest project 🎬 Can't wait to share the full thing with you all!", scheduledFor:"Today · 3:00 PM",  platform:["Reels"],          type:"reel",  status:"scheduled" },
  { id:"sp3", image:"https://picsum.photos/seed/s3/300/300", caption:"New collection drop tomorrow 👀 Stay tuned for something special...",                              scheduledFor:"Tomorrow · 10:00 AM",platform:["Feed"],           type:"post",  status:"scheduled" },
  { id:"sp4", image:"https://picsum.photos/seed/s4/300/300", caption:"Flash sale ends in 24 hours! 🔥 Up to 40% off everything in my store.",                          scheduledFor:"Tomorrow · 6:00 PM", platform:["Feed","Stories"], type:"post",  status:"draft"     },
  { id:"sp5", image:"https://picsum.photos/seed/s5/300/300", caption:"Weekly Q&A session — drop your questions below! 💬",                                              scheduledFor:"Friday · 7:00 PM",   platform:["Stories"],        type:"story", status:"draft"     },
];

const STATUS_COLORS = { scheduled: "#4CAF50", draft: "#F7931A", published: "#2196F3" };

export default function ScheduledPostsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;
  const [posts, setPosts] = useState(SCHEDULED_POSTS);
  const [filter, setFilter] = useState<"all" | "scheduled" | "draft">("all");

  const filtered = filter === "all" ? posts : posts.filter(p => p.status === filter);

  const handleDelete = (id: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this scheduled post?", [
      { text:"Cancel", style:"cancel" },
      { text:"Delete", style:"destructive", onPress:() => { setPosts(prev => prev.filter(p => p.id !== id)); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } },
    ]);
  };

  const handlePublish = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Published! 🎉", "Your post has been published immediately.");
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: "published" as const } : p));
  };

  const typeIcon = (type: string) => type === "reel" ? "film" : type === "story" ? "circle" : "image";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#0d0d1a","#1a0533"]} style={[styles.header, { paddingTop: headerTop + 8, paddingBottom: 0 }]}>
        <View style={[styles.headerRow, { marginBottom: 14 }]}>
          <Pressable onPress={() => router.back()}><Feather name="arrow-left" size={22} color="#fff" /></Pressable>
          <Text style={styles.headerTitle}>Scheduled Posts</Text>
          <Pressable onPress={() => Alert.alert("Schedule Post", "Select a photo or video, write your caption, then pick a date and time to post.")} style={styles.addBtn}>
            <Feather name="plus" size={18} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.filterRow}>
          {(["all","scheduled","draft"] as const).map((f) => (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterTab, { borderBottomColor: filter === f ? "#E1306C" : "transparent" }]}>
              <Text style={[styles.filterText, { color: filter === f ? "#fff" : "rgba(255,255,255,0.5)" }]}>{f.charAt(0).toUpperCase()+f.slice(1)}</Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label:"Scheduled", val: posts.filter(p=>p.status==="scheduled").length, color:"#4CAF50" },
            { label:"Drafts",    val: posts.filter(p=>p.status==="draft").length,     color:"#F7931A" },
            { label:"Published", val: posts.filter(p=>p.status==="published").length, color:"#2196F3" },
          ].map((s) => (
            <View key={s.label} style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No posts here</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Schedule your first post to keep your audience engaged</Text>
          </View>
        ) : (
          filtered.map((post) => (
            <View key={post.id} style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.postRow}>
                <Image source={{ uri: post.image }} style={styles.postThumb} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.postCaption, { color: colors.foreground }]} numberOfLines={2}>{post.caption}</Text>
                  <View style={styles.postMeta}>
                    <Feather name={typeIcon(post.type) as never} size={12} color={colors.mutedForeground} />
                    <Text style={[styles.postMetaText, { color: colors.mutedForeground }]}>{post.type.charAt(0).toUpperCase()+post.type.slice(1)}</Text>
                    <Text style={[styles.postMetaDot, { color: colors.mutedForeground }]}>·</Text>
                    <Text style={[styles.postMetaText, { color: colors.mutedForeground }]}>{post.platform.join(", ")}</Text>
                  </View>
                  <View style={styles.scheduleRow}>
                    <Feather name="clock" size={12} color={STATUS_COLORS[post.status]} />
                    <Text style={[styles.scheduleText, { color: STATUS_COLORS[post.status] }]}>{post.scheduledFor}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[post.status] + "20" }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[post.status] }]}>{post.status}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={[styles.postActions, { borderTopColor: colors.border }]}>
                <Pressable onPress={() => Alert.alert("Edit", "Edit this scheduled post's caption, time, or platforms.")}
                  style={[styles.postAction, { borderRightColor: colors.border }]}>
                  <Feather name="edit-2" size={14} color={colors.foreground} />
                  <Text style={[styles.postActionText, { color: colors.foreground }]}>Edit</Text>
                </Pressable>
                {post.status !== "published" && (
                  <Pressable onPress={() => handlePublish(post.id)}
                    style={[styles.postAction, { borderRightColor: colors.border }]}>
                    <Feather name="send" size={14} color="#4CAF50" />
                    <Text style={[styles.postActionText, { color: "#4CAF50" }]}>Publish Now</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => handleDelete(post.id)} style={styles.postAction}>
                  <Feather name="trash-2" size={14} color="#E1306C" />
                  <Text style={[styles.postActionText, { color: "#E1306C" }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        {/* Best Times */}
        <View style={[styles.bestTimesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.bestTimesTitle, { color: colors.foreground }]}>📈 Best Times to Post</Text>
          <Text style={[styles.bestTimesSub, { color: colors.mutedForeground }]}>Based on your audience's activity</Text>
          {[
            { day:"Monday",    times:"7–9 AM  ·  12–2 PM" },
            { day:"Wednesday", times:"6–8 PM  ·  9–10 PM" },
            { day:"Friday",    times:"5–7 PM  ·  8–10 PM" },
            { day:"Saturday",  times:"10 AM–12 PM" },
          ].map((b) => (
            <View key={b.day} style={[styles.bestTimeRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.bestDay, { color: colors.foreground }]}>{b.day}</Text>
              <Text style={[styles.bestTimes, { color: colors.mutedForeground }]}>{b.times}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  addBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#E1306C", alignItems: "center", justifyContent: "center" },
  filterRow: { flexDirection: "row" },
  filterTab: { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 2 },
  filterText: { fontSize: 13, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statBox: { flex: 1, alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1 },
  statVal: { fontSize: 22, fontWeight: "900" },
  statLabel: { fontSize: 11, marginTop: 2 },
  postCard: { borderRadius: 16, borderWidth: 1, marginBottom: 14, overflow: "hidden" },
  postRow: { flexDirection: "row", gap: 12, padding: 14 },
  postThumb: { width: 72, height: 72, borderRadius: 10 },
  postCaption: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  postMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  postMetaText: { fontSize: 11 },
  postMetaDot: { fontSize: 11 },
  scheduleRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  scheduleText: { fontSize: 12, fontWeight: "600" },
  statusBadge: { marginLeft: 6, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  postActions: { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth },
  postAction: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRightWidth: StyleSheet.hairlineWidth },
  postActionText: { fontSize: 12, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  emptySub: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  bestTimesCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 8 },
  bestTimesTitle: { fontSize: 15, fontWeight: "800", marginBottom: 4 },
  bestTimesSub: { fontSize: 12, marginBottom: 14 },
  bestTimeRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  bestDay: { fontSize: 14, fontWeight: "600" },
  bestTimes: { fontSize: 13 },
});
