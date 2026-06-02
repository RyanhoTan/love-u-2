import { useRef, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import { FavoritesStoriesGrid } from "./favorites-stories";
import { FavoritesPhotosGrid } from "./favorites-photos";
import { FavoritesVideosGrid } from "./favorites-videos";

const TABS = [
  { key: "stories", label: "故事" },
  { key: "photos", label: "照片" },
  { key: "videos", label: "视频" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function Favorites() {
  const [activeKey, setActiveKey] = useState<TabKey>("stories");
  const [tabWidth, setTabWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const indicatorLeft = useRef(new Animated.Value(0)).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setTabWidth(w / TABS.length);
  };

  const switchTab = (key: TabKey, idx: number) => {
    setActiveKey(key);
    Animated.spring(indicatorLeft, {
      toValue: idx * tabWidth,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar} onLayout={onLayout}>
        {tabWidth > 0 && (
          <Animated.View
            style={[
              styles.indicator,
              {
                width: tabWidth,
                transform: [{ translateX: indicatorLeft }],
              },
            ]}
          />
        )}

        {TABS.map((tab, idx) => {
          const isActive = activeKey === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => switchTab(tab.key, idx)}
            >
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={styles.content}
        onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}
      >
        {activeKey === "stories" && (
          <FavoritesStoriesGrid contentWidth={contentWidth} />
        )}
        {activeKey === "photos" && (
          <FavoritesPhotosGrid contentWidth={contentWidth} />
        )}
        {activeKey === "videos" && (
          <FavoritesVideosGrid contentWidth={contentWidth} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "95%",
    alignSelf: "center",
    position: "relative",
    marginBottom: 16,
  },
  indicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 42, 84, 0.06)",
    borderWidth: 1,
    borderColor: "#FF6b81",
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 36,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 14,
    color: "#aaa",
  },
  tabLabelActive: {
    color: "#FF6b81",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
});
