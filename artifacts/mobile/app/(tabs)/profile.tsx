import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useWallet } from "@/context/WalletContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const GRID_CELL = (width - 3) / 3;

const POST_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
  "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400",
  "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  "https://images.unsplash.com/photo-1490750967868-88df5691cc23?w=400",
  "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=400",
  "https://images.unsplash.com/photo-1525498128493-380d1990a112?w=400",
  "https://images.unsplash.com/photo-1500575033065-97cb51fd2d05?w=400",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400",
];

const HIGHLIGHTS = [
  { id: "h1", name: "Travel", avatar: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100" },
  { id: "h2", name: "Food", avatar: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=100" },
  { id: "h3", name: "Friends", avatar: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=100" },
  { id: "h4", name: "Art", avatar: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=100" },
];

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { me } = useApp();
  const { totalUsd, activeTier } = useWallet();
  const [activeTab, setActiveTab] = useState<"grid" | "tagged">("grid");
  const [showEdit, setShowEdit] = useState(false);
  const [bio, setBio] = useState(me.bio);
  const [name, setName] = useState(me.displayName);
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;

  const ProfileHeader = () => (
    <View>
      <View style={styles.userSection}>
        <View style={styles.topRow}>
          <Image
            source={{ uri: me.avatar }}
            style={[styles.mainAvatar, { borderColor: colors.border }]}
          />
          <View style={styles.statsRow}>
            {[
              { label: "Posts", value: me.postsCount },
              { label: "Followers", value: me.followers },
              { label: "Following", value: me.following },
            ].map((stat) => (
              <Pressable key={stat.label} style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {formatCount(stat.value)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  {stat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Text style={[styles.displayName, { color: colors.foreground }]}>
          {name}
        </Text>
        <Text style={[styles.bio, { color: colors.foreground }]}>{bio}</Text>

        <View style={styles.actionButtons}>
          <Pressable
            style={[
              styles.editBtn,
              { backgroundColor: colors.secondary, borderRadius: colors.radius },
            ]}
            onPress={() => setShowEdit(true)}
            testID="edit-profile-btn"
          >
            <Text style={[styles.editBtnText, { color: colors.foreground }]}>
              Edit Profile
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.editBtn,
              { backgroundColor: colors.secondary, borderRadius: colors.radius },
            ]}
          >
            <Text style={[styles.editBtnText, { color: colors.foreground }]}>
              Share Profile
            </Text>
          </Pressable>
          <Pressable
            style={[styles.addBtn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
          >
            <Feather name="user-plus" size={16} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      <View style={styles.creatorPanel}>
        <Pressable
          style={[styles.creatorPanelBtn, { backgroundColor: "#1a0533" }]}
          onPress={() => router.push("/wallet")}
        >
          <FontAwesome5 name="coins" size={16} color="#F7931A" />
          <View style={styles.creatorPanelInfo}>
            <Text style={styles.creatorPanelLabel}>Crypto Wallet</Text>
            <Text style={styles.creatorPanelValue}>${totalUsd.toFixed(2)}</Text>
          </View>
          <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.5)" />
        </Pressable>
        <Pressable
          style={[styles.creatorPanelBtn, { backgroundColor: "#0d1a3a" }]}
          onPress={() => router.push("/creator-dashboard")}
        >
          <Ionicons name="stats-chart" size={16} color="#4CAF50" />
          <View style={styles.creatorPanelInfo}>
            <Text style={styles.creatorPanelLabel}>Creator Dashboard</Text>
            <Text style={styles.creatorPanelValue}>$169/week</Text>
          </View>
          <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.5)" />
        </Pressable>
        <Pressable
          style={[styles.creatorPanelBtn, { backgroundColor: "#2a0a4a" }]}
          onPress={() => router.push("/premium")}
        >
          <Ionicons name="star" size={16} color="#833AB4" />
          <View style={styles.creatorPanelInfo}>
            <Text style={styles.creatorPanelLabel}>Subscription</Text>
            <Text style={styles.creatorPanelValue}>{activeTier === "pro" ? "Vibe Pro" : activeTier === "creator" ? "Creator Elite" : activeTier === "plus" ? "Vibe+" : "Free"}</Text>
          </View>
          <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.5)" />
        </Pressable>
        <Pressable
          style={[styles.creatorPanelBtn, { backgroundColor: "#0a1a10" }]}
          onPress={() => router.push("/ai-studio")}
        >
          <MaterialCommunityIcons name="creation" size={16} color="#00C9A7" />
          <View style={styles.creatorPanelInfo}>
            <Text style={styles.creatorPanelLabel}>AI Creative Studio</Text>
            <Text style={styles.creatorPanelValue}>Unlimited Generations ✨</Text>
          </View>
          <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.5)" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.highlightsList}
      >
        <Pressable style={styles.highlightAdd} testID="add-highlight">
          <View style={[styles.highlightCircle, { borderColor: colors.border }]}>
            <Feather name="plus" size={22} color={colors.foreground} />
          </View>
          <Text style={[styles.highlightName, { color: colors.foreground }]}>New</Text>
        </Pressable>
        {HIGHLIGHTS.map((h) => (
          <Pressable key={h.id} style={styles.highlightItem}>
            <View style={[styles.highlightRing, { borderColor: colors.border }]}>
              <Image source={{ uri: h.avatar }} style={styles.highlightCircle} />
            </View>
            <Text style={[styles.highlightName, { color: colors.foreground }]}>
              {h.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.tabBar, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
        <Pressable
          style={[styles.tab, activeTab === "grid" && styles.tabActive]}
          onPress={() => setActiveTab("grid")}
          testID="tab-grid"
        >
          <Ionicons
            name="grid-outline"
            size={22}
            color={activeTab === "grid" ? colors.foreground : colors.mutedForeground}
          />
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "tagged" && styles.tabActive]}
          onPress={() => setActiveTab("tagged")}
          testID="tab-tagged"
        >
          <Ionicons
            name="person-circle-outline"
            size={22}
            color={activeTab === "tagged" ? colors.foreground : colors.mutedForeground}
          />
        </Pressable>
      </View>
    </View>
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
        <Pressable style={styles.headerBtn}>
          <Feather name="lock" size={16} color={colors.foreground} />
          <Text style={[styles.username, { color: colors.foreground }]}>
            {me.username}
          </Text>
          <Feather name="chevron-down" size={16} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="plus-box-outline"
              size={26}
              color={colors.foreground}
            />
          </Pressable>
          <Pressable style={styles.headerIcon} testID="settings-btn">
            <Ionicons name="settings-outline" size={24} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={POST_IMAGES.map((img, i) => ({ id: i.toString(), url: img }))}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={[
          styles.gridContent,
          { paddingTop: headerTop + 50, paddingBottom: isWeb ? 84 + 34 : 90 },
        ]}
        ListHeaderComponent={ProfileHeader}
        renderItem={({ item }) => (
          <Pressable testID={`profile-post-${item.id}`}>
            <Image
              source={{ uri: item.url }}
              style={[styles.gridCell, { width: GRID_CELL, height: GRID_CELL }]}
              resizeMode="cover"
            />
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
        scrollEnabled
      />

      {showEdit && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background, zIndex: 100 }]}>
          <View style={[styles.editHeader, { paddingTop: headerTop, borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setShowEdit(false)}>
              <Feather name="x" size={24} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.editTitle, { color: colors.foreground }]}>Edit Profile</Text>
            <Pressable onPress={() => { setShowEdit(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}>
              <Text style={[styles.saveBtn, { color: colors.primary }]}>Done</Text>
            </Pressable>
          </View>
          <View style={styles.editForm}>
            <View style={[styles.formField, { borderBottomColor: colors.border }]}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={[styles.fieldInput, { color: colors.foreground }]}
                testID="edit-name"
              />
            </View>
            <View style={[styles.formField, { borderBottomColor: colors.border }]}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Username</Text>
              <TextInput
                value={me.username}
                editable={false}
                style={[styles.fieldInput, { color: colors.mutedForeground }]}
              />
            </View>
            <View style={[styles.formField, { borderBottomColor: colors.border }]}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Bio</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                style={[styles.fieldInput, { color: colors.foreground }]}
                multiline
                numberOfLines={3}
                testID="edit-bio"
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  username: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  headerRight: {
    flexDirection: "row",
    gap: 14,
  },
  headerIcon: {},
  userSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  mainAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    backgroundColor: "#ccc",
  },
  statsRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    marginLeft: 20,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  displayName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  bio: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  editBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  addBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  creatorPanel: {
    marginHorizontal: 14,
    marginBottom: 14,
    gap: 8,
  },
  creatorPanelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  creatorPanelInfo: {
    flex: 1,
  },
  creatorPanelLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: "500" as const,
  },
  creatorPanelValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700" as const,
    marginTop: 1,
  },
  highlightsList: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 16,
  },
  highlightAdd: {
    alignItems: "center",
  },
  highlightItem: {
    alignItems: "center",
  },
  highlightRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  highlightCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
  },
  highlightName: {
    fontSize: 11,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 0.5,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  gridContent: {},
  gridRow: {
    gap: 1.5,
    marginBottom: 1.5,
  },
  gridCell: {
    backgroundColor: "#e0e0e0",
  },
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  editTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  saveBtn: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  editForm: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  formField: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "600" as const,
  },
  fieldInput: {
    fontSize: 15,
  },
});
