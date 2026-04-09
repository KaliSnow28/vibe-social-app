import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";

const { width, height } = Dimensions.get("window");
const STORY_DURATION = 5000;

const STORY_IMAGES = [
  "https://images.unsplash.com/photo-1494122353634-c310f45a6d3c?w=600",
  "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=600",
  "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600",
];

export default function StoryViewer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { stories, markStoryAsSeen } = useApp();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  const storyIndex = stories.findIndex((s) => s.id === id);
  const story = stories[storyIndex] ?? stories[0];

  const [currentImage, setCurrentImage] = useState(0);
  const [reply, setReply] = useState("");
  const progress = useRef(new Animated.Value(0)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  const IMAGES = STORY_IMAGES;
  const totalSlides = IMAGES.length;

  const runProgress = (slideIndex: number) => {
    progress.setValue(0);
    anim.current = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });
    anim.current.start(({ finished }) => {
      if (finished) {
        if (slideIndex < totalSlides - 1) {
          setCurrentImage((i) => i + 1);
        } else {
          router.back();
        }
      }
    });
  };

  useEffect(() => {
    if (story) markStoryAsSeen(story.id);
    runProgress(currentImage);
    return () => {
      anim.current?.stop();
    };
  }, [currentImage, story?.id]);

  const handleLeft = () => {
    anim.current?.stop();
    if (currentImage > 0) setCurrentImage((i) => i - 1);
    else router.back();
  };

  const handleRight = () => {
    anim.current?.stop();
    if (currentImage < totalSlides - 1) setCurrentImage((i) => i + 1);
    else router.back();
  };

  const handleLeftRef = useRef(handleLeft);
  const handleRightRef = useRef(handleRight);
  handleLeftRef.current = handleLeft;
  handleRightRef.current = handleRight;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dx < -40) handleRightRef.current();
        else if (g.dx > 40) handleLeftRef.current();
      },
    })
  ).current;

  if (!story) return null;

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]} {...panResponder.panHandlers}>
      <Image
        source={{ uri: IMAGES[currentImage] }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "transparent", "transparent", "rgba(0,0,0,0.5)"]}
        style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
      />

      <View style={[styles.topSection, { paddingTop: topInset + 8 }]}>
        <View style={styles.progressBars}>
          {IMAGES.map((_, i) => (
            <View
              key={i}
              style={[styles.progressTrack, { flex: 1 }]}
            >
              {i < currentImage ? (
                <View style={[styles.progressFill, { width: "100%", backgroundColor: "#fff" }]} />
              ) : i === currentImage ? (
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                      backgroundColor: "#fff",
                    },
                  ]}
                />
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.storyHeader}>
          <Image source={{ uri: story.avatar }} style={styles.avatar} />
          <View style={styles.storyInfo}>
            <Text style={styles.storyUsername}>{story.username}</Text>
            <Text style={styles.storyTime}>2h ago</Text>
          </View>
          <View style={styles.storyActions}>
            {story.isLive && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
            <Pressable>
              <Feather name="more-horizontal" size={22} color="#fff" />
            </Pressable>
            <Pressable onPress={() => router.back()} style={{ marginLeft: 8 }}>
              <Feather name="x" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>

      <Pressable style={[styles.tapZoneLeft]} onPress={handleLeft} />
      <Pressable style={[styles.tapZoneRight]} onPress={handleRight} />

      <View style={[styles.replyBar, { paddingBottom: bottomInset + 12 }]}>
        <TextInput
          placeholder={`Reply to ${story.username}...`}
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={reply}
          onChangeText={setReply}
          style={styles.replyInput}
        />
        <Pressable style={styles.replyAction}>
          <Ionicons name="heart-outline" size={26} color="#fff" />
        </Pressable>
        <Pressable style={styles.replyAction}>
          <Feather name="send" size={22} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  progressBars: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
  },
  progressTrack: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  storyHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#ccc",
    marginRight: 10,
  },
  storyInfo: {
    flex: 1,
  },
  storyUsername: {
    color: "#fff",
    fontWeight: "700" as const,
    fontSize: 14,
  },
  storyTime: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
  },
  storyActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  liveBadge: {
    backgroundColor: "#ed4956",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
  },
  liveText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800" as const,
    letterSpacing: 0.5,
  },
  tapZoneLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width * 0.35,
    bottom: 0,
    zIndex: 5,
  },
  tapZoneRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: width * 0.65,
    bottom: 0,
    zIndex: 5,
  },
  replyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 12,
    zIndex: 10,
  },
  replyInput: {
    flex: 1,
    height: 42,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 21,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 14,
  },
  replyAction: {},
});
