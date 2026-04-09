import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SettingRow {
  icon: string;
  iconLib?: "feather" | "ion" | "mci";
  label: string;
  sub?: string;
  value?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
  danger?: boolean;
  badge?: string;
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;

  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [likesNotif, setLikesNotif] = useState(true);
  const [commentsNotif, setCommentsNotif] = useState(true);
  const [followsNotif, setFollowsNotif] = useState(true);
  const [liveNotif, setLiveNotif] = useState(true);
  const [messagesNotif, setMessagesNotif] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [allowDMs, setAllowDMs] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [textSize, setTextSize] = useState<"S" | "M" | "L" | "XL">("M");
  const [dataSync, setDataSync] = useState(true);
  const [adPersonal, setAdPersonal] = useState(true);
  const [locationData, setLocationData] = useState(false);

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>{title}</Text>
  );

  const SettingItem = ({ icon, iconLib="feather", label, sub, value, onToggle, onPress, danger=false, badge }: SettingRow) => {
    const IconComp = iconLib === "ion" ? Ionicons : iconLib === "mci" ? MaterialCommunityIcons : Feather;
    return (
      <Pressable onPress={onPress ?? (onToggle ? undefined : () => {})}
        style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.iconBox, { backgroundColor: danger ? "#E1306C20" : colors.muted }]}>
          <IconComp name={icon as never} size={17} color={danger ? "#E1306C" : colors.foreground} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.settingLabel, { color: danger ? "#E1306C" : colors.foreground }]}>{label}</Text>
          {sub && <Text style={[styles.settingSub, { color: colors.mutedForeground }]}>{sub}</Text>}
        </View>
        {badge && <View style={[styles.badge, { backgroundColor: "#E1306C" }]}><Text style={styles.badgeText}>{badge}</Text></View>}
        {onToggle !== undefined ? (
          <Switch value={value} onValueChange={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle(); }}
            trackColor={{ false: colors.muted, true: "#E1306C" }} thumbColor="#fff" />
        ) : onPress ? (
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#0d0d1a","#1a0533"]} style={[styles.header, { paddingTop: headerTop + 8, paddingBottom: 16 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 22 }} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

        {/* ACCOUNT */}
        <SectionHeader title="ACCOUNT" />
        <SettingItem icon="user" label="Edit Profile" sub="Name, bio, avatar, links" onPress={() => router.push("/onboarding")} />
        <SettingItem icon="at-sign" label="Change Username" sub="@yourhandle" onPress={() => Alert.alert("Change Username", "Enter your new username in the edit profile screen.")} />
        <SettingItem icon="mail" label="Email Address" sub="your@email.com" onPress={() => Alert.alert("Email", "Update your email address.")} />
        <SettingItem icon="lock" label="Password & Security" sub="2FA, login sessions" onPress={() => Alert.alert("Security", "Manage your password and two-factor authentication.")} />
        <SettingItem icon="link" label="Linked Accounts" sub="Google, Apple, Wallet" onPress={() => Alert.alert("Linked Accounts", "Connect or disconnect external accounts.")} />

        {/* APPEARANCE */}
        <SectionHeader title="APPEARANCE" />
        <SettingItem icon="moon" label="Dark Mode" sub="Switch between dark and light" value={darkMode} onToggle={() => setDarkMode(!darkMode)} />
        <SettingItem icon="zap" label="High Contrast" sub="Increase text & border contrast" value={highContrast} onToggle={() => setHighContrast(!highContrast)} />
        <SettingItem icon="wind" label="Reduce Motion" sub="Fewer animations & transitions" value={reduceMotion} onToggle={() => setReduceMotion(!reduceMotion)} />
        <View style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.iconBox, { backgroundColor: colors.muted }]}>
            <Feather name="type" size={17} color={colors.foreground} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>Text Size</Text>
            <Text style={[styles.settingSub, { color: colors.mutedForeground }]}>Adjust font size across the app</Text>
          </View>
          <View style={styles.textSizeRow}>
            {(["S","M","L","XL"] as const).map((s) => (
              <Pressable key={s} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTextSize(s); }}
                style={[styles.textSizeBtn, { backgroundColor: textSize === s ? "#E1306C" : colors.muted }]}>
                <Text style={[styles.textSizeBtnText, { color: textSize === s ? "#fff" : colors.foreground }]}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* NOTIFICATIONS */}
        <SectionHeader title="NOTIFICATIONS" />
        <SettingItem icon="bell" label="Push Notifications" sub="All notification alerts" value={notifications} onToggle={() => setNotifications(!notifications)} />
        <SettingItem icon="heart" iconLib="feather" label="Likes" value={likesNotif} onToggle={() => setLikesNotif(!likesNotif)} />
        <SettingItem icon="message-circle" label="Comments" value={commentsNotif} onToggle={() => setCommentsNotif(!commentsNotif)} />
        <SettingItem icon="user-plus" label="New Followers" value={followsNotif} onToggle={() => setFollowsNotif(!followsNotif)} />
        <SettingItem icon="radio" label="Live Streams" value={liveNotif} onToggle={() => setLiveNotif(!liveNotif)} />
        <SettingItem icon="message-square" label="Direct Messages" value={messagesNotif} onToggle={() => setMessagesNotif(!messagesNotif)} />

        {/* PRIVACY */}
        <SectionHeader title="PRIVACY" />
        <SettingItem icon="lock" label="Private Account" sub="Only approved followers see your posts" value={privateAccount} onToggle={() => setPrivateAccount(!privateAccount)} />
        <SettingItem icon="activity" label="Show Activity Status" sub="Let others see when you were last active" value={showActivity} onToggle={() => setShowActivity(!showActivity)} />
        <SettingItem icon="message-square" label="Allow Direct Messages" sub="Who can message you" value={allowDMs} onToggle={() => setAllowDMs(!allowDMs)} />
        <SettingItem icon="eye-off" label="Hidden Words" sub="Filter comments and DMs" onPress={() => Alert.alert("Hidden Words", "Add words to automatically filter from your content.")} />
        <SettingItem icon="users" label="Blocked Accounts" sub="Manage who can't see your content" onPress={() => Alert.alert("Blocked Accounts", "No blocked accounts.")} />
        <SettingItem icon="download" label="Download Your Data" sub="Get a copy of your Vibe data" onPress={() => Alert.alert("Data Download", "We'll email you a link to download your data within 48 hours.")} />

        {/* DATA */}
        <SectionHeader title="DATA & PERMISSIONS" />
        <SettingItem icon="refresh-cw" iconLib="feather" label="Auto-Sync Data" sub="Sync content while on Wi-Fi" value={dataSync} onToggle={() => setDataSync(!dataSync)} />
        <SettingItem icon="target" label="Personalised Ads" sub="Use your activity to show relevant ads" value={adPersonal} onToggle={() => setAdPersonal(!adPersonal)} />
        <SettingItem icon="map-pin" label="Location Services" sub="Used for local content" value={locationData} onToggle={() => setLocationData(!locationData)} />
        <SettingItem icon="camera" label="Camera & Microphone" sub="Required for posts and live streaming" onPress={() => Alert.alert("Permissions", "Manage camera and microphone in your device settings.")} />

        {/* SUPPORT */}
        <SectionHeader title="SUPPORT" />
        <SettingItem icon="help-circle" label="Help Center" onPress={() => Alert.alert("Help", "Visit help.vibeapp.com for support.")} />
        <SettingItem icon="flag" label="Report a Problem" onPress={() => Alert.alert("Report", "Thank you. We'll review your report shortly.")} />
        <SettingItem icon="star" label="Rate Vibe" badge="⭐" onPress={() => Alert.alert("Rate Us", "Love using Vibe? Leave us a 5-star review on the App Store!")} />
        <SettingItem icon="info" label="About Vibe" sub="Version 1.0.0" onPress={() => Alert.alert("Vibe v1.0.0", "Built with love. All rights reserved.")} />

        {/* DANGER ZONE */}
        <SectionHeader title="ACCOUNT ACTIONS" />
        <SettingItem icon="log-out" label="Log Out" danger onPress={() => Alert.alert("Log Out", "Are you sure you want to log out?", [{ text:"Cancel", style:"cancel" }, { text:"Log Out", style:"destructive", onPress:() => router.replace("/onboarding") }])} />
        <SettingItem icon="trash-2" label="Delete Account" sub="Permanently delete your data" danger
          onPress={() => Alert.alert("Delete Account", "This action cannot be undone. All your data will be permanently deleted.", [{ text:"Cancel", style:"cancel" }, { text:"Delete", style:"destructive", onPress:() => Alert.alert("Account Deleted", "Your account has been scheduled for deletion.") }])} />

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  sectionHeader: { fontSize: 11, fontWeight: "700", letterSpacing: 1, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8, textTransform: "uppercase" },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  iconBox: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontSize: 15, fontWeight: "600" },
  settingSub: { fontSize: 12, marginTop: 1 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  textSizeRow: { flexDirection: "row", gap: 4 },
  textSizeBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  textSizeBtnText: { fontSize: 11, fontWeight: "800" },
});
