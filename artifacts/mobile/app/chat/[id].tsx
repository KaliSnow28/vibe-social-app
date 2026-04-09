import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hrs = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, "0");
  const ampm = hrs >= 12 ? "PM" : "AM";
  return `${hrs % 12 || 12}:${mins} ${ampm}`;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { conversations, sendMessage, me } = useApp();
  const [text, setText] = useState("");
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const conv = conversations.find((c) => c.id === id) ?? conversations[0];
  const other = conv?.participants[0];

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !conv) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(conv.id, trimmed);
    setText("");
  };

  if (!conv) return null;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: headerTop,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="chat-back">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Pressable style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: other?.avatar }} style={styles.avatar} />
            {conv.isOnline && (
              <View
                style={[
                  styles.onlineDot,
                  { backgroundColor: colors.online, borderColor: colors.background },
                ]}
              />
            )}
          </View>
          <View>
            <Text style={[styles.chatName, { color: colors.foreground }]}>
              {conv.isGroup ? conv.groupName : other?.username}
            </Text>
            <Text style={[styles.chatStatus, { color: colors.mutedForeground }]}>
              {conv.isOnline ? "Active now" : "Active 2h ago"}
            </Text>
          </View>
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerBtn}>
            <Feather name="phone" size={22} color={colors.foreground} />
          </Pressable>
          <Pressable style={styles.headerBtn}>
            <Feather name="video" size={22} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={[...conv.messages].reverse()}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={[
          styles.messagesList,
          { paddingBottom: 12, paddingTop: 12 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const isMe = item.senderId === "me";
          return (
            <View
              style={[
                styles.messageRow,
                isMe ? styles.messageRowMe : styles.messageRowThem,
              ]}
            >
              {!isMe && (
                <Image source={{ uri: other?.avatar }} style={styles.msgAvatar} />
              )}
              <View>
                <View
                  style={[
                    styles.bubble,
                    isMe
                      ? [styles.bubbleMe, { backgroundColor: colors.messageBubble }]
                      : [styles.bubbleThem, { backgroundColor: colors.messageBubbleIncoming }],
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      {
                        color: isMe
                          ? colors.messageBubbleForeground
                          : colors.messageBubbleIncomingForeground,
                      },
                    ]}
                  >
                    {item.text}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.msgTime,
                    {
                      color: colors.mutedForeground,
                      alignSelf: isMe ? "flex-end" : "flex-start",
                    },
                  ]}
                >
                  {formatTime(item.timestamp)}
                  {isMe && (
                    <Text>
                      {" "}
                      {item.read ? "✓✓" : "✓"}
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View
        style={[
          styles.inputBar,
          {
            paddingBottom: bottomPad + 8,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Pressable style={styles.inputAction}>
          <Ionicons name="camera-outline" size={26} color={colors.foreground} />
        </Pressable>
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.muted, borderRadius: 22 },
          ]}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            multiline
            returnKeyType="default"
            testID="chat-input"
          />
          <Pressable>
            <Ionicons name="happy-outline" size={22} color={colors.mutedForeground} />
          </Pressable>
        </View>
        {text.trim() ? (
          <Pressable onPress={handleSend} testID="chat-send">
            <Text style={[styles.sendText, { color: colors.primary }]}>Send</Text>
          </Pressable>
        ) : (
          <View style={styles.mediaActions}>
            <Pressable style={styles.inputAction}>
              <Ionicons name="mic-outline" size={24} color={colors.foreground} />
            </Pressable>
            <Pressable style={styles.inputAction}>
              <Ionicons name="image-outline" size={24} color={colors.foreground} />
            </Pressable>
            <Pressable style={styles.inputAction}>
              <Feather name="heart" size={22} color={colors.foreground} />
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ccc",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  chatName: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  chatStatus: {
    fontSize: 11,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 14,
  },
  headerBtn: {},
  messagesList: {},
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  messageRowMe: {
    justifyContent: "flex-end",
  },
  messageRowThem: {
    justifyContent: "flex-start",
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ccc",
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  msgTime: {
    fontSize: 10,
    marginTop: 3,
    paddingHorizontal: 4,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  inputAction: {},
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 42,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
  },
  sendText: {
    fontSize: 16,
    fontWeight: "700" as const,
    paddingBottom: 8,
  },
  mediaActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingBottom: 4,
  },
});
