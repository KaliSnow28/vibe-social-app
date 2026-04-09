import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const GROUP_INFO = {
  name: "Vibe Creator Crew 🎨",
  avatar: "https://i.pravatar.cc/80?img=5",
  members: [
    { id:"m1", name:"Luna Starr",   avatar:"https://i.pravatar.cc/60?img=1"  },
    { id:"m2", name:"Alex Nova",    avatar:"https://i.pravatar.cc/60?img=8"  },
    { id:"m3", name:"Mia Chen",     avatar:"https://i.pravatar.cc/60?img=5"  },
    { id:"m4", name:"Kai Blaze",    avatar:"https://i.pravatar.cc/60?img=12" },
    { id:"m5", name:"You",          avatar:"https://i.pravatar.cc/60?img=33" },
  ],
};

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
  type: "text" | "voice" | "image" | "emoji" | "system";
  duration?: number;
  reactions?: { emoji: string; count: number }[];
  isMe: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  { id:"1", senderId:"m1", senderName:"Luna Starr",  senderAvatar:"https://i.pravatar.cc/60?img=1",  text:"Hey everyone! 👋 Just launched my new photo pack 🔥", timestamp: Date.now()-3600000*5, type:"text",  isMe:false, reactions:[{emoji:"🔥",count:3},{emoji:"❤️",count:2}] },
  { id:"2", senderId:"m2", senderName:"Alex Nova",   senderAvatar:"https://i.pravatar.cc/60?img=8",  text:"Congrats Luna! It looks amazing 😍", timestamp: Date.now()-3600000*4, type:"text",  isMe:false },
  { id:"3", senderId:"m3", senderName:"Mia Chen",    senderAvatar:"https://i.pravatar.cc/60?img=5",  text:"So proud of you! The colours are everything ✨", timestamp: Date.now()-3600000*3, type:"text",  isMe:false },
  { id:"4", senderId:"m5", senderName:"You",         senderAvatar:"https://i.pravatar.cc/60?img=33", text:"This is incredible work! How long did it take?", timestamp: Date.now()-3600000*2, type:"text",  isMe:true  },
  { id:"5", senderId:"m4", senderName:"Kai Blaze",   senderAvatar:"https://i.pravatar.cc/60?img=12", text:"🎉", timestamp: Date.now()-3600000,   type:"emoji", isMe:false },
  { id:"6", senderId:"m1", senderName:"Luna Starr",  senderAvatar:"https://i.pravatar.cc/60?img=1",  text:"Thanks all! Took about 3 weeks of shooting 📸 Worth every second!", timestamp: Date.now()-1800000, type:"text",  isMe:false },
  { id:"s1", senderId:"system", senderName:"", senderAvatar:"", text:"Luna Starr added you to this group", timestamp: Date.now()-7200000*5, type:"system", isMe:false },
];

const QUICK_REACTIONS = ["❤️","🔥","😂","👏","🎉","😍"];

export default function GroupChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [showReactionFor, setShowReactionFor] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const msg: Message = {
      id: Date.now().toString(),
      senderId: "m5",
      senderName: "You",
      senderAvatar: "https://i.pravatar.cc/60?img=33",
      text: inputText.trim(),
      timestamp: Date.now(),
      type: "text",
      isMe: true,
    };
    setMessages(prev => [...prev, msg]);
    setInputText("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendVoice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Voice Message", "Hold the mic button to record a voice message.");
  };

  const addReaction = (messageId: string, emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const existing = m.reactions?.find(r => r.emoji === emoji);
      if (existing) {
        return { ...m, reactions: m.reactions!.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r) };
      }
      return { ...m, reactions: [...(m.reactions || []), { emoji, count: 1 }] };
    }));
    setShowReactionFor(null);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.type === "system") {
      return <View style={styles.systemMsg}><Text style={[styles.systemText, { color: colors.mutedForeground }]}>{item.text}</Text></View>;
    }
    if (item.type === "emoji") {
      return (
        <View style={[styles.msgRow, item.isMe && styles.msgRowMe]}>
          {!item.isMe && <Image source={{ uri: item.senderAvatar }} style={styles.msgAvatar} />}
          <Text style={styles.emojiMsg}>{item.text}</Text>
        </View>
      );
    }
    return (
      <View style={[styles.msgRow, item.isMe && styles.msgRowMe]}>
        {!item.isMe && <Image source={{ uri: item.senderAvatar }} style={styles.msgAvatar} />}
        <View style={{ maxWidth: "75%" }}>
          {!item.isMe && <Text style={[styles.senderName, { color: colors.mutedForeground }]}>{item.senderName}</Text>}
          <Pressable onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowReactionFor(item.id); }}>
            <View style={[styles.bubble, item.isMe ? styles.bubbleMe : [styles.bubbleThem, { backgroundColor: colors.card, borderColor: colors.border }]]}>
              <Text style={[styles.bubbleText, { color: item.isMe ? "#fff" : colors.foreground }]}>{item.text}</Text>
              <Text style={[styles.bubbleTime, { color: item.isMe ? "rgba(255,255,255,0.6)" : colors.mutedForeground }]}>{formatTime(item.timestamp)}</Text>
            </View>
          </Pressable>
          {item.reactions && item.reactions.length > 0 && (
            <View style={[styles.reactionsRow, item.isMe && { justifyContent: "flex-end" }]}>
              {item.reactions.map(r => (
                <Pressable key={r.emoji} onPress={() => addReaction(item.id, r.emoji)} style={[styles.reactionBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                  <Text style={[styles.reactionCount, { color: colors.foreground }]}>{r.count}</Text>
                </Pressable>
              ))}
            </View>
          )}
          {showReactionFor === item.id && (
            <View style={[styles.reactionPicker, { backgroundColor: colors.card, borderColor: colors.border, alignSelf: item.isMe ? "flex-end" : "flex-start" }]}>
              {QUICK_REACTIONS.map(e => (
                <Pressable key={e} onPress={() => addReaction(item.id, e)} style={styles.quickReaction}>
                  <Text style={styles.quickReactionText}>{e}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <LinearGradient colors={["#0d0d1a","#1a0533"]} style={[styles.header, { paddingTop: (isWeb ? 67 : insets.top) + 8 }]}>
        <Pressable onPress={() => router.back()}><Feather name="arrow-left" size={22} color="#fff" /></Pressable>
        <Pressable onPress={() => Alert.alert(GROUP_INFO.name, `${GROUP_INFO.members.length} members`)} style={styles.headerCenter}>
          <Image source={{ uri: GROUP_INFO.avatar }} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerName}>{GROUP_INFO.name}</Text>
            <Text style={styles.headerSub}>{GROUP_INFO.members.length} members</Text>
          </View>
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={() => Alert.alert("Voice Call", "Starting group voice call...")} style={styles.headerBtn}>
            <Feather name="phone" size={20} color="#fff" />
          </Pressable>
          <Pressable onPress={() => Alert.alert("Group Info", `Members:\n${GROUP_INFO.members.map(m => m.name).join("\n")}`)} style={styles.headerBtn}>
            <Feather name="info" size={20} color="#fff" />
          </Pressable>
        </View>
      </LinearGradient>

      <View style={styles.membersBar}>
        {GROUP_INFO.members.slice(0, 4).map(m => (
          <Image key={m.id} source={{ uri: m.avatar }} style={[styles.memberDot, { borderColor: colors.background }]} />
        ))}
        {GROUP_INFO.members.length > 4 && (
          <View style={[styles.memberMore, { backgroundColor: colors.muted }]}>
            <Text style={[styles.memberMoreText, { color: colors.foreground }]}>+{GROUP_INFO.members.length - 4}</Text>
          </View>
        )}
        <Pressable onPress={() => Alert.alert("Add Member", "Invite someone to this group.")} style={[styles.addMemberBtn, { backgroundColor: colors.muted }]}>
          <Feather name="user-plus" size={14} color={colors.foreground} />
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[styles.list, { paddingBottom: 20 }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: isWeb ? 16 : insets.bottom + 12 }]}>
        <Pressable onPress={() => Alert.alert("Media", "Send a photo, video, or file.")} style={[styles.inputAction, { backgroundColor: colors.muted }]}>
          <Feather name="image" size={18} color={colors.foreground} />
        </Pressable>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Message the group..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
          multiline
          onSubmitEditing={sendMessage}
        />
        {inputText.trim() ? (
          <Pressable onPress={sendMessage} style={[styles.sendBtn, { backgroundColor: "#E1306C" }]}>
            <Feather name="send" size={17} color="#fff" />
          </Pressable>
        ) : (
          <Pressable onPress={sendVoice} style={[styles.sendBtn, { backgroundColor: colors.muted }]}>
            <Feather name="mic" size={17} color={colors.foreground} />
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 14, gap: 10 },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18 },
  headerName: { color: "#fff", fontSize: 14, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
  headerActions: { flexDirection: "row", gap: 14 },
  headerBtn: {},
  membersBar: { flexDirection: "row", alignItems: "center", gap: -8, paddingHorizontal: 16, paddingVertical: 8 },
  memberDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2 },
  memberMore: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginLeft: 4 },
  memberMoreText: { fontSize: 10, fontWeight: "700" },
  addMemberBtn: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginLeft: 12 },
  list: { paddingHorizontal: 12, paddingTop: 12 },
  systemMsg: { alignItems: "center", marginVertical: 10 },
  systemText: { fontSize: 12, fontStyle: "italic" },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 12 },
  msgRowMe: { flexDirection: "row-reverse" },
  msgAvatar: { width: 30, height: 30, borderRadius: 15, marginBottom: 4 },
  senderName: { fontSize: 11, marginBottom: 3, marginLeft: 4 },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  bubbleMe: { backgroundColor: "#E1306C", borderBottomRightRadius: 4 },
  bubbleThem: { borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontSize: 10, textAlign: "right" },
  emojiMsg: { fontSize: 36 },
  reactionsRow: { flexDirection: "row", gap: 4, marginTop: 4, marginLeft: 4 },
  reactionBubble: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 12, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3 },
  reactionEmoji: { fontSize: 12 },
  reactionCount: { fontSize: 11, fontWeight: "600" },
  reactionPicker: { flexDirection: "row", borderRadius: 20, borderWidth: 1, padding: 6, gap: 4, marginTop: 6 },
  quickReaction: { padding: 4 },
  quickReactionText: { fontSize: 22 },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  inputAction: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
});
