import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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
import { useCharacters } from "@/context/CharacterContext";
import { useColors } from "@/hooks/useColors";

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hrs = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, "0");
  const ampm = hrs >= 12 ? "PM" : "AM";
  return `${hrs % 12 || 12}:${mins} ${ampm}`;
}

function TypingIndicator({ color }: { color: string }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );
    const a1 = anim(dot1, 0);
    const a2 = anim(dot2, 150);
    const a3 = anim(dot3, 300);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, []);

  return (
    <View style={typStyles.row}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            typStyles.dot,
            { backgroundColor: color, transform: [{ translateY: dot }] },
          ]}
        />
      ))}
    </View>
  );
}

const typStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 4, alignItems: "center", padding: 12 },
  dot: { width: 7, height: 7, borderRadius: 4 },
});

export default function CharacterChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getCharacterById, characterChats, sendCharacterMessage } = useCharacters();
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [holdProgress] = useState(new Animated.Value(0));
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const character = getCharacterById(id!);
  const messages = characterChats[id!] ?? [];

  const initMessages = character
    ? [
        {
          id: "init",
          senderId: id!,
          text: character.greeting,
          timestamp: Date.now() - 30000,
        },
      ]
    : [];

  const allMessages = messages.length > 0 ? [...messages].reverse() : [...initMessages].reverse();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !character) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTyping(true);
    sendCharacterMessage(id!, trimmed);
    setText("");
    setTimeout(() => setIsTyping(false), 2200);
  };

  const startRecording = () => {
    setIsRecording(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.timing(holdProgress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    holdProgress.setValue(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!character) return null;

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
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="char-back">
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <View style={styles.charInfo}>
          <View style={styles.charAvatarWrap}>
            <Image source={{ uri: character.avatar }} style={styles.charAvatar} />
            <View style={[styles.aiBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          </View>
          <View>
            <Text style={[styles.charName, { color: colors.foreground }]}>
              {character.emoji} {character.name}
            </Text>
            <Text style={[styles.charCategory, { color: colors.mutedForeground }]}>
              {character.category} • {character.voiceStyle} voice
            </Text>
          </View>
        </View>
        <Pressable testID="char-info-btn">
          <Feather name="info" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <FlatList
        data={allMessages}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          isTyping ? (
            <View style={styles.typingRow}>
              <Image source={{ uri: character.avatar }} style={styles.typingAvatar} />
              <View style={[styles.typingBubble, { backgroundColor: colors.muted }]}>
                <TypingIndicator color={colors.mutedForeground} />
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const isMe = item.senderId === "me";
          return (
            <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}>
              {!isMe && (
                <Image source={{ uri: character.avatar }} style={styles.msgAvatar} />
              )}
              <View
                style={[
                  styles.bubble,
                  isMe
                    ? [styles.bubbleMe, { backgroundColor: colors.primary }]
                    : [styles.bubbleThem, { backgroundColor: colors.muted }],
                ]}
              >
                {item.isVoice ? (
                  <View style={styles.voiceMsg}>
                    <Ionicons
                      name="play-circle"
                      size={28}
                      color={isMe ? "#fff" : colors.primary}
                    />
                    <View style={styles.waveform}>
                      {[...Array(16)].map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.waveBar,
                            {
                              height: 4 + Math.sin(i * 0.8) * 8 + Math.random() * 6,
                              backgroundColor: isMe ? "rgba(255,255,255,0.7)" : colors.primary,
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[styles.voiceDur, { color: isMe ? "rgba(255,255,255,0.8)" : colors.mutedForeground }]}>
                      {item.voiceDuration ?? "0:12"}s
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.bubbleText,
                      { color: isMe ? "#fff" : colors.foreground },
                    ]}
                  >
                    {item.text}
                  </Text>
                )}
              </View>
            </View>
          );
        }}
      />

      {isRecording && (
        <View style={[styles.recordingOverlay, { backgroundColor: colors.background + "f0" }]}>
          <Animated.View
            style={[
              styles.recordingRing,
              {
                borderColor: colors.like,
                width: holdProgress.interpolate({ inputRange: [0, 1], outputRange: [60, 120] }),
                height: holdProgress.interpolate({ inputRange: [0, 1], outputRange: [60, 120] }),
                borderRadius: holdProgress.interpolate({ inputRange: [0, 1], outputRange: [30, 60] }),
              },
            ]}
          >
            <Ionicons name="mic" size={32} color={colors.like} />
          </Animated.View>
          <Text style={[styles.recordingText, { color: colors.foreground }]}>
            Release to send
          </Text>
          <Text style={[styles.recordingHint, { color: colors.mutedForeground }]}>
            Swipe up to cancel
          </Text>
        </View>
      )}

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
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.muted, borderRadius: 22 },
          ]}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={`Chat with ${character.name}...`}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            multiline
            returnKeyType="default"
            testID="char-input"
          />
        </View>
        {text.trim() ? (
          <Pressable
            onPress={handleSend}
            style={[styles.sendBtn, { backgroundColor: colors.primary, borderRadius: 22 }]}
            testID="char-send"
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        ) : (
          <Pressable
            onPressIn={startRecording}
            onPressOut={stopRecording}
            style={[styles.voiceBtn, { backgroundColor: colors.muted, borderRadius: 22 }]}
            testID="char-voice"
          >
            <Ionicons
              name={isRecording ? "mic" : "mic-outline"}
              size={22}
              color={isRecording ? colors.like : colors.foreground}
            />
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: {},
  charInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  charAvatarWrap: { position: "relative" },
  charAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd",
  },
  aiBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  aiBadgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "800" as const,
  },
  charName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  charCategory: {
    fontSize: 11,
    marginTop: 1,
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
    gap: 8,
  },
  typingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ddd",
  },
  typingBubble: {
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 6,
    gap: 8,
  },
  msgRowMe: { justifyContent: "flex-end" },
  msgRowThem: { justifyContent: "flex-start" },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ddd",
    marginBottom: 4,
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleThem: { borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  voiceMsg: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 2,
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 24,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  voiceDur: {
    fontSize: 11,
  },
  recordingOverlay: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 24,
  },
  recordingRing: {
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  recordingText: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  recordingHint: {
    fontSize: 12,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
  },
  input: {
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
