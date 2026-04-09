import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
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
const CARD_W = (width - 48) / 2;

interface NFT {
  id: string;
  title: string;
  creator: string;
  avatar: string;
  image: string;
  price: number;
  currency: string;
  likes: number;
  verified: boolean;
  owned: boolean;
  listed: boolean;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  category: string;
}

const RARITY_COLORS = { Common:"#888", Rare:"#2196F3", Epic:"#9C27B0", Legendary:"#F7931A" };

const NFTs: NFT[] = [
  { id:"n1",  title:"Cosmic Dream #1",      creator:"Luna Starr",   avatar:"https://i.pravatar.cc/60?img=1",  image:"https://picsum.photos/seed/nft1/300/300",  price:0.45,  currency:"ETH", likes:234, verified:true,  owned:false, listed:true,  rarity:"Legendary", category:"Art"       },
  { id:"n2",  title:"Neon City #7",          creator:"Alex Nova",    avatar:"https://i.pravatar.cc/60?img=8",  image:"https://picsum.photos/seed/nft2/300/300",  price:0.12,  currency:"ETH", likes:89,  verified:true,  owned:false, listed:true,  rarity:"Epic",      category:"Digital"   },
  { id:"n3",  title:"Vibe Genesis",          creator:"Mia Chen",     avatar:"https://i.pravatar.cc/60?img=5",  image:"https://picsum.photos/seed/nft3/300/300",  price:0.08,  currency:"ETH", likes:412, verified:false, owned:true,  listed:false, rarity:"Rare",      category:"Art"       },
  { id:"n4",  title:"Golden Hour",           creator:"Kai Blaze",    avatar:"https://i.pravatar.cc/60?img=12", image:"https://picsum.photos/seed/nft4/300/300",  price:1.20,  currency:"ETH", likes:678, verified:true,  owned:false, listed:true,  rarity:"Legendary", category:"Photo"     },
  { id:"n5",  title:"Abstract Soul #3",      creator:"Zara Fox",     avatar:"https://i.pravatar.cc/60?img=20", image:"https://picsum.photos/seed/nft5/300/300",  price:0.03,  currency:"ETH", likes:55,  verified:false, owned:false, listed:true,  rarity:"Common",    category:"Art"       },
  { id:"n6",  title:"Pixel Paradise",        creator:"Rio Torres",   avatar:"https://i.pravatar.cc/60?img=15", image:"https://picsum.photos/seed/nft6/300/300",  price:0.22,  currency:"ETH", likes:301, verified:true,  owned:false, listed:true,  rarity:"Rare",      category:"Pixel"     },
  { id:"n7",  title:"Dark Matter #9",        creator:"Ava Rose",     avatar:"https://i.pravatar.cc/60?img=44", image:"https://picsum.photos/seed/nft7/300/300",  price:0.55,  currency:"ETH", likes:188, verified:true,  owned:false, listed:true,  rarity:"Epic",      category:"Digital"   },
  { id:"n8",  title:"Vibe OG Card",          creator:"Drake Pierce", avatar:"https://i.pravatar.cc/60?img=40", image:"https://picsum.photos/seed/nft8/300/300",  price:2.50,  currency:"ETH", likes:1240,verified:true,  owned:false, listed:true,  rarity:"Legendary", category:"Exclusive" },
  { id:"n9",  title:"Sunrise Bloom",         creator:"Sia Bloom",    avatar:"https://i.pravatar.cc/60?img=10", image:"https://picsum.photos/seed/nft9/300/300",  price:0.06,  currency:"ETH", likes:77,  verified:false, owned:true,  listed:true,  rarity:"Common",    category:"Nature"    },
  { id:"n10", title:"Cyber Blossom",         creator:"Ivy Stone",    avatar:"https://i.pravatar.cc/60?img=75", image:"https://picsum.photos/seed/nft10/300/300", price:0.18,  currency:"ETH", likes:203, verified:true,  owned:false, listed:true,  rarity:"Rare",      category:"Art"       },
];

const CATEGORIES = ["All","Art","Digital","Photo","Pixel","Nature","Exclusive"];

export default function NFTMarketplaceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;
  const [activeTab, setActiveTab] = useState<"explore"|"mine"|"listed">("explore");
  const [selectedCat, setSelectedCat] = useState("All");
  const [nfts, setNfts] = useState(NFTs);
  const [liked, setLiked] = useState<string[]>([]);

  const filtered = nfts.filter(n => {
    if (activeTab === "mine") return n.owned;
    if (activeTab === "listed") return n.listed && n.owned;
    return selectedCat === "All" ? true : n.category === selectedCat;
  });

  const handleBuy = (nft: NFT) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(`Buy "${nft.title}"`, `Purchase for ${nft.price} ETH (~$${(nft.price * 3200).toFixed(0)})?`,
      [{ text:"Cancel", style:"cancel" },
       { text:"Buy Now", onPress:() => { setNfts(prev => prev.map(n => n.id === nft.id ? { ...n, owned:true } : n)); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert("Purchased! 🎉", `"${nft.title}" is now in your collection.`); } }]);
  };

  const handleMint = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert("Mint an NFT", "Choose a photo or AI-generated image from your gallery to mint as an NFT on the blockchain.",
      [{ text:"Cancel", style:"cancel" }, { text:"Open Gallery", onPress:() => Alert.alert("Coming Soon", "Connect your wallet to start minting.") }]);
  };

  const toggleLike = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={["#0d0d1a","#1a0533"]} style={[styles.header, { paddingTop: headerTop + 8, paddingBottom: 0 }]}>
        <View style={[styles.headerRow, { marginBottom: 14 }]}>
          <Pressable onPress={() => router.back()}><Feather name="arrow-left" size={22} color="#fff" /></Pressable>
          <Text style={styles.headerTitle}>NFT Marketplace</Text>
          <Pressable onPress={handleMint} style={styles.mintBtn}>
            <MaterialCommunityIcons name="cube-outline" size={15} color="#fff" />
            <Text style={styles.mintBtnText}>Mint</Text>
          </Pressable>
        </View>
        <View style={styles.tabsRow}>
          {(["explore","mine","listed"] as const).map(t => (
            <Pressable key={t} onPress={() => setActiveTab(t)} style={[styles.tab, { borderBottomColor: activeTab === t ? "#E1306C" : "transparent" }]}>
              <Text style={[styles.tabText, { color: activeTab === t ? "#fff" : "rgba(255,255,255,0.5)" }]}>
                {t === "explore" ? "Explore" : t === "mine" ? "My NFTs" : "Listed"}
              </Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        {activeTab === "explore" && (
          <>
            {/* Featured */}
            <LinearGradient colors={["#F7931A","#E1306C"]} style={styles.featuredBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.featuredLabel}>⚡ TOP SALE TODAY</Text>
                <Text style={styles.featuredTitle}>Vibe OG Card</Text>
                <Text style={styles.featuredPrice}>2.50 ETH · ~$8,000</Text>
                <Pressable onPress={() => handleBuy(nfts.find(n=>n.id==="n8")!)} style={styles.featuredBtn}>
                  <Text style={styles.featuredBtnText}>Buy Now</Text>
                </Pressable>
              </View>
              <Image source={{ uri:"https://picsum.photos/seed/nft8/200/200" }} style={styles.featuredImg} />
            </LinearGradient>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
              {CATEGORIES.map(c => (
                <Pressable key={c} onPress={() => setSelectedCat(c)}
                  style={[styles.catChip, { backgroundColor: selectedCat === c ? colors.primary : colors.muted, borderColor: selectedCat === c ? colors.primary : colors.border }]}>
                  <Text style={[styles.catText, { color: selectedCat === c ? "#fff" : colors.foreground }]}>{c}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {activeTab === "mine" && filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🖼️</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No NFTs yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Buy or mint your first NFT</Text>
            <Pressable onPress={() => setActiveTab("explore")} style={[styles.emptyBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.emptyBtnText}>Explore Marketplace</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.grid}>
          {filtered.map(nft => (
            <Pressable key={nft.id} onPress={() => Alert.alert(nft.title, `By ${nft.creator}\nRarity: ${nft.rarity}\nPrice: ${nft.price} ETH\nLikes: ${nft.likes}`,
              [{ text:"Close", style:"cancel" }, ...(nft.owned ? [] : [{ text:`Buy ${nft.price} ETH`, onPress:() => handleBuy(nft) }])])}
              style={[styles.nftCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.nftImageWrap}>
                <Image source={{ uri: nft.image }} style={styles.nftImage} />
                <LinearGradient colors={["transparent","rgba(0,0,0,0.5)"]} style={StyleSheet.absoluteFill} />
                <View style={[styles.rarityBadge, { backgroundColor: RARITY_COLORS[nft.rarity] }]}>
                  <Text style={styles.rarityText}>{nft.rarity}</Text>
                </View>
                {nft.owned && (
                  <View style={styles.ownedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  </View>
                )}
                <Pressable onPress={() => toggleLike(nft.id)} style={styles.likeBtn}>
                  <Ionicons name={liked.includes(nft.id) ? "heart" : "heart-outline"} size={16} color={liked.includes(nft.id) ? "#E1306C" : "#fff"} />
                </Pressable>
              </View>
              <View style={styles.nftInfo}>
                <Text style={[styles.nftTitle, { color: colors.foreground }]} numberOfLines={1}>{nft.title}</Text>
                <View style={styles.nftCreatorRow}>
                  <Image source={{ uri: nft.avatar }} style={styles.nftAvatar} />
                  <Text style={[styles.nftCreator, { color: colors.mutedForeground }]} numberOfLines={1}>{nft.creator}</Text>
                  {nft.verified && <Ionicons name="checkmark-circle" size={11} color="#2196F3" />}
                </View>
                <View style={styles.nftPriceRow}>
                  <View>
                    <Text style={[styles.nftPriceLabel, { color: colors.mutedForeground }]}>Price</Text>
                    <Text style={[styles.nftPrice, { color: colors.primary }]}>{nft.price} ETH</Text>
                  </View>
                  {!nft.owned && (
                    <Pressable onPress={() => handleBuy(nft)} style={[styles.buyBtn, { backgroundColor: colors.primary }]}>
                      <Text style={styles.buyBtnText}>Buy</Text>
                    </Pressable>
                  )}
                  {nft.owned && (
                    <View style={[styles.ownedTag, { backgroundColor: "#4CAF5020" }]}>
                      <Text style={{ color:"#4CAF50", fontSize:10, fontWeight:"700" }}>Owned</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  mintBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#833AB4", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7 },
  mintBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  tabsRow: { flexDirection: "row" },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 2 },
  tabText: { fontSize: 13, fontWeight: "600" },
  featuredBanner: { flexDirection: "row", alignItems: "center", margin: 16, borderRadius: 20, padding: 20, overflow: "hidden" },
  featuredLabel: { color: "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: 6 },
  featuredTitle: { color: "#fff", fontSize: 20, fontWeight: "900", marginBottom: 4 },
  featuredPrice: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginBottom: 14 },
  featuredBtn: { backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, alignSelf: "flex-start" },
  featuredBtnText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  featuredImg: { width: 100, height: 100, borderRadius: 14 },
  catScroll: { paddingHorizontal: 16, gap: 8, paddingBottom: 14 },
  catChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1 },
  catText: { fontSize: 12, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, padding: 16 },
  nftCard: { width: CARD_W, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  nftImageWrap: { height: CARD_W, position: "relative" },
  nftImage: { width: "100%", height: "100%" },
  rarityBadge: { position: "absolute", top: 8, left: 8, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  rarityText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  ownedBadge: { position: "absolute", top: 8, right: 34 },
  likeBtn: { position: "absolute", top: 8, right: 8 },
  nftInfo: { padding: 10 },
  nftTitle: { fontSize: 13, fontWeight: "700", marginBottom: 5 },
  nftCreatorRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 8 },
  nftAvatar: { width: 18, height: 18, borderRadius: 9 },
  nftCreator: { fontSize: 10, flex: 1 },
  nftPriceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  nftPriceLabel: { fontSize: 9 },
  nftPrice: { fontSize: 13, fontWeight: "800" },
  buyBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  buyBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  ownedTag: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  emptyState: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  emptySub: { fontSize: 13, textAlign: "center", marginBottom: 20 },
  emptyBtn: { borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
