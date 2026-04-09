import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function MessagesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { conversations, me } = useApp();
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;

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
        <Pressable>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {me.username}
        </Text>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerBtn}>
            <Feather name="video" size={24} color={colors.foreground} />
          </Pressable>
          <Pressable style={styles.headerBtn}>
            <Feather name="edit" size={22} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: headerTop + 56,
            paddingBottom: isWeb ? 84 + 34 : 90,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.requestsRow}>
            <Pressable
              style={[styles.requestsBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.requestsBtnText, { color: colors.foreground }]}>
                Message Requests
              </Text>
            </Pressable>
          </View>
        )}
        renderItem={({ item }) => {
          const other = item.participants[0];
          const hasUnread = item.unreadCount > 0;
          return (
            <Pressable
              style={[styles.convRow]}
              onPress={() =>
                router.push(`/chat/${item.id}` as any)
              }
              testID={`conv-${item.id}`}
            >
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: other.avatar }}
                  style={styles.avatar}
                />
                {item.isOnline && (
                  <View
                    style={[
                      styles.onlineDot,
                      { backgroundColor: colors.online, borderColor: colors.background },
                    ]}
                  />
                )}
              </View>
              <View style={styles.convInfo}>
                <Text
                  style={[
                    styles.convName,
                    {
                      color: colors.foreground,
                      fontWeight: hasUnread ? "700" : "400" as const,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.isGroup ? item.groupName : other.username}
                </Text>
                <Text
                  style={[
                    styles.lastMessage,
                    {
                      color: hasUnread ? colors.foreground : colors.mutedForeground,
                      fontWeight: hasUnread ? "600" : "400" as const,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.lastMessage} · {formatTime(item.lastMessageTime)}
                </Text>
              </View>
              <View style={styles.convRight}>
                {hasUnread ? (
                  <View
                    style={[
                      styles.unreadBadge,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                  </View>
                ) : (
                  <Feather name="camera" size={22} color={colors.mutedForeground} />
                )}
              </View>
            </Pressable>
          );
        }}
        scrollEnabled={conversations.length > 0}
      />
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
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginLeft: -24,
  },
  headerRight: {
    flexDirection: "row",
    gap: 14,
  },
  headerBtn: {},
  list: {},
  requestsRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  requestsBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
  },
  requestsBtnText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  convRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ccc",
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  convInfo: {
    flex: 1,
  },
  convName: {
    fontSize: 15,
    marginBottom: 3,
  },
  lastMessage: {
    fontSize: 13,
  },
  convRight: {
    marginLeft: 10,
    alignItems: "center",
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700" as const,
  },
});
