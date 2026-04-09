import React, { useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { Story } from "@/context/AppContext";

interface StoryCircleProps {
  story: Story;
  size?: number;
  onPress: () => void;
  showAddButton?: boolean;
}

export function StoryCircle({
  story,
  size = 64,
  onPress,
  showAddButton = false,
}: StoryCircleProps) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const ringSize = size + 6;
  const innerRingSize = size + 2;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      testID={`story-${story.id}`}
    >
      <Animated.View
        style={[styles.container, { transform: [{ scale }] }]}
      >
        {story.seen ? (
          <View
            style={[
              styles.ring,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                borderColor: colors.border,
                borderWidth: 1.5,
              },
            ]}
          >
            <Image
              source={{ uri: story.avatar }}
              style={[
                styles.avatar,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                },
              ]}
            />
          </View>
        ) : (
          <LinearGradient
            colors={[
              colors.storyGradient1,
              colors.storyGradient3,
              colors.storyGradient5,
            ]}
            start={{ x: 0.3, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.gradientRing,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
              },
            ]}
          >
            <View
              style={[
                styles.innerBorder,
                {
                  width: innerRingSize - 4,
                  height: innerRingSize - 4,
                  borderRadius: (innerRingSize - 4) / 2,
                  backgroundColor: colors.background,
                },
              ]}
            >
              <Image
                source={{ uri: story.avatar }}
                style={[
                  styles.avatar,
                  {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                  },
                ]}
              />
            </View>
          </LinearGradient>
        )}
        {story.isLive && (
          <View style={[styles.liveBadge, { backgroundColor: colors.like }]}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        {showAddButton && (
          <View
            style={[
              styles.addButton,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.addButtonText}>+</Text>
          </View>
        )}
        <Text
          style={[styles.username, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {story.userId === "me" ? "Your Story" : story.username}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginHorizontal: 5,
    width: 80,
  },
  ring: {
    alignItems: "center",
    justifyContent: "center",
  },
  gradientRing: {
    alignItems: "center",
    justifyContent: "center",
  },
  innerBorder: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    backgroundColor: "#ccc",
  },
  liveBadge: {
    position: "absolute",
    bottom: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "center",
  },
  liveText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800" as const,
    letterSpacing: 0.5,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800" as const,
    lineHeight: 16,
  },
  username: {
    fontSize: 11,
    marginTop: 5,
    textAlign: "center",
    maxWidth: 72,
  },
});
