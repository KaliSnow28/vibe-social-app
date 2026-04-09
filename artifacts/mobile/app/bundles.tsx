import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

interface GemPack {
  id: string;
  gems: number;
  bonus: number;
  price: number;
  label: string;
  color: [string, string];
  badge?: string;
  icon: string;
}

interface CreatorBundle {
  id: string;
  creator: string;
  handle: string;
  avatar: string;
  items: number;
  preview: string;
  price: number;
  type: string;
  badge?: string;
}

interface SpecialDeal {
  id: string;
  title: string;
  description: string;
  original: number;
  sale: number;
  discount: number;
  expiresIn: string;
  icon: string;
  color: [string, string];
  items: string[];
}

const GEM_PACKS: GemPack[] = [
  { id: "g1", gems: 70, bonus: 0, price: 0.99, label: "Starter", color: ["#4CAF50", "#2E7D32"], icon: "💎" },
  { id: "g2", gems: 350, bonus: 50, price: 4.99, label: "Popular", color: ["#2196F3", "#1565C0"], badge: "BEST VALUE", icon: "💎💎" },
  { id: "g3", gems: 750, bonus: 150, price: 9.99, label: "Premium", color: ["#9C27B0", "#6A1B9A"], icon: "💎💎💎" },
  { id: "g4", gems: 1600, bonus: 400, price: 19.99, label: "Mega", color: ["#E1306C", "#B71C1C"], badge: "+25% BONUS", icon: "🌟" },
  { id: "g5", gems: 3500, bonus: 1000, price: 39.99, label: "Super", color: ["#F7931A", "#E65100"], badge: "+29% BONUS", icon: "⚡" },
  { id: "g6", gems: 8000, bonus: 3000, price: 79.99, label: "Elite", color: ["#00BCD4", "#006064"], badge: "+38% BONUS", icon: "👑" },
];

const CREATOR_BUNDLES: CreatorBundle[] = [
  {
    id: "cb1",
    creator: "Luna Starr",
    handle: "lunastarr",
    avatar: "https://i.pravatar.cc/80?img=1",
    items: 48,
    preview: "https://picsum.photos/seed/luna1/200/200",
    price: 9.99,
    type: "Photo Pack",
    badge: "HOT",
  },
  {
    id: "cb2",
    creator: "Alex Nova",
    handle: "alexnova",
    avatar: "https://i.pravatar.cc/80?img=8",
    items: 12,
    preview: "https://picsum.photos/seed/alex1/200/200",
    price: 14.99,
    type: "Video Pack",
  },
  {
    id: "cb3",
    creator: "Mia Chen",
    handle: "miachen",
    avatar: "https://i.pravatar.cc/80?img=5",
    items: 25,
    preview: "https://picsum.photos/seed/mia1/200/200",
    price: 7.99,
    type: "Art Bundle",
    badge: "NEW",
  },
  {
    id: "cb4",
    creator: "Kai Blaze",
    handle: "kaiblaze",
    avatar: "https://i.pravatar.cc/80?img=12",
    items: 30,
    preview: "https://picsum.photos/seed/kai1/200/200",
    price: 19.99,
    type: "Tutorial Pack",
  },
];

const SPECIAL_DEALS: SpecialDeal[] = [
  {
    id: "sd1",
    title: "Vibe Mega Bundle",
    description: "Everything you need to dominate the platform",
    original: 49.99,
    sale: 19.99,
    discount: 60,
    expiresIn: "23:47:12",
    icon: "🔥",
    color: ["#E1306C", "#833AB4"],
    items: ["2,500 Gems", "1 Month Vibe Pro", "5 Creator Bundles", "Exclusive Badge"],
  },
  {
    id: "sd2",
    title: "Starter Creator Pack",
    description: "Perfect for new creators ready to grow",
    original: 24.99,
    sale: 9.99,
    discount: 60,
    expiresIn: "47:22:08",
    icon: "✨",
    color: ["#F7931A", "#E65100"],
    items: ["500 Gems", "Creator Dashboard Pro", "3 Featured Spots", "Analytics Boost"],
  },
];

function makeId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export default function BundlesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;

  const [gemBalance, setGemBalance] = useState(340);
  const [selectedTab, setSelectedTab] = useState<"gems" | "creators" | "deals">("gems");
  const [purchaseModal, setPurchaseModal] = useState<{ visible: boolean; item: GemPack | null }>({ visible: false, item: null });
  const [dealModal, setDealModal] = useState<{ visible: boolean; deal: SpecialDeal | null }>({ visible: false, deal: null });

  const handleBuyGems = (pack: GemPack) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPurchaseModal({ visible: true, item: pack });
  };

  const confirmPurchase = (pack: GemPack) => {
    const total = pack.gems + pack.bonus;
    setGemBalance((prev) => prev + total);
    setPurchaseModal({ visible: false, item: null });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Purchase Successful! 💎",
      `You received ${total.toLocaleString()} gems${pack.bonus > 0 ? ` (includes ${pack.bonus} bonus gems)` : ""}!`,
      [{ text: "Awesome!", style: "default" }]
    );
  };

  const handleBuyDeal = (deal: SpecialDeal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setDealModal({ visible: true, deal });
  };

  const confirmDeal = (deal: SpecialDeal) => {
    setDealModal({ visible: false, deal: null });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Bundle Purchased! 🎉", `You unlocked the ${deal.title}!`, [{ text: "Let's Go!", style: "default" }]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#0d0d1a", "#1a0533"]} style={[styles.header, { paddingTop: headerTop + 8 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Bundles & Shop</Text>
          <View style={styles.gemBadge}>
            <Text style={styles.gemIcon}>💎</Text>
            <Text style={styles.gemBalance}>{gemBalance.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.tabsRow}>
          {(["gems", "creators", "deals"] as const).map((t) => (
            <Pressable key={t} onPress={() => setSelectedTab(t)} style={[styles.tab, selectedTab === t && styles.tabActive]}>
              <Text style={[styles.tabText, selectedTab === t && styles.tabTextActive]}>
                {t === "gems" ? "💎 Gems" : t === "creators" ? "🎨 Creators" : "🔥 Deals"}
              </Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {selectedTab === "gems" && (
          <View style={styles.content}>
            <View style={[styles.infoBox, { backgroundColor: "#F7931A15", borderColor: "#F7931A30" }]}>
              <FontAwesome5 name="fire" size={16} color="#F7931A" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoTitle, { color: colors.foreground }]}>Use Gems to Send Gifts</Text>
                <Text style={[styles.infoSub, { color: colors.mutedForeground }]}>
                  Gift your favourite creators during live streams. 70% goes directly to them.
                </Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Choose Your Pack</Text>

            <View style={styles.packsGrid}>
              {GEM_PACKS.map((pack) => (
                <Pressable key={pack.id} onPress={() => handleBuyGems(pack)} style={styles.packWrapper}>
                  <LinearGradient colors={pack.color} style={styles.packCard}>
                    {pack.badge && (
                      <View style={styles.packBadge}>
                        <Text style={styles.packBadgeText}>{pack.badge}</Text>
                      </View>
                    )}
                    <Text style={styles.packIcon}>{pack.icon}</Text>
                    <Text style={styles.packGems}>{(pack.gems + pack.bonus).toLocaleString()}</Text>
                    <Text style={styles.packGemsLabel}>gems</Text>
                    {pack.bonus > 0 && (
                      <View style={styles.packBonusRow}>
                        <Text style={styles.packBase}>{pack.gems.toLocaleString()}</Text>
                        <Text style={styles.packBonus}>+{pack.bonus} bonus</Text>
                      </View>
                    )}
                    <Text style={styles.packLabel}>{pack.label}</Text>
                    <View style={styles.packPriceRow}>
                      <Text style={styles.packPrice}>${pack.price.toFixed(2)}</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>

            <View style={[styles.giftGuide, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.giftGuideTitle, { color: colors.foreground }]}>Gift Guide 🎁</Text>
              {[
                { gift: "Rose 🌹", cost: "10 gems" },
                { gift: "Fireworks 🎆", cost: "50 gems" },
                { gift: "Crown 👑", cost: "200 gems" },
                { gift: "Rocket 🚀", cost: "500 gems" },
                { gift: "Diamond 💎", cost: "1000 gems" },
              ].map((g) => (
                <View key={g.gift} style={[styles.giftRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.giftName, { color: colors.foreground }]}>{g.gift}</Text>
                  <Text style={[styles.giftCost, { color: colors.mutedForeground }]}>{g.cost}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {selectedTab === "creators" && (
          <View style={styles.content}>
            <View style={[styles.infoBox, { backgroundColor: "#E1306C15", borderColor: "#E1306C30" }]}>
              <Ionicons name="images" size={16} color="#E1306C" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoTitle, { color: colors.foreground }]}>Exclusive Creator Content</Text>
                <Text style={[styles.infoSub, { color: colors.mutedForeground }]}>
                  Buy exclusive photo packs, video collections, and tutorial bundles directly from creators.
                </Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Featured Bundles</Text>

            {CREATOR_BUNDLES.map((bundle) => (
              <Pressable
                key={bundle.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    `${bundle.creator}'s ${bundle.type}`,
                    `${bundle.items} exclusive pieces for $${bundle.price.toFixed(2)}`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: `Buy $${bundle.price.toFixed(2)}`,
                        onPress: () => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          Alert.alert("Purchased! 🎉", `You now have access to ${bundle.creator}'s exclusive ${bundle.type}.`);
                        },
                      },
                    ]
                  );
                }}
                style={[styles.creatorBundleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.cbPreviewRow}>
                  <Image source={{ uri: bundle.preview }} style={styles.cbPreview} resizeMode="cover" />
                  <LinearGradient colors={["transparent", "rgba(0,0,0,0.6)"]} style={StyleSheet.absoluteFill} />
                  {bundle.badge && (
                    <View style={[styles.cbBadge, { backgroundColor: bundle.badge === "HOT" ? "#E1306C" : "#4CAF50" }]}>
                      <Text style={styles.cbBadgeText}>{bundle.badge}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cbInfo}>
                  <View style={styles.cbCreatorRow}>
                    <Image source={{ uri: bundle.avatar }} style={styles.cbAvatar} />
                    <View>
                      <Text style={[styles.cbCreatorName, { color: colors.foreground }]}>{bundle.creator}</Text>
                      <Text style={[styles.cbHandle, { color: colors.mutedForeground }]}>@{bundle.handle}</Text>
                    </View>
                  </View>
                  <View style={styles.cbMeta}>
                    <View style={[styles.cbTypeBadge, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.cbTypeText, { color: colors.foreground }]}>{bundle.type}</Text>
                    </View>
                    <Text style={[styles.cbItems, { color: colors.mutedForeground }]}>{bundle.items} items</Text>
                  </View>
                  <View style={styles.cbPriceRow}>
                    <Text style={[styles.cbPrice, { color: colors.primary }]}>${bundle.price.toFixed(2)}</Text>
                    <Pressable
                      style={[styles.cbBuyBtn, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        Alert.alert(
                          "Purchase Bundle",
                          `Get ${bundle.creator}'s ${bundle.type} (${bundle.items} items) for $${bundle.price.toFixed(2)}?`,
                          [
                            { text: "Cancel", style: "cancel" },
                            { text: "Buy Now", onPress: () => Alert.alert("Purchased! 🎉", `Unlocked ${bundle.creator}'s exclusive content.`) },
                          ]
                        );
                      }}
                    >
                      <Text style={styles.cbBuyText}>Buy Bundle</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}

            <Pressable
              style={[styles.becomeCreatorBtn, { borderColor: colors.primary }]}
              onPress={() => router.push("/creator-dashboard")}
            >
              <MaterialCommunityIcons name="account-star" size={18} color={colors.primary} />
              <Text style={[styles.becomeCreatorText, { color: colors.primary }]}>Sell Your Own Bundles →</Text>
            </Pressable>
          </View>
        )}

        {selectedTab === "deals" && (
          <View style={styles.content}>
            <View style={[styles.infoBox, { backgroundColor: "#F7931A15", borderColor: "#F7931A30" }]}>
              <FontAwesome5 name="bolt" size={14} color="#F7931A" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoTitle, { color: colors.foreground }]}>Limited Time Offers</Text>
                <Text style={[styles.infoSub, { color: colors.mutedForeground }]}>
                  Massive savings bundling gems, subscriptions, and creator content. Don't miss out!
                </Text>
              </View>
            </View>

            {SPECIAL_DEALS.map((deal) => (
              <Pressable key={deal.id} onPress={() => handleBuyDeal(deal)} style={styles.dealCard}>
                <LinearGradient colors={deal.color} style={styles.dealGradient}>
                  <View style={styles.dealHeader}>
                    <Text style={styles.dealIcon}>{deal.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dealTitle}>{deal.title}</Text>
                      <Text style={styles.dealDesc}>{deal.description}</Text>
                    </View>
                    <View style={styles.dealDiscountBadge}>
                      <Text style={styles.dealDiscount}>-{deal.discount}%</Text>
                    </View>
                  </View>

                  <View style={styles.dealItems}>
                    {deal.items.map((item) => (
                      <View key={item} style={styles.dealItemRow}>
                        <Ionicons name="checkmark-circle" size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.dealItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.dealFooter}>
                    <View>
                      <Text style={styles.dealOriginal}>${deal.original.toFixed(2)}</Text>
                      <Text style={styles.dealSale}>${deal.sale.toFixed(2)}</Text>
                    </View>
                    <View style={styles.dealTimerBox}>
                      <Feather name="clock" size={12} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.dealTimer}>{deal.expiresIn}</Text>
                    </View>
                    <View style={styles.dealBuyBtn}>
                      <Text style={styles.dealBuyText}>Grab Deal</Text>
                      <Feather name="chevron-right" size={14} color="#fff" />
                    </View>
                  </View>
                </LinearGradient>
              </Pressable>
            ))}

            <View style={[styles.safePayment, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <FontAwesome5 name="lock" size={14} color="#4CAF50" />
              <Text style={[styles.safeText, { color: colors.mutedForeground }]}>
                Secure payments via Apple Pay, Google Pay, or credit card. All purchases are final.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={purchaseModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.purchaseCard, { backgroundColor: colors.card }]}>
            {purchaseModal.item && (
              <>
                <LinearGradient colors={purchaseModal.item.color} style={styles.purchaseHeader}>
                  <Text style={styles.purchaseIcon}>{purchaseModal.item.icon}</Text>
                  <Text style={styles.purchaseGems}>{(purchaseModal.item.gems + purchaseModal.item.bonus).toLocaleString()}</Text>
                  <Text style={styles.purchaseGemsLabel}>gems</Text>
                  {purchaseModal.item.bonus > 0 && (
                    <Text style={styles.purchaseBonus}>
                      {purchaseModal.item.gems.toLocaleString()} + {purchaseModal.item.bonus} bonus
                    </Text>
                  )}
                </LinearGradient>
                <View style={styles.purchaseBody}>
                  <Text style={[styles.purchasePackName, { color: colors.foreground }]}>
                    {purchaseModal.item.label} Pack
                  </Text>
                  <Text style={[styles.purchasePrice, { color: colors.primary }]}>
                    ${purchaseModal.item.price.toFixed(2)}
                  </Text>
                  <Text style={[styles.purchaseNote, { color: colors.mutedForeground }]}>
                    Use gems to send gifts to creators during live streams and unlock exclusive reactions.
                  </Text>
                  <View style={styles.paymentMethods}>
                    {["Apple Pay", "Google Pay", "Card"].map((m) => (
                      <Pressable
                        key={m}
                        style={[styles.payMethod, { backgroundColor: colors.muted, borderColor: colors.border }]}
                        onPress={() => confirmPurchase(purchaseModal.item!)}
                      >
                        <Text style={[styles.payMethodText, { color: colors.foreground }]}>
                          {m === "Apple Pay" ? "🍎" : m === "Google Pay" ? "🔵" : "💳"} {m}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Pressable
                    style={[styles.cancelBtn, { borderColor: colors.border }]}
                    onPress={() => setPurchaseModal({ visible: false, item: null })}
                  >
                    <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={dealModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.purchaseCard, { backgroundColor: colors.card }]}>
            {dealModal.deal && (
              <>
                <LinearGradient colors={dealModal.deal.color} style={styles.purchaseHeader}>
                  <Text style={styles.purchaseIcon}>{dealModal.deal.icon}</Text>
                  <Text style={styles.purchaseGems}>{dealModal.deal.title}</Text>
                  <View style={[styles.dealDiscountBadge, { marginTop: 8 }]}>
                    <Text style={styles.dealDiscount}>SAVE {dealModal.deal.discount}%</Text>
                  </View>
                </LinearGradient>
                <View style={styles.purchaseBody}>
                  <Text style={[styles.purchaseNote, { color: colors.mutedForeground, marginBottom: 12 }]}>
                    {dealModal.deal.description}
                  </Text>
                  {dealModal.deal.items.map((item) => (
                    <View key={item} style={styles.dealItemRowModal}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={[styles.dealItemTextModal, { color: colors.foreground }]}>{item}</Text>
                    </View>
                  ))}
                  <View style={[styles.dealPriceRow, { marginTop: 16 }]}>
                    <Text style={[styles.purchaseOriginal, { color: colors.mutedForeground }]}>
                      Was ${dealModal.deal.original.toFixed(2)}
                    </Text>
                    <Text style={[styles.purchasePrice, { color: colors.primary }]}>
                      ${dealModal.deal.sale.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.paymentMethods}>
                    {["Apple Pay", "Google Pay", "Card"].map((m) => (
                      <Pressable
                        key={m}
                        style={[styles.payMethod, { backgroundColor: colors.muted, borderColor: colors.border }]}
                        onPress={() => confirmDeal(dealModal.deal!)}
                      >
                        <Text style={[styles.payMethodText, { color: colors.foreground }]}>
                          {m === "Apple Pay" ? "🍎" : m === "Google Pay" ? "🔵" : "💳"} {m}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Pressable
                    style={[styles.cancelBtn, { borderColor: colors.border }]}
                    onPress={() => setDealModal({ visible: false, deal: null })}
                  >
                    <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const PACK_W = (width - 56) / 2;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 0 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  gemBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(247,147,26,0.2)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  gemIcon: { fontSize: 14 },
  gemBalance: { color: "#F7931A", fontSize: 14, fontWeight: "800" },
  tabsRow: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.15)" },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#E1306C" },
  tabText: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  content: { padding: 16 },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 20 },
  infoTitle: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  infoSub: { fontSize: 12, lineHeight: 17 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 14 },
  packsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  packWrapper: { width: PACK_W },
  packCard: { borderRadius: 20, padding: 16, alignItems: "center", gap: 4, position: "relative", minHeight: 160 },
  packBadge: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  packBadgeText: { color: "#FFD700", fontSize: 8, fontWeight: "800" },
  packIcon: { fontSize: 28, marginBottom: 4 },
  packGems: { color: "#fff", fontSize: 24, fontWeight: "900" },
  packGemsLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600" },
  packBonusRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  packBase: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
  packBonus: { color: "#FFD700", fontSize: 11, fontWeight: "700" },
  packLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600" },
  packPriceRow: { backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, marginTop: 6 },
  packPrice: { color: "#fff", fontSize: 16, fontWeight: "900" },
  giftGuide: { borderRadius: 16, padding: 16, borderWidth: 1 },
  giftGuideTitle: { fontSize: 15, fontWeight: "800", marginBottom: 12 },
  giftRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  giftName: { fontSize: 14 },
  giftCost: { fontSize: 14, fontWeight: "600" },
  creatorBundleCard: { borderRadius: 16, borderWidth: 1, marginBottom: 14, overflow: "hidden" },
  cbPreviewRow: { height: 120, position: "relative" },
  cbPreview: { width: "100%", height: "100%" },
  cbBadge: { position: "absolute", top: 10, right: 10, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  cbBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  cbInfo: { padding: 14 },
  cbCreatorRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  cbAvatar: { width: 36, height: 36, borderRadius: 18 },
  cbCreatorName: { fontSize: 14, fontWeight: "700" },
  cbHandle: { fontSize: 12 },
  cbMeta: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  cbTypeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  cbTypeText: { fontSize: 11, fontWeight: "600" },
  cbItems: { fontSize: 12 },
  cbPriceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cbPrice: { fontSize: 20, fontWeight: "900" },
  cbBuyBtn: { borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  cbBuyText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  becomeCreatorBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, borderWidth: 1.5, paddingVertical: 14, marginTop: 6 },
  becomeCreatorText: { fontSize: 14, fontWeight: "700" },
  dealCard: { borderRadius: 20, overflow: "hidden", marginBottom: 16 },
  dealGradient: { padding: 20 },
  dealHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  dealIcon: { fontSize: 36 },
  dealTitle: { color: "#fff", fontSize: 18, fontWeight: "800", marginBottom: 4 },
  dealDesc: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  dealDiscountBadge: { backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  dealDiscount: { color: "#FFD700", fontSize: 14, fontWeight: "900" },
  dealItems: { gap: 8, marginBottom: 20 },
  dealItemRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dealItemText: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  dealFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dealOriginal: { color: "rgba(255,255,255,0.5)", fontSize: 12, textDecorationLine: "line-through" },
  dealSale: { color: "#fff", fontSize: 22, fontWeight: "900" },
  dealTimerBox: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  dealTimer: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600" },
  dealBuyBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  dealBuyText: { color: "#333", fontSize: 13, fontWeight: "800" },
  safePayment: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 8 },
  safeText: { fontSize: 12, flex: 1, lineHeight: 17 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  purchaseCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
  purchaseHeader: { padding: 28, alignItems: "center", gap: 6 },
  purchaseIcon: { fontSize: 40 },
  purchaseGems: { color: "#fff", fontSize: 22, fontWeight: "900", textAlign: "center" },
  purchaseGemsLabel: { color: "rgba(255,255,255,0.7)", fontSize: 14 },
  purchaseBonus: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4 },
  purchaseBody: { padding: 24 },
  purchasePackName: { fontSize: 18, fontWeight: "800", textAlign: "center", marginBottom: 4 },
  purchasePrice: { fontSize: 26, fontWeight: "900", textAlign: "center", marginBottom: 12 },
  purchaseNote: { fontSize: 13, lineHeight: 19, textAlign: "center", marginBottom: 20 },
  paymentMethods: { gap: 10, marginBottom: 14 },
  payMethod: { borderRadius: 14, borderWidth: 1, paddingVertical: 14, alignItems: "center" },
  payMethodText: { fontSize: 15, fontWeight: "600" },
  cancelBtn: { borderRadius: 14, borderWidth: 1, paddingVertical: 14, alignItems: "center" },
  cancelText: { fontSize: 14, fontWeight: "600" },
  dealItemRowModal: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  dealItemTextModal: { fontSize: 14 },
  dealPriceRow: { flexDirection: "row", alignItems: "baseline", gap: 12, justifyContent: "center", marginBottom: 20 },
  purchaseOriginal: { fontSize: 14, textDecorationLine: "line-through" },
});
