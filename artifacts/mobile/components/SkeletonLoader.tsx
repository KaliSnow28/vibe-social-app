import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

function SkeletonBox({ style }: { style?: object }) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: false }),
        Animated.timing(opacity, { toValue: 0.4, duration: 750, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[{ backgroundColor: colors.muted, borderRadius: 8, opacity }, style]}
    />
  );
}

export function FeedSkeleton() {
  const colors = useColors();
  return (
    <View style={{ backgroundColor: colors.background }}>
      {[0, 1].map((i) => (
        <View key={i} style={[styles.postCard, { borderBottomColor: colors.border }]}>
          <View style={styles.postHeader}>
            <SkeletonBox style={styles.avatarCircle} />
            <View style={styles.postHeaderText}>
              <SkeletonBox style={{ height: 12, width: 120, marginBottom: 6 }} />
              <SkeletonBox style={{ height: 10, width: 80 }} />
            </View>
          </View>
          <SkeletonBox style={styles.postImage} />
          <View style={styles.postActions}>
            <SkeletonBox style={{ height: 12, width: 180 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function MessagesSkeleton() {
  const colors = useColors();
  return (
    <View style={{ backgroundColor: colors.background }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={[styles.convRow, { borderBottomColor: colors.border }]}>
          <SkeletonBox style={styles.avatarCircle} />
          <View style={styles.convText}>
            <SkeletonBox style={{ height: 13, width: 140, marginBottom: 8 }} />
            <SkeletonBox style={{ height: 11, width: 200 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function ExploreSkeleton() {
  const colors = useColors();
  const CELL = 112;
  return (
    <View style={{ backgroundColor: colors.background, flexDirection: "row", flexWrap: "wrap", padding: 2 }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <SkeletonBox key={i} style={{ width: CELL, height: CELL, borderRadius: 4, margin: 1 }} />
      ))}
    </View>
  );
}

export function NotificationsSkeleton() {
  const colors = useColors();
  return (
    <View style={{ backgroundColor: colors.background }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={[styles.convRow, { borderBottomColor: colors.border }]}>
          <SkeletonBox style={styles.avatarCircle} />
          <View style={styles.convText}>
            <SkeletonBox style={{ height: 12, width: 260, marginBottom: 8 }} />
            <SkeletonBox style={{ height: 10, width: 100 }} />
          </View>
          <SkeletonBox style={{ width: 44, height: 44, borderRadius: 6 }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 4,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  postHeaderText: {
    marginLeft: 10,
    flex: 1,
  },
  postImage: {
    height: 300,
    borderRadius: 0,
    marginHorizontal: 0,
  },
  postActions: {
    padding: 12,
    paddingTop: 10,
  },
  convRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  convText: {
    flex: 1,
    marginLeft: 12,
  },
});
