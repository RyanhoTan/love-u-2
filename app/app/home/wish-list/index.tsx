import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  View,
  TouchableOpacity,
  useWindowDimensions,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ImagesAuthBackgroundPng,
  ImagesWishDefaultWishCoverPng,
} from "@/assets";
import { Check, MapPin, Plus, Trash2, Undo2 } from "lucide-react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { TabBar, TabView } from "react-native-tab-view";
import { MapOverviewModal, Tag, type MapMarker } from "@/components/wish-list";
import { Column, Row } from "@/components/layout";
import { colors } from "@/styles/colors";
import { toast } from "@/components/common";
import {
  getWishes,
  type WishItem,
  type WishStatus,
} from "@/app/features/wish-list/api";

type WishRoute = {
  key: WishStatus;
  title: string;
};

type WishCategory = {
  id: number;
  type: WishStatus;
  categoryName: string;
  wishList: {
    id: number;
    cover: string;
    title: string;
    time: string;
    status: WishStatus;
  }[];
};

function getWishDetailRoute(wishId: number, status: WishStatus) {
  if (status === "doing") {
    return `/home/wish-list/${wishId}/doing` as const;
  }

  if (status === "done") {
    return `/home/wish-list/${wishId}/memory` as const;
  }

  return `/home/wish-list/${wishId}` as const;
}

function WishListScene({
  category,
  editing,
  selectedIds,
  onWishPress,
  onWishLongPress,
}: {
  category: WishCategory;
  editing: boolean;
  selectedIds: number[];
  onWishPress: (wish: WishCategory["wishList"][number]) => void;
  onWishLongPress: (wish: WishCategory["wishList"][number]) => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    >
      {category.wishList.map((wish) => {
        const selected = selectedIds.includes(wish.id);

        return (
          <TouchableOpacity
            key={wish.id}
            activeOpacity={0.82}
            style={[styles.wishItem, selected && styles.wishItemEditing]}
            onPress={() => onWishPress(wish)}
            onLongPress={() => onWishLongPress(wish)}
          >
            <Row content="space-between" items="center" gap={12}>
              <Row gap={12} style={styles.wishInfo}>
                <Image
                  source={
                    wish.cover
                      ? { uri: wish.cover }
                      : ImagesWishDefaultWishCoverPng
                  }
                  style={[
                    styles.wishCover,
                    editing && styles.wishCoverEditing,
                  ]}
                />
                <Column content="space-between" style={styles.wishText}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.wishTitle,
                      editing && styles.wishTitleEditing,
                    ]}
                  >
                    {wish.title}
                  </Text>

                  <Tag status={category.type} />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.wishTime,
                      editing && styles.wishTimeEditing,
                    ]}
                  >
                    {`预计时间：${wish.time}`}
                  </Text>
                </Column>
              </Row>

              {editing ? (
                <View
                  style={[
                    styles.checkbox,
                    selected && styles.checkboxSelected,
                  ]}
                >
                  {selected ? (
                    <Check color="#fff" height={14} width={14} />
                  ) : null}
                </View>
              ) : null}
            </Row>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default function WishList() {
  const layout = useWindowDimensions();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [index, setIndex] = useState(params.tab === "done" ? 2 : 0);
  const [mapVisible, setMapVisible] = useState(false);
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [selectedWishIds, setSelectedWishIds] = useState<number[]>([]);

  const refreshWishes = useCallback(async () => {
    try {
      const response = await getWishes();
      setWishes(response.wishes);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "加载愿望清单失败";
      toast.error(message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshWishes();
    }, [refreshWishes]),
  );

  const categories = useMemo<WishCategory[]>(
    () => [
      {
        id: 1,
        type: "todo",
        categoryName: "想做",
        wishList: wishes
          .filter((wish) => wish.status === "todo")
          .map((wish) => ({
            id: wish.id,
            cover: wish.cover,
            title: wish.title,
            time: wish.targetDate,
            status: wish.status,
          })),
      },
      {
        id: 2,
        type: "doing",
        categoryName: "进行中",
        wishList: wishes
          .filter((wish) => wish.status === "doing")
          .map((wish) => ({
            id: wish.id,
            cover: wish.cover,
            title: wish.title,
            time: wish.targetDate,
            status: wish.status,
          })),
      },
      {
        id: 3,
        type: "done",
        categoryName: "已完成",
        wishList: wishes
          .filter((wish) => wish.status === "done")
          .map((wish) => ({
            id: wish.id,
            cover: wish.cover,
            title: wish.title,
            time: wish.targetDate,
            status: wish.status,
          })),
      },
    ],
    [wishes],
  );

  const routes: WishRoute[] = categories.map((category) => ({
    key: category.type,
    title: category.categoryName,
  }));

  const markers = useMemo<MapMarker[]>(
    () =>
      wishes
        .filter((wish) => wish.latitude !== null && wish.longitude !== null)
        .map((wish) => ({
          id: String(wish.id),
          name: wish.locationName || wish.title,
          latitude: wish.latitude as number,
          longitude: wish.longitude as number,
          color:
            wish.status === "todo"
              ? "#ff6b81"
              : wish.status === "doing"
                ? "#35baf6"
                : "#b17cff",
        })),
    [wishes],
  );

  const toggleWishSelection = useCallback((wishId: number) => {
    setSelectedWishIds((current) =>
      current.includes(wishId)
        ? current.filter((id) => id !== wishId)
        : [...current, wishId],
    );
  }, []);

  const handleWishPress = useCallback(
    (wish: WishCategory["wishList"][number]) => {
      if (editing) {
        toggleWishSelection(wish.id);
        return;
      }

      router.push(getWishDetailRoute(wish.id, wish.status));
    },
    [editing, toggleWishSelection],
  );

  const handleWishLongPress = useCallback(
    (wish: WishCategory["wishList"][number]) => {
      setEditing(true);
      setSelectedWishIds((current) =>
        current.includes(wish.id) ? current : [...current, wish.id],
      );
    },
    [],
  );

  const cancelEditing = useCallback(() => {
    setEditing(false);
    setSelectedWishIds([]);
  }, []);

  const renderScene = useCallback(
    ({ route }: { route: WishRoute }) => {
      const category = categories.find((item) => item.type === route.key);

      if (!category) {
        return null;
      }

      return (
        <WishListScene
          category={category}
          editing={editing}
          selectedIds={selectedWishIds}
          onWishPress={handleWishPress}
          onWishLongPress={handleWishLongPress}
        />
      );
    },
    [
      categories,
      editing,
      handleWishLongPress,
      handleWishPress,
      selectedWishIds,
    ],
  );

  useEffect(() => {
    if (params.tab === "done") {
      setIndex(2);
    }
  }, [params.tab]);

  useEffect(() => {
    if (!editing) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        cancelEditing();
        return true;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [cancelEditing, editing]);

  return (
    <View style={styles.page}>
      <ImageBackground source={ImagesAuthBackgroundPng} style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          <Row content="space-between" items="center">
            <Text style={styles.title}>愿望清单</Text>
            <Row gap={8} items="center">
              {editing ? (
                <>
                  <TouchableOpacity
                    style={styles.cancelEditButton}
                    onPress={cancelEditing}
                  >
                    <Text style={styles.cancelEditText}>取消</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton}>
                    <Trash2
                      color={colors.theme.primary}
                      height={22}
                      width={22}
                    />
                  </TouchableOpacity>
                </>
              ) : null}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/home/wish-list/recycle")}
              >
                <Undo2 color={colors.theme.primary} height={22} width={22} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setMapVisible(true)}
              >
                <MapPin color={colors.theme.primary} height={22} width={22} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/home/wish-list/create")}
              >
                <Plus color={colors.theme.primary} height={22} width={22} />
              </TouchableOpacity>
            </Row>
          </Row>

          <TabView
            style={styles.tabView}
            initialLayout={{ width: layout.width }}
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            lazy
            renderTabBar={(props) => (
              <TabBar
                {...props}
                scrollEnabled
                gap={24}
                indicatorStyle={styles.indicator}
                style={styles.tabBar}
                contentContainerStyle={styles.tabBarContent}
                tabStyle={styles.tab}
                activeColor={colors.theme.primary}
                inactiveColor={colors.semantic.textSecondary}
                options={Object.fromEntries(
                  routes.map((route) => [
                    route.key,
                    {
                      labelText: route.title,
                      labelStyle: styles.tabLabel,
                    },
                  ]),
                )}
              />
            )}
          />
          <MapOverviewModal
            visible={mapVisible}
            onClose={() => setMapVisible(false)}
            markers={markers}
          />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelEditButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelEditText: {
    color: colors.theme.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  tabView: {
    flex: 1,
    marginTop: 20,
  },
  tabBar: {
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 16,
  },
  tabBarContent: {
    flexGrow: 0,
  },
  tab: {
    flex: 0,
    width: "auto",
    paddingHorizontal: 0,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "none",
    textAlign: "center",
  },
  indicator: {
    backgroundColor: colors.theme.primary,
    height: 3,
  },
  listContent: {
    gap: 16,
    paddingBottom: 16,
  },
  wishItem: {
    backgroundColor: colors.semantic.page,
    borderRadius: 12,
    padding: 16,
  },
  wishItemEditing: {
    alignSelf: "flex-start",
    width: "80%",
    padding: 13,
  },
  wishInfo: {
    flex: 1,
  },
  wishCover: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  wishCoverEditing: {
    width: 80,
    height: 80,
  },
  wishText: {
    flex: 1,
  },
  wishTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  wishTitleEditing: {
    fontSize: 14,
  },
  wishTime: {
    color: colors.semantic.textSecondary,
  },
  wishTimeEditing: {
    fontSize: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.theme.primary,
  },
});
