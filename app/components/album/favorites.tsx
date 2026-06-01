import { useRef, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  LayoutChangeEvent,
} from "react-native";

const TABS = [
  { key: "stories", label: "故事" },
  { key: "photos", label: "照片" },
  { key: "videos", label: "视频" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function Favorites() {
  const [activeKey, setActiveKey] = useState<TabKey>("stories");
  const [tabWidth, setTabWidth] = useState(0);
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
      {/* 分段选择器 */}
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

      {/* 内容区 */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeKey === "stories" && <Placeholder label="收藏的故事" />}
        {activeKey === "photos" && <Placeholder label="收藏的照片" />}
        {activeKey === "videos" && <Placeholder label="收藏的视频" />}
      </ScrollView>
    </View>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{label}</Text>
      <Text style={styles.placeholderHint}>暂无内容</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    position: "relative",
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
    flexGrow: 1,
  },

  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 8,
  },

  placeholderText: {
    fontSize: 16,
    color: "#999",
  },

  placeholderHint: {
    fontSize: 13,
    color: "#ccc",
  },
});
