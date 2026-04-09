import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NotificationsSkeleton } from "@/components/SkeletonLoader";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useInitialLoad } from "@/hooks/useInitialLoad";

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notifications, markAllNotificationsRead, markNotificationRead } = useApp();
  const initialLoading = useInitialLoad(500);
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;

  useEffect(() => {
    const timer = setTimeout(markAllNotificationsRead, 2000);
    return () => clearTimeout(timer);
  }, []);

  const recentNotifs = notifications.filter(
    (n) => Date.now() - n.timestamp < 1000 * 60 * 60 * 24
  );
  const olderNotifs = notifications.filter(
    (n) => Date.now() - n.timestamp >= 1000 * 60 * 60 * 24
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            top: headerTop,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Notifications
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {initialLoading ? (
        <NotificationsSkeleton />
      ) : (
      <FlatList
        data={[...recentNotifs, ...olderNotifs]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingTop: headerTop + 56, paddingBottom: isWeb ? 34 : 20 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() =>
          recentNotifs.length > 0 ? (
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              This week
            </Text>
          ) : null
        }
        renderItem={({ item, index }) => {
          const isFirstOld =
            index === recentNotifs.length && olderNotifs.length > 0;
          return (
            <>
              {isFirstOld && (
                <Text
                  style={[styles.sectionTitle, { color: colors.foreground }]}
                >
                  Earlier
                </Text>
              )}
              <Pressable
                style={[
                  styles.notifRow,
                  !item.read && { backgroundColor: colors.muted + "40" },
                ]}
                onPress={() => markNotificationRead(item.id)}
                testID={`notif-${item.id}`}
              >
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                {!item.read && (
                  <View
                    style={[styles.unreadDot, { backgroundColor: colors.primary }]}
                  />
                )}
                <View style={styles.notifContent}>
                  <Text style={[styles.notifText, { color: colors.foreground }]}>
                    <Text style={styles.notifUsername}>{item.username}</Text>
                    {" "}
                    {item.text}
                    <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>
                      {" "}
                      {formatTime(item.timestamp)}
                    </Text>
                  </Text>
                </View>
                {item.postImage && (
                  <Image
                    source={{ uri: item.postImage }}
                    style={styles.postThumb}
                    resizeMode="cover"
                  />
                )}
                {item.type === "follow" && (
                  <Pressable
                    style={[
                      styles.followBtn,
                      { backgroundColor: colors.primary, borderRadius: colors.radius },
                    ]}
                  >
                    <Text style={styles.followBtnText}>Follow</Text>
                  </Pressable>
                )}
              </Pressable>
            </>
          );
        }}
        scrollEnabled={notifications.length > 0}
      />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  list: {},
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "relative",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ccc",
    marginRight: 12,
  },
  unreadDot: {
    position: "absolute",
    left: 10,
    top: "50%",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: -4,
  },
  notifContent: {
    flex: 1,
  },
  notifText: {
    fontSize: 14,
    lineHeight: 20,
  },
  notifUsername: {
    fontWeight: "700" as const,
  },
  notifTime: {
    fontSize: 12,
  },
  postThumb: {
    width: 44,
    height: 44,
    borderRadius: 4,
    marginLeft: 12,
    backgroundColor: "#e0e0e0",
  },
  followBtn: {
    marginLeft: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  followBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600" as const,
  },
});
