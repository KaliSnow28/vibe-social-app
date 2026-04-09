import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

const FILTERS = [
  { name: "None", tint: "transparent" },
  { name: "Warm", tint: "rgba(255,160,50,0.2)" },
  { name: "Cool", tint: "rgba(50,130,255,0.2)" },
  { name: "Fade", tint: "rgba(200,200,200,0.3)" },
  { name: "Vivid", tint: "rgba(200,0,100,0.15)" },
  { name: "Mono", tint: "rgba(100,100,100,0.4)" },
  { name: "Glow", tint: "rgba(255,220,100,0.2)" },
];

const MODES = ["Story", "Reel", "Photo", "Video", "Live"];

export default function CameraScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [selectedMode, setSelectedMode] = useState(2);
  const [flash, setFlash] = useState<"off" | "on" | "auto">("off");
  const [captured, setCaptured] = useState(false);
  const captureAnim = useRef(new Animated.Value(1)).current;
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  const handleCapture = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.sequence([
      Animated.spring(captureAnim, { toValue: 0.85, useNativeDriver: true, damping: 6 }),
      Animated.spring(captureAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    setCaptured(true);
    setTimeout(() => setCaptured(false), 1500);
  };

  const flashIcon =
    flash === "on" ? "flash" : flash === "auto" ? "flash-outline" : "flash-off";

  const cycleFlash = () => {
    setFlash((f) => (f === "off" ? "on" : f === "on" ? "auto" : "off"));
  };

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <LinearGradient
        colors={["#1a0533", "#0d1a3a", "#000"]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.viewfinder,
          { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" },
        ]}
      >
        {captured && (
          <View style={[styles.captureFlash, { pointerEvents: "none" }]} />
        )}
        <View style={styles.viewfinderGrid}>
          {[...Array(4)].map((_, i) => (
            <View
              key={i}
              style={[styles.gridLine, i < 2 ? styles.gridLineV : styles.gridLineH]}
            />
          ))}
        </View>
        <View
          style={[
            styles.filterOverlay,
            { backgroundColor: FILTERS[selectedFilter].tint, pointerEvents: "none" },
          ]}
        />
        <Text style={styles.placeholderText}>Camera Preview</Text>
        <Text style={styles.placeholderSubtext}>(Camera not available in preview)</Text>
      </View>

      <View style={[styles.topControls, { top: topInset + 12 }]}>
        <Pressable onPress={cycleFlash} style={styles.controlBtn}>
          <Ionicons name={flashIcon as any} size={24} color="#fff" />
        </Pressable>
        <Pressable style={styles.controlBtn}>
          <MaterialCommunityIcons name="timer-outline" size={24} color="#fff" />
        </Pressable>
        <Pressable style={styles.controlBtn}>
          <Ionicons name="options-outline" size={24} color="#fff" />
        </Pressable>
      </View>

      <Pressable
        style={[styles.closeBtn, { top: topInset + 12 }]}
        testID="camera-close"
      >
        <Feather name="x" size={26} color="#fff" />
      </Pressable>

      <View style={styles.filterStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {FILTERS.map((f, i) => (
            <Pressable
              key={f.name}
              style={styles.filterItem}
              onPress={() => {
                setSelectedFilter(i);
                Haptics.selectionAsync();
              }}
            >
              <View
                style={[
                  styles.filterSwatch,
                  {
                    backgroundColor: f.tint === "transparent" ? "#333" : f.tint,
                    borderColor: selectedFilter === i ? "#fff" : "transparent",
                    borderWidth: 2,
                  },
                ]}
              />
              <Text
                style={[
                  styles.filterName,
                  { color: selectedFilter === i ? "#fff" : "rgba(255,255,255,0.5)" },
                ]}
              >
                {f.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.modeStrip}>
        {MODES.map((m, i) => (
          <Pressable
            key={m}
            onPress={() => {
              setSelectedMode(i);
              Haptics.selectionAsync();
            }}
          >
            <Text
              style={[
                styles.modeText,
                {
                  color: selectedMode === i ? "#fff" : "rgba(255,255,255,0.4)",
                  fontWeight: selectedMode === i ? "700" : "400" as const,
                },
              ]}
            >
              {m}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.captureArea, { paddingBottom: bottomInset + 20 }]}>
        <Pressable style={styles.galleryBtn} testID="camera-gallery">
          <View style={[styles.galleryThumb, { backgroundColor: colors.muted }]}>
            <Feather name="image" size={20} color={colors.foreground} />
          </View>
        </Pressable>

        <Pressable onPress={handleCapture} testID="camera-capture">
          <Animated.View
            style={[styles.captureBtn, { transform: [{ scale: captureAnim }] }]}
          >
            <View style={styles.captureInner} />
          </Animated.View>
        </Pressable>

        <Pressable style={styles.flipBtn} testID="camera-flip">
          <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewfinder: {
    position: "absolute",
    top: 90,
    left: 0,
    right: 0,
    bottom: 240,
    margin: 0,
    borderRadius: 0,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
  },
  captureFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.6)",
    zIndex: 10,
  },
  viewfinderGrid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  gridLineV: {
    width: 0.5,
    top: 0,
    bottom: 0,
  },
  gridLineH: {
    height: 0.5,
    left: 0,
    right: 0,
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholderText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  placeholderSubtext: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 12,
    marginTop: 4,
  },
  topControls: {
    position: "absolute",
    right: 16,
    flexDirection: "column",
    gap: 16,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  filterStrip: {
    position: "absolute",
    bottom: 230,
    left: 0,
    right: 0,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterItem: {
    alignItems: "center",
    gap: 4,
  },
  filterSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  filterName: {
    fontSize: 10,
    fontWeight: "500" as const,
  },
  modeStrip: {
    position: "absolute",
    bottom: 190,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  modeText: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
  captureArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40,
  },
  galleryBtn: {},
  galleryThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "transparent",
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
  },
  flipBtn: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
});
