import { useEffect, useRef, useState } from "react";
import {
  Search,
  CloudUpload,
  Ellipsis,
  ImagePlus,
  Pencil,
  Plus,
  Sparkles,
  X,
} from "lucide-react-native";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, type Href } from "expo-router";
import { TabBar, TabView } from "react-native-tab-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlbumUpload } from "@/app/features/album/use-album-upload";
import { toast } from "@/components/common";
import { AllMedias, Favorites, Photos, Videos } from "@/components/album";
import { Row } from "@/components/layout";
import { useStyledActionSheet } from "@/hooks";
import { colors } from "@/styles/colors";

const FavoritesRoute = () => <Favorites />;

export default function Album() {
  const insets = useSafeAreaInsets();
  const { showStyledActionSheet } = useStyledActionSheet();
  const [albumRefreshKey, setAlbumRefreshKey] = useState(0);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const { startUpload } = useAlbumUpload({
    onSuccess: () => {
      setAlbumRefreshKey((currentKey) => currentKey + 1);
    },
  });

  const headerMenus = [
    { icon: Search, onPress: () => toast.info("搜索") },
    {
      icon: CloudUpload,
      onPress: () => router.push("/home/album/upload" as Href),
    },
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
            router.push("/home/album/stories/create");
            break;
          case 1:
            void startUpload();
            break;
          default:
            break;
        }
      },
    );
  };

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case "all":
        return <AllMedias refreshKey={albumRefreshKey} />;
      case "photos":
        return <Photos refreshKey={albumRefreshKey} />;
      case "videos":
        return <Videos refreshKey={albumRefreshKey} />;
      case "favorites":
        return <FavoritesRoute />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.page}>
      {moreMenuVisible ? (
        <Pressable
          style={styles.moreMenuMask}
          onPress={() => setMoreMenuVisible(false)}
        />
      ) : null}

      <Modal
        animationType="none"
        transparent
        visible={moreMenuVisible}
        onRequestClose={() => setMoreMenuVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setMoreMenuVisible(false)}
        >
          <View style={styles.modalMenuWrap}>
            <View style={styles.moreMenu}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => toast.info("编辑")}
                style={styles.moreMenuItem}
              >
                <Pencil color="#000000" size={16} strokeWidth={2.2} />
                <Text style={styles.moreMenuText}>编辑</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Row content="space-between" style={styles.headerRow}>
        <Text style={styles.title}>相册</Text>
        <Row gap={12}>
          {headerMenus.map((menu, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              onPress={menu.onPress}
              style={styles.headerButton}
            >
              <menu.icon />
            </TouchableOpacity>
          ))}

          <View style={styles.headerButtonWrap}>
            <TouchableOpacity
              onPress={() => setMoreMenuVisible((currentValue) => !currentValue)}
              style={styles.headerButton}
            >
              <Ellipsis />
            </TouchableOpacity>
          </View>
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
  headerRow: {
    paddingHorizontal: 16,
    zIndex: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  moreMenuMask: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
  },
  modalBackdrop: {
    flex: 1,
  },
  modalMenuWrap: {
    position: "absolute",
    top: 68,
    right: 16,
  },
  headerButtonWrap: {
    position: "relative",
    zIndex: 30,
  },
  headerButton: {
    padding: 8,
  },
  moreMenu: {
    position: "absolute",
    top: 44,
    right: 0,
    minWidth: 112,
    padding: 6,
    borderRadius: 14,
    backgroundColor: colors.semantic.surface,
    borderWidth: 1,
    borderColor: colors.semantic.divider,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 40,
  },
  moreMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  moreMenuText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.semantic.textPrimary,
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
