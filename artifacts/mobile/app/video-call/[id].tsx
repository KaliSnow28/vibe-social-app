import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";

const { width, height } = Dimensions.get("window");

const CALL_AVATARS = [
  "https://i.pravatar.cc/400?img=12",
  "https://i.pravatar.cc/400?img=5",
  "https://i.pravatar.cc/400?img=9",
  "https://i.pravatar.cc/400?img=16",
];

export default function VideoCallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { conversations } = useApp();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const conv = conversations.find((c) => c.id === id);
  const participant = conv?.participants[0];

  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connected, setConnected] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const connectAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
      ])
    ).start();

    const timer = setTimeout(() => {
      setConnected(true);
      Animated.timing(connectAnim, { toValue: 1, duration: 400, useNativeDriver: false }).start();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [connected]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleEnd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.back();
  };

  const avatarUrl = CALL_AVATARS[parseInt(id ?? "0") % CALL_AVATARS.length];

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: avatarUrl }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        blurRadius={cameraOff ? 0 : 3}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.6)", "transparent", "transparent", "rgba(0,0,0,0.8)"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.topBar, { paddingTop: (isWeb ? 67 : insets.top) + 8 }]}>
        <Pressable style={styles.topBtn} onPress={() => router.back()}>
          <Feather name="chevron-down" size={28} color="#fff" />
        </Pressable>
        <View style={styles.callStatus}>
          <Text style={styles.callerName}>{participant?.username ?? "Video Call"}</Text>
          <Text style={styles.callStatusText}>
            {connected ? formatDuration(callDuration) : "Connecting..."}
          </Text>
        </View>
        <Pressable style={styles.topBtn}>
          <Feather name="more-horizontal" size={24} color="#fff" />
        </Pressable>
      </View>

      {!connected && (
        <View style={styles.connectingOverlay}>
          <Animated.View style={[styles.avatarPulseOuter, { transform: [{ scale: pulseAnim }] }]}>
            <Image source={{ uri: avatarUrl }} style={styles.connectingAvatar} />
          </Animated.View>
          <Text style={styles.connectingText}>Calling...</Text>
        </View>
      )}

      {!cameraOff && (
        <View style={styles.selfPreview}>
          <LinearGradient
            colors={["#1a0533", "#0d1a3a"]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.selfPreviewText}>📷</Text>
          <Pressable
            style={styles.flipBtn}
            onPress={() => { setFlipped((f) => !f); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <MaterialCommunityIcons name="camera-flip" size={18} color="#fff" />
          </Pressable>
        </View>
      )}

      <View style={[styles.controlsBar, { paddingBottom: (isWeb ? 34 : insets.bottom) + 20 }]}>
        <View style={styles.controls}>
          <Pressable
            style={[styles.controlBtn, muted && styles.controlBtnActive]}
            onPress={() => { setMuted((m) => !m); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <Ionicons name={muted ? "mic-off" : "mic"} size={24} color="#fff" />
            <Text style={styles.controlLabel}>{muted ? "Unmute" : "Mute"}</Text>
          </Pressable>

          <Pressable
            style={[styles.controlBtn, cameraOff && styles.controlBtnActive]}
            onPress={() => { setCameraOff((c) => !c); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <Ionicons name={cameraOff ? "videocam-off" : "videocam"} size={24} color="#fff" />
            <Text style={styles.controlLabel}>{cameraOff ? "Camera On" : "Camera Off"}</Text>
          </Pressable>

          <Pressable style={styles.endCallBtn} onPress={handleEnd}>
            <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: "135deg" }] }} />
          </Pressable>

          <Pressable
            style={[styles.controlBtn, !speakerOn && styles.controlBtnActive]}
            onPress={() => { setSpeakerOn((s) => !s); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <Ionicons name={speakerOn ? "volume-high" : "volume-mute"} size={24} color="#fff" />
            <Text style={styles.controlLabel}>{speakerOn ? "Speaker" : "Earpiece"}</Text>
          </Pressable>

          <Pressable style={styles.controlBtn}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
            <Text style={styles.controlLabel}>Chat</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, zIndex: 10 },
  topBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  callStatus: { alignItems: "center" },
  callerName: { color: "#fff", fontSize: 18, fontWeight: "700" },
  callStatusText: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 },
  connectingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  avatarPulseOuter: { borderRadius: 60, borderWidth: 3, borderColor: "rgba(255,255,255,0.3)", padding: 4 },
  connectingAvatar: { width: 110, height: 110, borderRadius: 55 },
  connectingText: { color: "rgba(255,255,255,0.7)", fontSize: 16, marginTop: 20 },
  selfPreview: {
    position: "absolute",
    top: 120,
    right: 16,
    width: width * 0.28,
    height: width * 0.4,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  selfPreviewText: { fontSize: 36 },
  flipBtn: { position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 14, padding: 6 },
  controlsBar: { position: "absolute", bottom: 0, left: 0, right: 0 },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 8 },
  controlBtn: { alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, width: 62, height: 72, justifyContent: "center" },
  controlBtnActive: { backgroundColor: "rgba(255,255,255,0.3)" },
  controlLabel: { color: "rgba(255,255,255,0.8)", fontSize: 10 },
  endCallBtn: { width: 68, height: 68, borderRadius: 34, backgroundColor: "#E1306C", alignItems: "center", justifyContent: "center" },
});
