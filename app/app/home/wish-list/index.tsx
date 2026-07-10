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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagesAuthBackgroundPng } from "@/assets";
import { MapPin, Plus } from "lucide-react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
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

function WishListScene({ category }: { category: WishCategory }) {
  return (
    <ScrollView
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    >
      {category.wishList.map((wish) => (
        <TouchableOpacity
          key={wish.id}
          style={styles.wishItem}
          onPress={() =>
            router.push(getWishDetailRoute(wish.id, category.type))
          }
        >
          <Row gap={12}>
            <Image
              source={{
                uri: wish.cover || "https://picsum.photos/seed/love-u/600/800",
              }}
              style={{ width: 100, height: 100, borderRadius: 8 }}
            />
            <Column content="space-between">
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {wish.title}
              </Text>

              <Tag status={category.type} />
              <Text style={{ color: colors.semantic.textSecondary }}>
                {`预计时间：${wish.time}`}
              </Text>
            </Column>
          </Row>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export default function WishList() {
  const layout = useWindowDimensions();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [index, setIndex] = useState(params.tab === "done" ? 2 : 0);
  const [mapVisible, setMapVisible] = useState(false);
  const [wishes, setWishes] = useState<WishItem[]>([]);

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

  const TodoRoute = () => <WishListScene category={categories[0]} />;
  const DoingRoute = () => <WishListScene category={categories[1]} />;
  const DoneRoute = () => <WishListScene category={categories[2]} />;

  const renderScene = SceneMap({
    todo: TodoRoute,
    doing: DoingRoute,
    done: DoneRoute,
  });

  useEffect(() => {
    if (params.tab === "done") {
      setIndex(2);
    }
  }, [params.tab]);

  return (
    <View style={styles.page}>
      <ImageBackground source={ImagesAuthBackgroundPng} style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          <Row content="space-between" items="center">
            <Text style={styles.title}>愿望清单</Text>
            <Row gap={8} items="center">
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
});
