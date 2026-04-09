import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReelCard } from "@/components/ReelCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const { height } = Dimensions.get("window");

export default function ReelsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reels, likePost } = useApp();
  const isWeb = Platform.OS === "web";

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <View style={[styles.header, { top: isWeb ? 67 : insets.top }]}>
        <Text style={styles.title}>Reels</Text>
        <Ionicons name="camera-outline" size={24} color="#fff" />
      </View>
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReelCard
            post={item}
            onLike={() => likePost(item.id)}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        scrollEnabled={reels.length > 0}
        contentContainerStyle={{ paddingBottom: isWeb ? 84 + 34 : 0 }}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 50,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
});
