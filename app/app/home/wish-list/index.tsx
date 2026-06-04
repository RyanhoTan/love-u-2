import { useEffect, useState } from "react";
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
import { Plus } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { Tag, type WishTagStatus } from "@/components/wish-list";
import { Column, Row } from "@/components/layout";
import { colors } from "@/styles/colors";

type WishItem = {
  id: number;
  img: string;
  title: string;
  time: string;
};

type WishCategory = {
  id: number;
  type: WishTagStatus;
  categoryName: string;
  wishList: WishItem[];
};

type WishRoute = {
  key: WishTagStatus;
  title: string;
};

const wishList: WishCategory[] = [
  {
    id: 1,
    type: "todo",
    categoryName: "想做",
    wishList: [
      {
        id: 1,
        img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&h=150&fit=crop",
        title: "一起去看海",
        time: "2024-12-31",
      },
      {
        id: 3,
        img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=150&h=150&fit=crop",
        title: "一起去旅行",
        time: "2024-12-32",
      },
    ],
  },
  {
    id: 3,
    type: "doing",
    categoryName: "进行中",
    wishList: [
      {
        id: 2,
        img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop",
        title: "一起养一只猫",
        time: "2024-131",
      },
    ],
  },
  {
    id: 4,
    type: "done",
    categoryName: "已完成",
    wishList: [
      {
        id: 2,
        img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop",
        title: "一起养一只猫",
        time: "2024",
      },
    ],
  },
];

function getWishDetailRoute(wishId: number, status: WishTagStatus) {
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
                uri: wish.img,
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

const TodoRoute = () => <WishListScene category={wishList[0]} />;
const DoingRoute = () => <WishListScene category={wishList[1]} />;
const DoneRoute = () => <WishListScene category={wishList[2]} />;

const renderScene = SceneMap({
  todo: TodoRoute,
  doing: DoingRoute,
  done: DoneRoute,
});

export default function WishList() {
  const layout = useWindowDimensions();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [index, setIndex] = useState(params.tab === "done" ? 2 : 0);
  const routes: WishRoute[] = wishList.map((category) => ({
    key: category.type,
    title: category.categoryName,
  }));

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
            <TouchableOpacity
              onPress={() => router.push("/home/wish-list/create")}
            >
              <Plus color={colors.theme.primary} height={36} width={36} />
            </TouchableOpacity>
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
