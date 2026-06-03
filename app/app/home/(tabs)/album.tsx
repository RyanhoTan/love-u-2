import { useEffect, useRef, useState } from "react";
import {
  Search,
  CloudUpload,
  Ellipsis,
  ImagePlus,
  Plus,
  Sparkles,
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
import { useMediaPicker } from "@/hooks/use-media-picker";
import { useStyledActionSheet } from "@/hooks/use-styled-action-sheet";
import { toast } from "@/components/common";
import { AllMedias, Favorites, Photos, Videos } from "@/components/album";
import { Row } from "@/components/layout";
import { colors } from "@/styles/colors";

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
  const { showStyledActionSheet } = useStyledActionSheet();
  const { pickFromLibrary } = useMediaPicker({
    mediaTypes: "image",
    mode: "multiple",
  });
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

  const handlePickImages = async () => {
    const assets = await pickFromLibrary();

    if (!assets.length) {
      return;
    }

    toast.success(`已选择 ${assets.length} 张图片`);
  };

  const openCreateMenu = () => {
    showStyledActionSheet(
      {
        options: ["创建时光故事", "上传照片/视频", "取消"],
        cancelButtonIndex: 2,
        title: "新建内容",
        icons: [
          <Sparkles key="story" size={20} color={colors.theme.primary} />,
          <ImagePlus key="photo" size={20} color={colors.theme.primary} />,
          <X key="cancel" size={20} color={colors.theme.secondary} />,
        ],
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            toast.info("创建时光故事");
            break;
          case 1:
            void handlePickImages();
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
          {headerMenus.map((menu, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
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
                    backgroundColor: colors.theme.primary,
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
            activeColor={colors.theme.primary}
            inactiveColor={colors.semantic.textSecondary}
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
    backgroundColor: colors.theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
