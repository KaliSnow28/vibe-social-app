import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore" role="search">
        <Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass" }} />
        <Label>Search</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="camera">
        <Icon sf={{ default: "plus.app", selected: "plus.app.fill" }} />
        <Label>Create</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reels">
        <Icon sf={{ default: "play.rectangle", selected: "play.rectangle.fill" }} />
        <Label>Reels</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="messages">
        <Icon sf={{ default: "paperplane", selected: "paperplane.fill" }} />
        <Label>DMs</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const { unreadMessages } = useApp();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.tabBar,
          borderTopWidth: 0.5,
          borderTopColor: colors.tabBarBorder,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.tabBar },
              ]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "house.fill" : "house"}
                tintColor={color}
                size={26}
              />
            ) : (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={26}
                color={color}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name="magnifyingglass"
                tintColor={color}
                size={24}
              />
            ) : (
              <Feather name="search" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "plus.app.fill" : "plus.app"}
                tintColor={color}
                size={26}
              />
            ) : (
              <Ionicons
                name={focused ? "add-circle" : "add-circle-outline"}
                size={28}
                color={color}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "play.rectangle.fill" : "play.rectangle"}
                tintColor={color}
                size={26}
              />
            ) : (
              <MaterialCommunityIcons
                name={focused ? "play-box" : "play-box-outline"}
                size={26}
                color={color}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="characters"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarBadge: unreadMessages > 0 ? unreadMessages : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.notificationBadge, color: "#fff", fontSize: 10 },
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "paperplane.fill" : "paperplane"}
                tintColor={color}
                size={24}
              />
            ) : (
              <Feather name="send" size={23} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "person.fill" : "person"}
                tintColor={color}
                size={26}
              />
            ) : (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={25}
                color={color}
              />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
