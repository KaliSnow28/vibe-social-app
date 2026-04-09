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
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const REFERRAL_CODE = "VIBE-XJ92K";
const REFERRAL_LINK = "https://vibeapp.io/join?ref=VIBE-XJ92K";

const REFERRAL_REWARDS = [
  { milestone: 1,  gems: 50,   label: "First Invite",   done: true  },
  { milestone: 3,  gems: 150,  label: "Social Starter",  done: true  },
  { milestone: 5,  gems: 300,  label: "Connector",       done: false },
  { milestone: 10, gems: 700,  label: "Influencer",      done: false },
  { milestone: 25, gems: 2000, label: "Ambassador",      done: false },
  { milestone: 50, gems: 5000, label: "Vibe Legend",     done: false },
];

const INVITED_FRIENDS = [
  { id:"f1", name:"Jasmine Cole",  avatar:"https://i.pravatar.cc/60?img=32", joinedDays:3,  gems:50,  status:"joined" },
  { id:"f2", name:"Marcus Webb",   avatar:"https://i.pravatar.cc/60?img=53", joinedDays:7,  gems:50,  status:"joined" },
  { id:"f3", name:"Sara Kim",      avatar:"https://i.pravatar.cc/60?img=26", joinedDays:null, gems:0, status:"pending" },
];

export default function ReferralScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;
  const [copied, setCopied] = useState(false);
  const totalGems = INVITED_FRIENDS.filter(f => f.status === "joined").length * 50;
  const inviteCount = INVITED_FRIENDS.filter(f => f.status === "joined").length;

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({ message: `Join me on Vibe — the best social app around! Use my code ${REFERRAL_CODE} and we both get 50 gems 💎\n${REFERRAL_LINK}`, url: REFERRAL_LINK });
    } catch {
      Alert.alert("Share", REFERRAL_LINK);
    }
  };

  const handleCopy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert("Copied!", `${REFERRAL_CODE} copied to clipboard.`);
  };

  const nextMilestone = REFERRAL_REWARDS.find(r => !r.done);
  const progress = nextMilestone ? Math.min(inviteCount / nextMilestone.milestone, 1) : 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#0d0d1a","#1a0533"]} style={[styles.header, { paddingTop: headerTop + 8, paddingBottom: 16 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Invite & Earn</Text>
          <View style={{ width: 22 }} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

        {/* Hero */}
        <LinearGradient colors={["#E1306C","#833AB4"]} style={styles.hero}>
          <Text style={styles.heroEmoji}>🎁</Text>
          <Text style={styles.heroTitle}>Invite Friends, Earn Gems</Text>
          <Text style={styles.heroSub}>You get 50 💎 for every friend who joins Vibe using your code. They get 50 gems too!</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{inviteCount}</Text>
              <Text style={styles.heroStatLabel}>Invited</Text>
            </View>
            <View style={[styles.heroStatDivider]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{totalGems}</Text>
              <Text style={styles.heroStatLabel}>Gems Earned</Text>
            </View>
            <View style={[styles.heroStatDivider]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{INVITED_FRIENDS.filter(f=>f.status==="pending").length}</Text>
              <Text style={styles.heroStatLabel}>Pending</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Referral Code */}
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Referral Code</Text>
          <View style={[styles.codeBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.code, { color: colors.primary }]}>{REFERRAL_CODE}</Text>
            <Pressable onPress={handleCopy} style={[styles.copyBtn, { backgroundColor: colors.muted }]}>
              <Feather name={copied ? "check" : "copy"} size={16} color={copied ? "#4CAF50" : colors.foreground} />
              <Text style={[styles.copyText, { color: copied ? "#4CAF50" : colors.foreground }]}>{copied ? "Copied!" : "Copy"}</Text>
            </Pressable>
          </View>
          <View style={[styles.linkBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.linkText, { color: colors.mutedForeground }]} numberOfLines={1}>{REFERRAL_LINK}</Text>
          </View>
          <View style={styles.shareRow}>
            {[
              { label:"Share Link", icon:"share-2", onPress:handleShare, primary:true },
              { label:"WhatsApp",   icon:"message-circle", onPress:handleShare },
              { label:"Instagram",  icon:"instagram", onPress:handleShare },
              { label:"SMS",        icon:"phone", onPress:handleShare },
            ].map((btn) => (
              <Pressable key={btn.label} onPress={btn.onPress}
                style={[styles.shareBtn, { backgroundColor: btn.primary ? colors.primary : colors.muted, borderColor: colors.border, flex: btn.primary ? 2 : 1 }]}>
                <Feather name={btn.icon as never} size={15} color={btn.primary ? "#fff" : colors.foreground} />
                <Text style={[styles.shareBtnText, { color: btn.primary ? "#fff" : colors.foreground }]}>{btn.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Progress to next milestone */}
          {nextMilestone && (
            <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressTitle, { color: colors.foreground }]}>Next Reward: {nextMilestone.gems.toLocaleString()} 💎</Text>
                <Text style={[styles.progressSub, { color: colors.mutedForeground }]}>{inviteCount}/{nextMilestone.milestone} invites</Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: colors.muted }]}>
                <LinearGradient colors={["#E1306C","#833AB4"]} start={{x:0,y:0}} end={{x:1,y:0}}
                  style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>{nextMilestone.label} milestone — {nextMilestone.milestone - inviteCount} more to go</Text>
            </View>
          )}

          {/* Rewards */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Milestone Rewards</Text>
          {REFERRAL_REWARDS.map((r) => (
            <View key={r.milestone} style={[styles.rewardRow, { backgroundColor: colors.card, borderColor: colors.border, opacity: r.done ? 1 : 0.7 }]}>
              <View style={[styles.rewardIcon, { backgroundColor: r.done ? "#4CAF5020" : colors.muted }]}>
                {r.done ? <Ionicons name="checkmark-circle" size={20} color="#4CAF50" /> : <Text style={styles.rewardNum}>{r.milestone}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rewardLabel, { color: colors.foreground }]}>{r.label}</Text>
                <Text style={[styles.rewardMeta, { color: colors.mutedForeground }]}>{r.milestone} friends joined</Text>
              </View>
              <View style={styles.rewardGems}>
                <Text style={styles.rewardGemsText}>{r.gems.toLocaleString()} 💎</Text>
              </View>
            </View>
          ))}

          {/* Invited friends */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Friends You Invited</Text>
          {INVITED_FRIENDS.map((f) => (
            <View key={f.id} style={[styles.friendRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image source={{ uri: f.avatar }} style={styles.friendAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.friendName, { color: colors.foreground }]}>{f.name}</Text>
                <Text style={[styles.friendMeta, { color: colors.mutedForeground }]}>
                  {f.status === "joined" ? `Joined ${f.joinedDays} days ago` : "Invite pending..."}
                </Text>
              </View>
              <View style={[styles.friendStatus, { backgroundColor: f.status === "joined" ? "#4CAF5020" : "#F7931A20" }]}>
                <Text style={{ color: f.status === "joined" ? "#4CAF50" : "#F7931A", fontSize: 12, fontWeight: "700" }}>
                  {f.status === "joined" ? `+${f.gems} 💎` : "Pending"}
                </Text>
              </View>
            </View>
          ))}

          <View style={[styles.howCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.howTitle, { color: colors.foreground }]}>How it works</Text>
            {[
              "Share your code with friends",
              "They sign up using your code",
              "Both of you get 50 gems instantly",
              "Reach milestones for bonus rewards",
            ].map((s, i) => (
              <View key={i} style={styles.howRow}>
                <View style={[styles.howNum, { backgroundColor: colors.primary }]}><Text style={styles.howNumText}>{i+1}</Text></View>
                <Text style={[styles.howText, { color: colors.foreground }]}>{s}</Text>
              </View>
            ))}
          </View>
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
  hero: { padding: 24, alignItems: "center" },
  heroEmoji: { fontSize: 48, marginBottom: 10 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 8 },
  heroSub: { color: "rgba(255,255,255,0.75)", fontSize: 13, textAlign: "center", lineHeight: 19, marginBottom: 20 },
  heroStats: { flexDirection: "row", alignItems: "center", gap: 0 },
  heroStat: { alignItems: "center", paddingHorizontal: 20 },
  heroStatVal: { color: "#fff", fontSize: 24, fontWeight: "900" },
  heroStatLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 2 },
  heroStatDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.25)" },
  content: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginTop: 20, marginBottom: 12 },
  codeBox: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 12 },
  code: { flex: 1, fontSize: 20, fontWeight: "900", letterSpacing: 2 },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  copyText: { fontSize: 13, fontWeight: "600" },
  linkBox: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 16 },
  linkText: { fontSize: 12 },
  shareRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  shareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 12, paddingVertical: 12, borderWidth: 1 },
  shareBtnText: { fontSize: 12, fontWeight: "600" },
  progressCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  progressTitle: { fontSize: 14, fontWeight: "700" },
  progressSub: { fontSize: 12 },
  progressBarBg: { borderRadius: 10, height: 8, marginBottom: 8 },
  progressBarFill: { borderRadius: 10, height: 8 },
  progressLabel: { fontSize: 12 },
  rewardRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  rewardIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  rewardNum: { fontSize: 14, fontWeight: "800", color: "#888" },
  rewardLabel: { fontSize: 14, fontWeight: "700" },
  rewardMeta: { fontSize: 11, marginTop: 2 },
  rewardGems: { backgroundColor: "#F7931A20", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  rewardGemsText: { color: "#F7931A", fontSize: 13, fontWeight: "800" },
  friendRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  friendAvatar: { width: 42, height: 42, borderRadius: 21 },
  friendName: { fontSize: 14, fontWeight: "700" },
  friendMeta: { fontSize: 12, marginTop: 2 },
  friendStatus: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  howCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 8 },
  howTitle: { fontSize: 15, fontWeight: "800", marginBottom: 14 },
  howRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  howNum: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  howNumText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  howText: { fontSize: 14, flex: 1 },
});
