import { useEffect, useRef, useState } from "react";
import { useActionSheet } from "@expo/react-native-action-sheet";
import {
  Search,
  CloudUpload,
  Ellipsis,
  ImagePlus,
  Plus,
  Sparkles,
  Video,
  X,
} from "lucide-react-native";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TabBar, SceneMap, TabView } from "react-native-tab-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "@/components/common";
import { AllMedias, Favorites, Photos, Videos } from "@/components/album";
import { Row } from "@/components/layout";

const AllRoute = () => <AllMedias />;
const PhotosRoute = () => <Photos />;
const VideosRoute = () => <Videos />;
const FavoritesRoute = () => <Favorites />;

const renderScene = SceneMap({
  all: AllRoute,
  photos: PhotosRoute,
  videos: VideosRoute,
  favorites: FavoritesRoute,
});

export default function Album() {
  const insets = useSafeAreaInsets();
  const { showActionSheetWithOptions } = useActionSheet();
  const headerMenus = [
    { name: "搜索", icon: Search, onPress: () => toast.info("搜索") },
    { name: "上传", icon: CloudUpload, onPress: () => toast.info("上传") },
    { name: "更多", icon: Ellipsis, onPress: () => toast.info("更多") },
  ];

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "all", title: "全部" },
    { key: "photos", title: "照片" },
    { key: "videos", title: "视频" },
    { key: "favorites", title: "收藏" },
  ]);

  const indicatorPos = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(indicatorPos, {
      toValue: index,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [index, indicatorPos]);

  const openCreateMenu = () => {
    showActionSheetWithOptions(
      {
        options: ["创建时光故事", "上传照片", "上传视频", "取消"],
        cancelButtonIndex: 3,
        title: "新建内容",
        useModal: true,
        showSeparators: true,
        tintColor: "#2F2430",
        cancelButtonTintColor: "#FF6B8B",
        containerStyle: {
          ...styles.actionSheet,
          paddingBottom: Math.max(insets.bottom, 12),
        },
        separatorStyle: styles.actionSheetSeparator,
        titleTextStyle: styles.actionSheetTitle,
        textStyle: styles.actionSheetText,
        icons: [
          <Sparkles key="story" size={20} color="#FF6B8B" />,
          <ImagePlus key="photo" size={20} color="#FF6B8B" />,
          <Video key="video" size={20} color="#FF6B8B" />,
          <X key="cancel" size={20} color="#FF9AAF" />,
        ],
        tintIcons: false,
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            toast.info("创建时光故事");
            break;
          case 1:
            toast.info("上传照片");
            break;
          case 2:
            toast.info("上传视频");
            break;
          default:
            break;
        }
      },
    );
  };

  return (
    <View style={styles.page}>
      <Row content="space-between">
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>相册</Text>
        <Row gap={12}>
          {headerMenus.map((menu, index) => (
            <TouchableOpacity
              key={index}
              onPress={menu.onPress}
              style={{ padding: 8 }}
            >
              <menu.icon />
            </TouchableOpacity>
          ))}
        </Row>
      </Row>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        lazy
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: "transparent" }}
            renderIndicator={(indicatorProps) => {
              const tabWidth = indicatorProps.layout.width / routes.length;
              return (
                <Animated.View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    height: 3,
                    backgroundColor: "#FF6b81",
                    borderRadius: 2,
                    width: tabWidth,
                    transform: [
                      { translateX: Animated.multiply(indicatorPos, tabWidth) },
                    ],
                  }}
                />
              );
            }}
            style={{ backgroundColor: "transparent", marginBottom: 16 }}
            activeColor="#FF6B8B"
            inactiveColor="#aaa"
          />
        )}
      />

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={openCreateMenu}
        style={[
          styles.fab,
          {
            right: 16,
            bottom: Math.max(insets.bottom, 12) + 16,
          },
        ]}
      >
        <Plus color="#fff" size={28} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingVertical: 12,
  },
  fab: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF6B8B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6B8B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  actionSheet: {
    backgroundColor: "#FFFDFE",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 139, 0.16)",
    shadowColor: "#E97894",
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    overflow: "hidden",
  },
  actionSheetSeparator: {
    backgroundColor: "#F9DDE4",
    marginHorizontal: 16,
    width: undefined,
  },
  actionSheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2F2430",
  },
  actionSheetText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2F2430",
  },
});
