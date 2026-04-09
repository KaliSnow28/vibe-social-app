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
  perGem?: string;
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
  rating: number;
  sold: number;
  category: string;
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

interface SubPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  color: [string, string];
  icon: string;
  features: string[];
  badge?: string;
  savings?: string;
}

const GEM_PACKS: GemPack[] = [
  { id: "g1",  gems: 70,     bonus: 0,     price: 0.99,  label: "Micro",    color: ["#607D8B","#37474F"],   icon: "💎",           perGem: "$0.014" },
  { id: "g2",  gems: 150,    bonus: 10,    price: 1.99,  label: "Starter",  color: ["#4CAF50","#2E7D32"],   icon: "💎",           perGem: "$0.013" },
  { id: "g3",  gems: 350,    bonus: 50,    price: 3.99,  label: "Basic",    color: ["#00ACC1","#00695C"],   icon: "💎💎",          perGem: "$0.010" },
  { id: "g4",  gems: 500,    bonus: 100,   price: 4.99,  label: "Popular",  color: ["#2196F3","#1565C0"],   icon: "💎💎",  badge: "BEST VALUE", perGem: "$0.008" },
  { id: "g5",  gems: 750,    bonus: 150,   price: 6.99,  label: "Value",    color: ["#5C6BC0","#283593"],   icon: "💎💎",          perGem: "$0.008" },
  { id: "g6",  gems: 1200,   bonus: 300,   price: 9.99,  label: "Premium",  color: ["#9C27B0","#6A1B9A"],   icon: "💎💎💎",         perGem: "$0.007" },
  { id: "g7",  gems: 2000,   bonus: 600,   price: 14.99, label: "Plus",     color: ["#C62828","#B71C1C"],   icon: "🌟",  badge: "+30% BONUS", perGem: "$0.006" },
  { id: "g8",  gems: 3000,   bonus: 1000,  price: 19.99, label: "Mega",     color: ["#E1306C","#880E4F"],   icon: "🌟",  badge: "+33% BONUS", perGem: "$0.005" },
  { id: "g9",  gems: 5000,   bonus: 2000,  price: 29.99, label: "Super",    color: ["#F7931A","#E65100"],   icon: "⚡",  badge: "+40% BONUS", perGem: "$0.004" },
  { id: "g10", gems: 9000,   bonus: 4000,  price: 49.99, label: "Ultra",    color: ["#D81B60","#880E4F"],   icon: "⚡",  badge: "+44% BONUS", perGem: "$0.004" },
  { id: "g11", gems: 18000,  bonus: 9000,  price: 79.99, label: "Elite",    color: ["#00BCD4","#006064"],   icon: "👑",  badge: "+50% BONUS", perGem: "$0.003" },
  { id: "g12", gems: 40000,  bonus: 25000, price: 149.99,label: "Legend",   color: ["#FFB300","#E65100"],   icon: "👑",  badge: "BEST DEAL",  perGem: "$0.002" },
];

const CREATOR_BUNDLES: CreatorBundle[] = [
  { id:"cb1",  creator:"Luna Starr",    handle:"lunastarr",    avatar:"https://i.pravatar.cc/80?img=1",  items:48,  preview:"https://picsum.photos/seed/luna1/300/200",   price:9.99,  type:"Photo Pack",     badge:"HOT",  rating:4.9, sold:1240, category:"Fashion" },
  { id:"cb2",  creator:"Alex Nova",     handle:"alexnova",     avatar:"https://i.pravatar.cc/80?img=8",  items:12,  preview:"https://picsum.photos/seed/alex1/300/200",   price:14.99, type:"Video Pack",     badge:"",     rating:4.7, sold:830,  category:"Fitness" },
  { id:"cb3",  creator:"Mia Chen",      handle:"miachen",      avatar:"https://i.pravatar.cc/80?img=5",  items:25,  preview:"https://picsum.photos/seed/mia1/300/200",    price:7.99,  type:"Art Bundle",     badge:"NEW",  rating:5.0, sold:420,  category:"Art" },
  { id:"cb4",  creator:"Kai Blaze",     handle:"kaiblaze",     avatar:"https://i.pravatar.cc/80?img=12", items:30,  preview:"https://picsum.photos/seed/kai1/300/200",    price:19.99, type:"Tutorial Pack",  badge:"",     rating:4.8, sold:680,  category:"Education" },
  { id:"cb5",  creator:"Zara Fox",      handle:"zarafox",      avatar:"https://i.pravatar.cc/80?img=20", items:60,  preview:"https://picsum.photos/seed/zara1/300/200",   price:12.99, type:"Lifestyle Pack", badge:"HOT",  rating:4.9, sold:2100, category:"Lifestyle" },
  { id:"cb6",  creator:"Rio Torres",    handle:"riotorres",    avatar:"https://i.pravatar.cc/80?img=15", items:18,  preview:"https://picsum.photos/seed/rio1/300/200",    price:24.99, type:"Music Pack",     badge:"",     rating:4.6, sold:390,  category:"Music" },
  { id:"cb7",  creator:"Naya Kim",      handle:"nayakim",      avatar:"https://i.pravatar.cc/80?img=25", items:35,  preview:"https://picsum.photos/seed/naya1/300/200",   price:8.99,  type:"Travel Pack",    badge:"NEW",  rating:4.8, sold:560,  category:"Travel" },
  { id:"cb8",  creator:"Dex Cole",      handle:"dexcole",      avatar:"https://i.pravatar.cc/80?img=33", items:20,  preview:"https://picsum.photos/seed/dex1/300/200",    price:17.99, type:"Gaming Pack",    badge:"",     rating:4.5, sold:720,  category:"Gaming" },
  { id:"cb9",  creator:"Ava Rose",      handle:"avarose",      avatar:"https://i.pravatar.cc/80?img=44", items:55,  preview:"https://picsum.photos/seed/ava1/300/200",    price:11.99, type:"Beauty Pack",    badge:"HOT",  rating:4.9, sold:3200, category:"Beauty" },
  { id:"cb10", creator:"Max Steel",     handle:"maxsteel",     avatar:"https://i.pravatar.cc/80?img=52", items:15,  preview:"https://picsum.photos/seed/max1/300/200",    price:29.99, type:"Sports Pack",    badge:"",     rating:4.7, sold:440,  category:"Sports" },
  { id:"cb11", creator:"Lia Voss",      handle:"liavoss",      avatar:"https://i.pravatar.cc/80?img=60", items:40,  preview:"https://picsum.photos/seed/lia1/300/200",    price:6.99,  type:"Aesthetic Pack", badge:"NEW",  rating:4.8, sold:890,  category:"Aesthetic" },
  { id:"cb12", creator:"Omar Jay",      handle:"omarjay",      avatar:"https://i.pravatar.cc/80?img=65", items:22,  preview:"https://picsum.photos/seed/omar1/300/200",   price:21.99, type:"Comedy Pack",    badge:"",     rating:4.6, sold:310,  category:"Comedy" },
  { id:"cb13", creator:"Sia Bloom",     handle:"siabloom",     avatar:"https://i.pravatar.cc/80?img=10", items:50,  preview:"https://picsum.photos/seed/sia1/300/200",    price:15.99, type:"Nature Pack",    badge:"HOT",  rating:5.0, sold:1800, category:"Nature" },
  { id:"cb14", creator:"Ty Fox",        handle:"tyfox",        avatar:"https://i.pravatar.cc/80?img=18", items:10,  preview:"https://picsum.photos/seed/ty1/300/200",     price:34.99, type:"Exclusive Pack", badge:"VIP",  rating:4.9, sold:250,  category:"VIP" },
  { id:"cb15", creator:"Elle Park",     handle:"ellepark",     avatar:"https://i.pravatar.cc/80?img=30", items:28,  preview:"https://picsum.photos/seed/elle1/300/200",   price:9.99,  type:"Food Pack",      badge:"",     rating:4.7, sold:670,  category:"Food" },
  { id:"cb16", creator:"Jax Winters",   handle:"jaxwinters",   avatar:"https://i.pravatar.cc/80?img=38", items:45,  preview:"https://picsum.photos/seed/jax1/300/200",   price:13.99, type:"Photography",    badge:"NEW",  rating:4.8, sold:540,  category:"Photo" },
  { id:"cb17", creator:"Coco Cruz",     handle:"cococruz",     avatar:"https://i.pravatar.cc/80?img=47", items:33,  preview:"https://picsum.photos/seed/coco1/300/200",  price:18.99, type:"Dance Pack",     badge:"HOT",  rating:4.9, sold:2400, category:"Dance" },
  { id:"cb18", creator:"Neo Walsh",     handle:"neowalsh",     avatar:"https://i.pravatar.cc/80?img=55", items:8,   preview:"https://picsum.photos/seed/neo1/300/200",   price:39.99, type:"Premium Series",  badge:"VIP",  rating:5.0, sold:180,  category:"VIP" },
  { id:"cb19", creator:"Vera Stone",    handle:"verastone",    avatar:"https://i.pravatar.cc/80?img=62", items:42,  preview:"https://picsum.photos/seed/vera1/300/200",  price:10.99, type:"Wellness Pack",  badge:"",     rating:4.6, sold:760,  category:"Wellness" },
  { id:"cb20", creator:"Finn Ray",      handle:"finnray",      avatar:"https://i.pravatar.cc/80?img=70", items:24,  preview:"https://picsum.photos/seed/finn1/300/200",  price:22.99, type:"Tech Pack",      badge:"NEW",  rating:4.7, sold:350,  category:"Tech" },
  { id:"cb21", creator:"Ivy Stone",     handle:"ivystone",     avatar:"https://i.pravatar.cc/80?img=75", items:36,  preview:"https://picsum.photos/seed/ivy1/300/200",   price:14.99, type:"Fashion Series", badge:"HOT",  rating:4.9, sold:1600, category:"Fashion" },
  { id:"cb22", creator:"Rex Maverick",  handle:"rexmaverick",  avatar:"https://i.pravatar.cc/80?img=7",  items:16,  preview:"https://picsum.photos/seed/rex1/300/200",   price:27.99, type:"Action Pack",    badge:"",     rating:4.5, sold:290,  category:"Action" },
  { id:"cb23", creator:"Stella Moon",   handle:"stellamoon",   avatar:"https://i.pravatar.cc/80?img=23", items:52,  preview:"https://picsum.photos/seed/stella1/300/200",price:8.99,  type:"Vibes Pack",     badge:"NEW",  rating:4.8, sold:910,  category:"Vibes" },
  { id:"cb24", creator:"Drake Pierce",  handle:"drakepierce",  avatar:"https://i.pravatar.cc/80?img=40", items:20,  preview:"https://picsum.photos/seed/drake1/300/200", price:44.99, type:"Legend Series",  badge:"VIP",  rating:5.0, sold:120,  category:"VIP" },
];

const SPECIAL_DEALS: SpecialDeal[] = [
  { id:"sd1", title:"Vibe Mega Bundle",        description:"Everything you need to dominate the platform",           original:49.99,  sale:19.99,  discount:60, expiresIn:"23:47:12", icon:"🔥", color:["#E1306C","#833AB4"], items:["2,500 Gems","1 Month Vibe Pro","5 Creator Bundles","Exclusive Badge"] },
  { id:"sd2", title:"Starter Creator Pack",    description:"Perfect for new creators ready to grow",                 original:24.99,  sale:9.99,   discount:60, expiresIn:"47:22:08", icon:"✨", color:["#F7931A","#E65100"], items:["500 Gems","Creator Dashboard Pro","3 Featured Spots","Analytics Boost"] },
  { id:"sd3", title:"Social Butterfly Pack",   description:"Grow your audience fast with this power bundle",         original:34.99,  sale:11.99,  discount:66, expiresIn:"12:05:44", icon:"🦋", color:["#9C27B0","#4A148C"], items:["1,000 Gems","Follower Boost x10","Verified Badge Trial","Story Highlights"] },
  { id:"sd4", title:"Streamer's Toolkit",      description:"Go live and earn like a pro right away",                 original:59.99,  sale:24.99,  discount:58, expiresIn:"08:33:20", icon:"🎥", color:["#00ACC1","#006064"], items:["3,000 Gems","Live Boost Feature","Gift Multiplier x2","Streamer Badge"] },
  { id:"sd5", title:"Artist Unleashed",        description:"For visual creators and digital artists",                original:39.99,  sale:14.99,  discount:63, expiresIn:"35:18:55", icon:"🎨", color:["#E91E63","#880E4F"], items:["1,500 Gems","AI Studio Unlimited","4 Art Creator Bundles","Exhibition Slot"] },
  { id:"sd6", title:"Weekend Warriors Deal",   description:"Limited weekend special — grab it before it's gone",     original:29.99,  sale:7.99,   discount:73, expiresIn:"02:14:30", icon:"⚡", color:["#FF6F00","#BF360C"], items:["800 Gems","2 Creator Bundles","Profile Theme Pack","Priority Support"] },
  { id:"sd7", title:"Ultimate Fan Pack",       description:"Support your favourite creators while saving big",       original:79.99,  sale:29.99,  discount:63, expiresIn:"71:00:00", icon:"🌟", color:["#283593","#1A237E"], items:["5,000 Gems","All-Access Creator Pass","Exclusive Reactions","Fan Badge"] },
];

const SUB_PLANS: SubPlan[] = [
  { id:"sp1", name:"Vibe Free",     price:0,     period:"forever", color:["#37474F","#263238"],  icon:"🌐", badge:"",          savings:"",         features:["Basic feed & reels","5 story uploads/day","Standard messages","Ads included","Basic explore"] },
  { id:"sp2", name:"Vibe+",         price:2.99,  period:"month",   color:["#1565C0","#0D47A1"],  icon:"⭐", badge:"POPULAR",   savings:"",         features:["Ad-free experience","25 story uploads/day","HD video uploads","Priority support","Custom profile badge"] },
  { id:"sp3", name:"Vibe Pro",      price:7.99,  period:"month",   color:["#6A1B9A","#4A148C"],  icon:"💜", badge:"",          savings:"",         features:["Everything in Vibe+","Unlimited story uploads","4K video","AI Studio access","Monthly 200 gems"] },
  { id:"sp4", name:"Creator Elite", price:14.99, period:"month",   color:["#E1306C","#B71C1C"],  icon:"🚀", badge:"BEST VALUE",savings:"Save 25%", features:["Everything in Pro","Creator analytics","Monetization tools","Monthly 500 gems","Featured placement"] },
  { id:"sp5", name:"Vibe Annual+",  price:1.99,  period:"month",   color:["#00695C","#004D40"],  icon:"🌿", badge:"CHEAPEST",  savings:"Billed $23.88/yr", features:["Same as Vibe+","Billed annually","Save vs. monthly","Early feature access"] },
  { id:"sp6", name:"Pro Annual",    price:5.99,  period:"month",   color:["#4527A0","#311B92"],  icon:"💎", badge:"",          savings:"Billed $71.88/yr", features:["Same as Vibe Pro","Billed annually","Save $24/year","Priority creator support"] },
  { id:"sp7", name:"Diamond",       price:29.99, period:"month",   color:["#F57F17","#E65100"],  icon:"👑", badge:"VIP",       savings:"",         features:["Everything in Creator Elite","1:1 creator coaching","Personal account manager","1000 gems/month","Diamond badge + border"] },
];

const BUNDLE_CATEGORIES = ["All", "Fashion", "Fitness", "Art", "Education", "Music", "Travel", "Gaming", "Beauty", "VIP", "Dance", "Wellness", "Food"];

export default function BundlesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;

  const [gemBalance, setGemBalance] = useState(340);
  const [selectedTab, setSelectedTab] = useState<"gems" | "creators" | "deals" | "subs">("gems");
  const [purchaseModal, setPurchaseModal] = useState<{ visible: boolean; item: GemPack | null }>({ visible: false, item: null });
  const [dealModal, setDealModal] = useState<{ visible: boolean; deal: SpecialDeal | null }>({ visible: false, deal: null });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [subscribedPlan, setSubscribedPlan] = useState("sp3");

  const filteredBundles = selectedCategory === "All"
    ? CREATOR_BUNDLES
    : CREATOR_BUNDLES.filter((b) => b.category === selectedCategory);

  const handleBuyGems = (pack: GemPack) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPurchaseModal({ visible: true, item: pack });
  };

  const confirmPurchase = (pack: GemPack) => {
    const total = pack.gems + pack.bonus;
    setGemBalance((prev) => prev + total);
    setPurchaseModal({ visible: false, item: null });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Purchase Successful! 💎", `You received ${total.toLocaleString()} gems${pack.bonus > 0 ? ` (includes ${pack.bonus} bonus!)` : ""}!`);
  };

  const handleBuyDeal = (deal: SpecialDeal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setDealModal({ visible: true, deal });
  };

  const confirmDeal = (deal: SpecialDeal) => {
    setDealModal({ visible: false, deal: null });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Bundle Purchased! 🎉", `You unlocked the ${deal.title}!`);
  };

  const BADGE_COLORS: Record<string, string> = { HOT: "#E1306C", NEW: "#4CAF50", VIP: "#F7931A" };

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {(["gems", "creators", "deals", "subs"] as const).map((t) => (
            <Pressable key={t} onPress={() => setSelectedTab(t)} style={[styles.tab, selectedTab === t && styles.tabActive]}>
              <Text style={[styles.tabText, selectedTab === t && styles.tabTextActive]}>
                {t === "gems" ? "💎 Gems" : t === "creators" ? "🎨 Creators" : t === "deals" ? "🔥 Deals" : "⭐ Subscriptions"}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── GEMS TAB ── */}
        {selectedTab === "gems" && (
          <View style={styles.content}>
            <View style={[styles.infoBox, { backgroundColor: "#F7931A15", borderColor: "#F7931A30" }]}>
              <FontAwesome5 name="fire" size={16} color="#F7931A" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoTitle, { color: colors.foreground }]}>Use Gems to Send Gifts</Text>
                <Text style={[styles.infoSub, { color: colors.mutedForeground }]}>70% of every gem spent goes directly to creators during live streams.</Text>
              </View>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Choose Your Pack</Text>
            <View style={styles.packsGrid}>
              {GEM_PACKS.map((pack) => (
                <Pressable key={pack.id} onPress={() => handleBuyGems(pack)} style={styles.packWrapper}>
                  <LinearGradient colors={pack.color} style={styles.packCard}>
                    {pack.badge && (
                      <View style={styles.packBadge}><Text style={styles.packBadgeText}>{pack.badge}</Text></View>
                    )}
                    <Text style={styles.packIcon}>{pack.icon}</Text>
                    <Text style={styles.packGems}>{(pack.gems + pack.bonus).toLocaleString()}</Text>
                    <Text style={styles.packGemsLabel}>gems</Text>
                    {pack.bonus > 0 && (
                      <View style={styles.packBonusRow}>
                        <Text style={styles.packBase}>{pack.gems.toLocaleString()}</Text>
                        <Text style={styles.packBonus}>+{pack.bonus.toLocaleString()}</Text>
                      </View>
                    )}
                    <Text style={styles.packLabel}>{pack.label}</Text>
                    <View style={styles.packPriceRow}><Text style={styles.packPrice}>${pack.price.toFixed(2)}</Text></View>
                    {pack.perGem && <Text style={styles.perGem}>{pack.perGem}/gem</Text>}
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
            <View style={[styles.giftGuide, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.giftGuideTitle, { color: colors.foreground }]}>🎁 Gift Guide</Text>
              {[
                { gift:"Rose 🌹",      cost:"10 gems" },
                { gift:"Fireworks 🎆", cost:"50 gems" },
                { gift:"Crown 👑",     cost:"200 gems" },
                { gift:"Rocket 🚀",    cost:"500 gems" },
                { gift:"Diamond 💎",   cost:"1,000 gems" },
                { gift:"Unicorn 🦄",   cost:"2,500 gems" },
                { gift:"Galaxy 🌌",    cost:"5,000 gems" },
                { gift:"Legend ⚡",    cost:"10,000 gems" },
              ].map((g) => (
                <View key={g.gift} style={[styles.giftRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.giftName, { color: colors.foreground }]}>{g.gift}</Text>
                  <Text style={[styles.giftCost, { color: colors.mutedForeground }]}>{g.cost}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── CREATORS TAB ── */}
        {selectedTab === "creators" && (
          <View style={styles.content}>
            <View style={[styles.infoBox, { backgroundColor: "#E1306C15", borderColor: "#E1306C30" }]}>
              <Ionicons name="images" size={16} color="#E1306C" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoTitle, { color: colors.foreground }]}>Exclusive Creator Content</Text>
                <Text style={[styles.infoSub, { color: colors.mutedForeground }]}>Buy exclusive photo packs, video collections, and tutorials directly from creators.</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
              {BUNDLE_CATEGORIES.map((cat) => (
                <Pressable key={cat} onPress={() => setSelectedCategory(cat)}
                  style={[styles.catChip, { backgroundColor: selectedCategory === cat ? colors.primary : colors.muted, borderColor: selectedCategory === cat ? colors.primary : colors.border }]}>
                  <Text style={[styles.catText, { color: selectedCategory === cat ? "#fff" : colors.foreground }]}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{filteredBundles.length} Bundles Available</Text>
            {filteredBundles.map((bundle) => (
              <Pressable key={bundle.id}
                onPress={() => Alert.alert(`${bundle.creator}'s ${bundle.type}`, `${bundle.items} exclusive pieces for $${bundle.price.toFixed(2)}\n⭐ ${bundle.rating} · ${bundle.sold.toLocaleString()} sold`,
                  [{ text:"Cancel", style:"cancel" }, { text:`Buy $${bundle.price.toFixed(2)}`, onPress:() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert("Purchased! 🎉", `Unlocked ${bundle.creator}'s exclusive ${bundle.type}.`); } }])}
                style={[styles.creatorBundleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cbPreviewRow}>
                  <Image source={{ uri: bundle.preview }} style={styles.cbPreview} resizeMode="cover" />
                  <LinearGradient colors={["transparent","rgba(0,0,0,0.6)"]} style={StyleSheet.absoluteFill} />
                  {bundle.badge ? (
                    <View style={[styles.cbBadge, { backgroundColor: BADGE_COLORS[bundle.badge] ?? "#888" }]}>
                      <Text style={styles.cbBadgeText}>{bundle.badge}</Text>
                    </View>
                  ) : null}
                  <View style={styles.cbCatBadge}>
                    <Text style={styles.cbCatText}>{bundle.category}</Text>
                  </View>
                </View>
                <View style={styles.cbInfo}>
                  <View style={styles.cbCreatorRow}>
                    <Image source={{ uri: bundle.avatar }} style={styles.cbAvatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cbCreatorName, { color: colors.foreground }]}>{bundle.creator}</Text>
                      <Text style={[styles.cbHandle, { color: colors.mutedForeground }]}>@{bundle.handle}</Text>
                    </View>
                    <View style={styles.cbRating}>
                      <Ionicons name="star" size={12} color="#F7931A" />
                      <Text style={[styles.cbRatingText, { color: colors.foreground }]}>{bundle.rating}</Text>
                    </View>
                  </View>
                  <View style={styles.cbMeta}>
                    <View style={[styles.cbTypeBadge, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.cbTypeText, { color: colors.foreground }]}>{bundle.type}</Text>
                    </View>
                    <Text style={[styles.cbItems, { color: colors.mutedForeground }]}>{bundle.items} items</Text>
                    <Text style={[styles.cbSold, { color: colors.mutedForeground }]}>· {bundle.sold.toLocaleString()} sold</Text>
                  </View>
                  <View style={styles.cbPriceRow}>
                    <Text style={[styles.cbPrice, { color: colors.primary }]}>${bundle.price.toFixed(2)}</Text>
                    <Pressable style={[styles.cbBuyBtn, { backgroundColor: colors.primary }]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert("Purchase Bundle", `Get ${bundle.creator}'s ${bundle.type} for $${bundle.price.toFixed(2)}?`, [{ text:"Cancel", style:"cancel" }, { text:"Buy Now", onPress:() => Alert.alert("Purchased! 🎉", `Unlocked ${bundle.creator}'s exclusive content.`) }]); }}>
                      <Text style={styles.cbBuyText}>Buy Bundle</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
            <Pressable style={[styles.becomeCreatorBtn, { borderColor: colors.primary }]} onPress={() => router.push("/creator-dashboard")}>
              <MaterialCommunityIcons name="account-star" size={18} color={colors.primary} />
              <Text style={[styles.becomeCreatorText, { color: colors.primary }]}>Sell Your Own Bundles →</Text>
            </Pressable>
          </View>
        )}

        {/* ── DEALS TAB ── */}
        {selectedTab === "deals" && (
          <View style={styles.content}>
            <View style={[styles.infoBox, { backgroundColor: "#F7931A15", borderColor: "#F7931A30" }]}>
              <FontAwesome5 name="bolt" size={14} color="#F7931A" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoTitle, { color: colors.foreground }]}>⚡ Limited Time Offers</Text>
                <Text style={[styles.infoSub, { color: colors.mutedForeground }]}>Massive savings bundling gems, subscriptions, and creator content. Act fast!</Text>
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
              <Text style={[styles.safeText, { color: colors.mutedForeground }]}>Secure payments via Apple Pay, Google Pay, or credit card. All purchases are final.</Text>
            </View>
          </View>
        )}

        {/* ── SUBSCRIPTIONS TAB ── */}
        {selectedTab === "subs" && (
          <View style={styles.content}>
            <View style={[styles.infoBox, { backgroundColor: "#833AB415", borderColor: "#833AB430" }]}>
              <Ionicons name="star" size={16} color="#833AB4" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoTitle, { color: colors.foreground }]}>Vibe Subscription Plans</Text>
                <Text style={[styles.infoSub, { color: colors.mutedForeground }]}>Unlock premium features, ad-free experience, and monthly gem bonuses.</Text>
              </View>
            </View>
            {SUB_PLANS.map((plan) => {
              const isActive = subscribedPlan === plan.id;
              return (
                <Pressable key={plan.id} style={[styles.subCard, { borderColor: isActive ? colors.primary : colors.border }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    if (plan.price === 0) { setSubscribedPlan(plan.id); return; }
                    Alert.alert(`Subscribe to ${plan.name}`, `$${plan.price.toFixed(2)}/${plan.period}${plan.savings ? `\n${plan.savings}` : ""}`,
                      [{ text:"Cancel", style:"cancel" }, { text:"Subscribe", onPress:() => { setSubscribedPlan(plan.id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert("Subscribed! 🎉", `Welcome to ${plan.name}!`); } }]);
                  }}>
                  <LinearGradient colors={plan.color} style={styles.subCardHeader}>
                    <Text style={styles.subIcon}>{plan.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subName}>{plan.name}</Text>
                      {plan.savings ? <Text style={styles.subSavings}>{plan.savings}</Text> : null}
                    </View>
                    {plan.badge ? (
                      <View style={styles.subBadge}><Text style={styles.subBadgeText}>{plan.badge}</Text></View>
                    ) : null}
                    {isActive && (
                      <View style={[styles.subActiveBadge, { backgroundColor: "#4CAF50" }]}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                        <Text style={styles.subActiveText}>ACTIVE</Text>
                      </View>
                    )}
                  </LinearGradient>
                  <View style={[styles.subCardBody, { backgroundColor: colors.card }]}>
                    <View style={styles.subPriceRow}>
                      <Text style={[styles.subPrice, { color: colors.foreground }]}>
                        {plan.price === 0 ? "Free" : `$${plan.price.toFixed(2)}`}
                      </Text>
                      {plan.price > 0 && <Text style={[styles.subPeriod, { color: colors.mutedForeground }]}>/{plan.period}</Text>}
                    </View>
                    {plan.features.map((f) => (
                      <View key={f} style={styles.subFeatureRow}>
                        <Ionicons name="checkmark-circle" size={15} color={isActive ? colors.primary : "#4CAF50"} />
                        <Text style={[styles.subFeatureText, { color: colors.foreground }]}>{f}</Text>
                      </View>
                    ))}
                    <Pressable
                      style={[styles.subBtn, { backgroundColor: isActive ? colors.muted : colors.primary }]}
                      onPress={() => {
                        if (isActive) return;
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        if (plan.price === 0) { setSubscribedPlan(plan.id); return; }
                        Alert.alert(`Subscribe to ${plan.name}`, `$${plan.price.toFixed(2)}/${plan.period}`,
                          [{ text:"Cancel", style:"cancel" }, { text:"Subscribe", onPress:() => { setSubscribedPlan(plan.id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert("Subscribed! 🎉", `Welcome to ${plan.name}!`); } }]);
                      }}>
                      <Text style={[styles.subBtnText, { color: isActive ? colors.mutedForeground : "#fff" }]}>
                        {isActive ? "Current Plan" : plan.price === 0 ? "Use Free Plan" : `Subscribe · $${plan.price.toFixed(2)}/${plan.period}`}
                      </Text>
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

      </ScrollView>

      {/* ── PURCHASE MODAL ── */}
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
                    <Text style={styles.purchaseBonus}>{purchaseModal.item.gems.toLocaleString()} base + {purchaseModal.item.bonus.toLocaleString()} bonus</Text>
                  )}
                </LinearGradient>
                <View style={styles.purchaseBody}>
                  <Text style={[styles.purchasePackName, { color: colors.foreground }]}>{purchaseModal.item.label} Pack</Text>
                  <Text style={[styles.purchasePrice, { color: colors.primary }]}>${purchaseModal.item.price.toFixed(2)}</Text>
                  <Text style={[styles.purchaseNote, { color: colors.mutedForeground }]}>Use gems to send gifts to creators during live streams and unlock exclusive reactions.</Text>
                  <View style={styles.paymentMethods}>
                    {["🍎  Apple Pay","🔵  Google Pay","💳  Card"].map((m) => (
                      <Pressable key={m} style={[styles.payMethod, { backgroundColor: colors.muted, borderColor: colors.border }]}
                        onPress={() => confirmPurchase(purchaseModal.item!)}>
                        <Text style={[styles.payMethodText, { color: colors.foreground }]}>{m}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Pressable style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setPurchaseModal({ visible: false, item: null })}>
                    <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── DEAL MODAL ── */}
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
                  <Text style={[styles.purchaseNote, { color: colors.mutedForeground, marginBottom: 12 }]}>{dealModal.deal.description}</Text>
                  {dealModal.deal.items.map((item) => (
                    <View key={item} style={styles.dealItemRowModal}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={[styles.dealItemTextModal, { color: colors.foreground }]}>{item}</Text>
                    </View>
                  ))}
                  <View style={[styles.dealPriceRow, { marginTop: 16 }]}>
                    <Text style={[styles.purchaseOriginal, { color: colors.mutedForeground }]}>Was ${dealModal.deal.original.toFixed(2)}</Text>
                    <Text style={[styles.purchasePrice, { color: colors.primary }]}>${dealModal.deal.sale.toFixed(2)}</Text>
                  </View>
                  <View style={styles.paymentMethods}>
                    {["🍎  Apple Pay","🔵  Google Pay","💳  Card"].map((m) => (
                      <Pressable key={m} style={[styles.payMethod, { backgroundColor: colors.muted, borderColor: colors.border }]}
                        onPress={() => confirmDeal(dealModal.deal!)}>
                        <Text style={[styles.payMethodText, { color: colors.foreground }]}>{m}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Pressable style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setDealModal({ visible: false, deal: null })}>
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
  tabsRow: { gap: 4, paddingBottom: 0 },
  tab: { paddingHorizontal: 14, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#E1306C" },
  tabText: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600", whiteSpace: "nowrap" } as never,
  tabTextActive: { color: "#fff" },
  content: { padding: 16 },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 20 },
  infoTitle: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  infoSub: { fontSize: 12, lineHeight: 17 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 14 },
  packsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  packWrapper: { width: PACK_W },
  packCard: { borderRadius: 20, padding: 16, alignItems: "center", gap: 3, position: "relative", minHeight: 170 },
  packBadge: { position: "absolute", top: 10, right: 8, backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  packBadgeText: { color: "#FFD700", fontSize: 8, fontWeight: "800" },
  packIcon: { fontSize: 26, marginBottom: 4 },
  packGems: { color: "#fff", fontSize: 22, fontWeight: "900" },
  packGemsLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
  packBonusRow: { flexDirection: "row", gap: 5, alignItems: "center" },
  packBase: { color: "rgba(255,255,255,0.55)", fontSize: 10 },
  packBonus: { color: "#FFD700", fontSize: 10, fontWeight: "700" },
  packLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600" },
  packPriceRow: { backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, marginTop: 4 },
  packPrice: { color: "#fff", fontSize: 15, fontWeight: "900" },
  perGem: { color: "rgba(255,255,255,0.45)", fontSize: 9, marginTop: 2 },
  giftGuide: { borderRadius: 16, padding: 16, borderWidth: 1 },
  giftGuideTitle: { fontSize: 15, fontWeight: "800", marginBottom: 12 },
  giftRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth },
  giftName: { fontSize: 14 },
  giftCost: { fontSize: 14, fontWeight: "600" },
  catScroll: { gap: 8, paddingBottom: 14 },
  catChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1 },
  catText: { fontSize: 12, fontWeight: "600" },
  creatorBundleCard: { borderRadius: 16, borderWidth: 1, marginBottom: 14, overflow: "hidden" },
  cbPreviewRow: { height: 110, position: "relative" },
  cbPreview: { width: "100%", height: "100%" },
  cbBadge: { position: "absolute", top: 10, right: 10, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  cbBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  cbCatBadge: { position: "absolute", bottom: 8, left: 10, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  cbCatText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  cbInfo: { padding: 12 },
  cbCreatorRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  cbAvatar: { width: 34, height: 34, borderRadius: 17 },
  cbCreatorName: { fontSize: 13, fontWeight: "700" },
  cbHandle: { fontSize: 11 },
  cbRating: { flexDirection: "row", alignItems: "center", gap: 3 },
  cbRatingText: { fontSize: 12, fontWeight: "700" },
  cbMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  cbTypeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  cbTypeText: { fontSize: 11, fontWeight: "600" },
  cbItems: { fontSize: 11 },
  cbSold: { fontSize: 11 },
  cbPriceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cbPrice: { fontSize: 18, fontWeight: "900" },
  cbBuyBtn: { borderRadius: 12, paddingHorizontal: 18, paddingVertical: 9 },
  cbBuyText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  becomeCreatorBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, borderWidth: 1.5, paddingVertical: 14, marginTop: 6 },
  becomeCreatorText: { fontSize: 14, fontWeight: "700" },
  dealCard: { borderRadius: 20, overflow: "hidden", marginBottom: 16 },
  dealGradient: { padding: 20 },
  dealHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  dealIcon: { fontSize: 34 },
  dealTitle: { color: "#fff", fontSize: 17, fontWeight: "800", marginBottom: 3 },
  dealDesc: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  dealDiscountBadge: { backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  dealDiscount: { color: "#FFD700", fontSize: 13, fontWeight: "900" },
  dealItems: { gap: 7, marginBottom: 18 },
  dealItemRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dealItemText: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  dealFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dealOriginal: { color: "rgba(255,255,255,0.5)", fontSize: 12, textDecorationLine: "line-through" },
  dealSale: { color: "#fff", fontSize: 22, fontWeight: "900" },
  dealTimerBox: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  dealTimer: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600" },
  dealBuyBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  dealBuyText: { color: "#333", fontSize: 12, fontWeight: "800" },
  safePayment: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 8 },
  safeText: { fontSize: 12, flex: 1, lineHeight: 17 },
  subCard: { borderRadius: 20, borderWidth: 1.5, overflow: "hidden", marginBottom: 16 },
  subCardHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16 },
  subIcon: { fontSize: 28 },
  subName: { color: "#fff", fontSize: 16, fontWeight: "800" },
  subSavings: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 2 },
  subBadge: { backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  subBadgeText: { color: "#FFD700", fontSize: 10, fontWeight: "800" },
  subActiveBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  subActiveText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  subCardBody: { padding: 16 },
  subPriceRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 12 },
  subPrice: { fontSize: 26, fontWeight: "900" },
  subPeriod: { fontSize: 14 },
  subFeatureRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  subFeatureText: { fontSize: 13 },
  subBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 12 },
  subBtnText: { fontSize: 14, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  purchaseCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
  purchaseHeader: { padding: 28, alignItems: "center", gap: 6 },
  purchaseIcon: { fontSize: 40 },
  purchaseGems: { color: "#fff", fontSize: 20, fontWeight: "900", textAlign: "center" },
  purchaseGemsLabel: { color: "rgba(255,255,255,0.7)", fontSize: 14 },
  purchaseBonus: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4 },
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
