import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

const INTERESTS = [
  "Fashion","Fitness","Art","Music","Gaming","Travel","Food","Beauty",
  "Tech","Dance","Comedy","Nature","Sports","Photography","Wellness",
  "Crypto","Anime","Film","Books","Cooking",
];

const SUGGESTED_USERS = [
  { id:"u1", name:"Luna Starr",   handle:"lunastarr",   avatar:"https://i.pravatar.cc/80?img=1",  followers:"1.2M", category:"Fashion" },
  { id:"u2", name:"Alex Nova",    handle:"alexnova",    avatar:"https://i.pravatar.cc/80?img=8",  followers:"890K", category:"Fitness" },
  { id:"u3", name:"Mia Chen",     handle:"miachen",     avatar:"https://i.pravatar.cc/80?img=5",  followers:"542K", category:"Art" },
  { id:"u4", name:"Kai Blaze",    handle:"kaiblaze",    avatar:"https://i.pravatar.cc/80?img=12", followers:"2.1M", category:"Music" },
  { id:"u5", name:"Zara Fox",     handle:"zarafox",     avatar:"https://i.pravatar.cc/80?img=20", followers:"3.4M", category:"Lifestyle" },
  { id:"u6", name:"Rio Torres",   handle:"riotorres",   avatar:"https://i.pravatar.cc/80?img=15", followers:"670K", category:"Gaming" },
  { id:"u7", name:"Ava Rose",     handle:"avarose",     avatar:"https://i.pravatar.cc/80?img=44", followers:"1.8M", category:"Beauty" },
  { id:"u8", name:"Sia Bloom",    handle:"siabloom",    avatar:"https://i.pravatar.cc/80?img=10", followers:"920K", category:"Travel" },
];

const AVATARS = Array.from({ length: 12 }, (_, i) => `https://i.pravatar.cc/120?img=${i + 1}`);

const STEPS = ["welcome","profile","interests","follow","done"];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  const canNext = () => {
    if (step === 1) return name.trim().length > 1 && username.trim().length > 1;
    if (step === 2) return selectedInterests.length >= 3;
    return true;
  };

  const next = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const finish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem("vibe:onboarding_complete", "true");
    router.replace("/(tabs)");
  };

  const toggleInterest = (i: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const toggleFollow = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFollowing((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress bar */}
      {step > 0 && step < 4 && (
        <View style={[styles.progressBar, { paddingTop: insets.top + 8 }]}>
          {[1,2,3].map((s) => (
            <View key={s} style={[styles.progressDot, { backgroundColor: step >= s ? "#E1306C" : colors.muted }]} />
          ))}
        </View>
      )}

      {/* STEP 0 — WELCOME */}
      {step === 0 && (
        <LinearGradient colors={["#0d0d1a","#1a0533","#2d0a4e"]} style={styles.fullScreen}>
          <View style={[styles.welcomeContent, { paddingTop: insets.top + 40 }]}>
            <Text style={styles.vibeTitle}>Vibe</Text>
            <Text style={styles.vibeSub}>Where your story comes alive</Text>
            <View style={styles.featureList}>
              {[
                { icon:"📸", text:"Share moments with the world" },
                { icon:"🎥", text:"Go live & earn from your audience" },
                { icon:"💎", text:"Send gifts to your favourite creators" },
                { icon:"🤖", text:"Create art with AI Studio" },
                { icon:"🔐", text:"Own your assets with crypto wallet" },
              ].map((f) => (
                <View key={f.icon} style={styles.featureRow}>
                  <Text style={styles.featureEmoji}>{f.icon}</Text>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>
            <Pressable style={styles.startBtn} onPress={next}>
              <LinearGradient colors={["#E1306C","#833AB4"]} start={{ x:0, y:0 }} end={{ x:1, y:0 }} style={styles.startGrad}>
                <Text style={styles.startText}>Get Started →</Text>
              </LinearGradient>
            </Pressable>
            <Text style={[styles.termsText, { color: "rgba(255,255,255,0.4)" }]}>By continuing you agree to our Terms & Privacy Policy</Text>
          </View>
        </LinearGradient>
      )}

      {/* STEP 1 — PROFILE */}
      {step === 1 && (
        <ScrollView contentContainerStyle={[styles.stepContent, { paddingTop: insets.top + 60 }]}>
          <Text style={[styles.stepTitle, { color: colors.foreground }]}>Set up your profile</Text>
          <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Pick an avatar and tell people who you are</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarRow}>
            {AVATARS.map((a) => (
              <Pressable key={a} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedAvatar(a); }}>
                <Image source={{ uri: a }} style={[styles.avatarOption, { borderColor: selectedAvatar === a ? "#E1306C" : "transparent" }]} />
                {selectedAvatar === a && <View style={styles.avatarCheck}><Ionicons name="checkmark-circle" size={18} color="#E1306C" /></View>}
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Display Name *</Text>
            <TextInput value={name} onChangeText={setName} placeholder="e.g. Luna Starr" placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]} />
          </View>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Username *</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Text style={[styles.inputPrefix, { color: colors.mutedForeground }]}>@</Text>
              <TextInput value={username} onChangeText={(t) => setUsername(t.toLowerCase().replace(/\s/g,""))}
                placeholder="yourhandle" placeholderTextColor={colors.mutedForeground}
                style={[styles.inputInner, { color: colors.foreground }]} autoCapitalize="none" />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Bio (optional)</Text>
            <TextInput value={bio} onChangeText={setBio} placeholder="Tell the world about yourself..." placeholderTextColor={colors.mutedForeground}
              style={[styles.input, styles.inputMulti, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              multiline numberOfLines={3} />
          </View>
          <Pressable style={[styles.nextBtn, { backgroundColor: canNext() ? "#E1306C" : colors.muted }]} onPress={canNext() ? next : undefined}>
            <Text style={[styles.nextBtnText, { color: canNext() ? "#fff" : colors.mutedForeground }]}>Continue</Text>
          </Pressable>
        </ScrollView>
      )}

      {/* STEP 2 — INTERESTS */}
      {step === 2 && (
        <ScrollView contentContainerStyle={[styles.stepContent, { paddingTop: insets.top + 60 }]}>
          <Text style={[styles.stepTitle, { color: colors.foreground }]}>What are you into?</Text>
          <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Pick at least 3 — we'll personalise your feed</Text>
          <View style={styles.interestsGrid}>
            {INTERESTS.map((i) => {
              const selected = selectedInterests.includes(i);
              return (
                <Pressable key={i} onPress={() => toggleInterest(i)}
                  style={[styles.interestChip, { backgroundColor: selected ? "#E1306C" : colors.muted, borderColor: selected ? "#E1306C" : colors.border }]}>
                  <Text style={[styles.interestText, { color: selected ? "#fff" : colors.foreground }]}>{i}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.interestCount, { color: colors.mutedForeground }]}>{selectedInterests.length} selected</Text>
          <Pressable style={[styles.nextBtn, { backgroundColor: canNext() ? "#E1306C" : colors.muted }]} onPress={canNext() ? next : undefined}>
            <Text style={[styles.nextBtnText, { color: canNext() ? "#fff" : colors.mutedForeground }]}>Continue</Text>
          </Pressable>
        </ScrollView>
      )}

      {/* STEP 3 — FOLLOW SUGGESTIONS */}
      {step === 3 && (
        <ScrollView contentContainerStyle={[styles.stepContent, { paddingTop: insets.top + 60 }]}>
          <Text style={[styles.stepTitle, { color: colors.foreground }]}>People to follow</Text>
          <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Start with some of the best creators on Vibe</Text>
          {SUGGESTED_USERS.map((u) => {
            const isFollowing = following.includes(u.id);
            return (
              <View key={u.id} style={[styles.suggestionRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Image source={{ uri: u.avatar }} style={styles.suggAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.suggName, { color: colors.foreground }]}>{u.name}</Text>
                  <Text style={[styles.suggHandle, { color: colors.mutedForeground }]}>@{u.handle} · {u.followers}</Text>
                  <View style={[styles.suggCat, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.suggCatText, { color: colors.foreground }]}>{u.category}</Text>
                  </View>
                </View>
                <Pressable onPress={() => toggleFollow(u.id)}
                  style={[styles.followBtn, { backgroundColor: isFollowing ? colors.muted : "#E1306C" }]}>
                  <Text style={[styles.followBtnText, { color: isFollowing ? colors.foreground : "#fff" }]}>
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                </Pressable>
              </View>
            );
          })}
          <Pressable style={[styles.nextBtn, { backgroundColor: "#E1306C" }]} onPress={next}>
            <Text style={styles.nextBtnText}>{following.length > 0 ? `Follow ${following.length} & Continue` : "Skip for now"}</Text>
          </Pressable>
        </ScrollView>
      )}

      {/* STEP 4 — DONE */}
      {step === 4 && (
        <LinearGradient colors={["#0d0d1a","#1a0533","#2d0a4e"]} style={styles.fullScreen}>
          <View style={[styles.doneContent, { paddingTop: insets.top }]}>
            <Text style={styles.doneEmoji}>🎉</Text>
            <Text style={styles.doneTitle}>You're all set, {name || "Vibe"}!</Text>
            <Text style={styles.doneSub}>Your profile is ready. Time to explore the world of Vibe.</Text>
            <View style={styles.doneStats}>
              {[
                { label:"Interests", value:`${selectedInterests.length}` },
                { label:"Following", value:`${following.length}` },
                { label:"Gems", value:"50 🎁" },
              ].map((s) => (
                <View key={s.label} style={styles.doneStat}>
                  <Text style={styles.doneStatVal}>{s.value}</Text>
                  <Text style={styles.doneStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
            <Pressable style={styles.startBtn} onPress={finish}>
              <LinearGradient colors={["#E1306C","#833AB4"]} start={{ x:0, y:0 }} end={{ x:1, y:0 }} style={styles.startGrad}>
                <Text style={styles.startText}>Enter Vibe →</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fullScreen: { flex: 1 },
  progressBar: { flexDirection: "row", gap: 8, paddingHorizontal: 24, paddingBottom: 8 },
  progressDot: { flex: 1, height: 4, borderRadius: 2 },
  welcomeContent: { flex: 1, paddingHorizontal: 28, paddingBottom: 40, justifyContent: "center" },
  vibeTitle: { color: "#fff", fontSize: 56, fontWeight: "900", textAlign: "center", letterSpacing: -2 },
  vibeSub: { color: "rgba(255,255,255,0.6)", fontSize: 16, textAlign: "center", marginBottom: 44 },
  featureList: { gap: 18, marginBottom: 44 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  featureEmoji: { fontSize: 26, width: 36, textAlign: "center" },
  featureText: { color: "rgba(255,255,255,0.85)", fontSize: 15, flex: 1 },
  startBtn: { borderRadius: 20, overflow: "hidden", marginBottom: 16 },
  startGrad: { paddingVertical: 18, alignItems: "center" },
  startText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  termsText: { fontSize: 11, textAlign: "center" },
  stepContent: { paddingHorizontal: 24, paddingBottom: 50 },
  stepTitle: { fontSize: 26, fontWeight: "900", marginBottom: 8 },
  stepSub: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  avatarRow: { gap: 12, paddingBottom: 24 },
  avatarOption: { width: 70, height: 70, borderRadius: 35, borderWidth: 3 },
  avatarCheck: { position: "absolute", bottom: 0, right: 0 },
  formGroup: { marginBottom: 18 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15 },
  inputMulti: { height: 90, textAlignVertical: "top" },
  inputRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, paddingHorizontal: 14 },
  inputPrefix: { fontSize: 15, marginRight: 4 },
  inputInner: { flex: 1, paddingVertical: 14, fontSize: 15 },
  nextBtn: { borderRadius: 16, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  interestsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  interestChip: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1 },
  interestText: { fontSize: 13, fontWeight: "600" },
  interestCount: { textAlign: "center", fontSize: 13, marginBottom: 16 },
  suggestionRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  suggAvatar: { width: 50, height: 50, borderRadius: 25 },
  suggName: { fontSize: 14, fontWeight: "700" },
  suggHandle: { fontSize: 12, marginBottom: 4 },
  suggCat: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  suggCatText: { fontSize: 10, fontWeight: "600" },
  followBtn: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  followBtnText: { fontSize: 13, fontWeight: "700" },
  doneContent: { flex: 1, paddingHorizontal: 28, paddingBottom: 50, alignItems: "center", justifyContent: "center" },
  doneEmoji: { fontSize: 70, marginBottom: 20 },
  doneTitle: { color: "#fff", fontSize: 28, fontWeight: "900", textAlign: "center", marginBottom: 12 },
  doneSub: { color: "rgba(255,255,255,0.6)", fontSize: 15, textAlign: "center", marginBottom: 36, lineHeight: 22 },
  doneStats: { flexDirection: "row", gap: 32, marginBottom: 44 },
  doneStat: { alignItems: "center" },
  doneStatVal: { color: "#fff", fontSize: 24, fontWeight: "900" },
  doneStatLabel: { color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 },
});
