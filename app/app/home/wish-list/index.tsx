import { Column, Row } from "@/components/layout";
import {
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagesAuthBackgroundPng } from "@/assets";
import { useState } from "react";
import { Plus } from "lucide-react-native";
import { router } from "expo-router";
import { Tag, type WishTagStatus } from "@/components/wish-list";
import { colors } from "@/styles/colors";

function getWishDetailRoute(wishId: number, status: WishTagStatus) {
  if (status === "doing") {
    return `/home/wish-list/${wishId}/doing` as const;
  }

  if (status === "done") {
    return `/home/wish-list/${wishId}/memory` as const;
  }

  return `/home/wish-list/${wishId}` as const;
}

export default function WishList() {
  const wishList = [
    {
      id: 1,
      type: "todo",
      categoryName: "想做",
      // 页面中部：属于该分类的愿望列表
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
    // 后续可能会去掉 `计划中` 这个状态
    // {
    //   id: 2,
    //   type: "planning",
    //   categoryName: "计划中",
    //   wishList: [
    //     {
    //       id: 2,
    //       img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop",
    //       title: "一起养一只猫",
    //       time: "202-12-31",
    //     },
    //   ],
    // },
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

  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={ImagesAuthBackgroundPng} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, padding: 16, gap: 32 }}>
          <Row content="space-between" items="center">
            <Text style={styles.title}>愿望清单</Text>
            <TouchableOpacity
              onPress={() => router.push("/home/wish-list/create")}
            >
              <Plus color={colors.theme.primary} height={36} width={36} />
            </TouchableOpacity>
          </Row>
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Row gap={24}>
                {wishList.map((category, index) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedTab(index)}
                    style={[
                      styles.categoryButton,
                      { borderBottomWidth: selectedTab === index ? 3 : 0 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryName,
                        selectedTab === index && {
                          color: colors.theme.primary,
                        },
                      ]}
                    >
                      {category.categoryName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Row>
            </ScrollView>
          </View>
          <ScrollView
            contentContainerStyle={{ gap: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {wishList[selectedTab]?.wishList.map((wish) => (
              <TouchableOpacity
                key={wish.id}
                style={styles.wishItem}
                onPress={() =>
                  router.push(
                    getWishDetailRoute(
                      wish.id,
                      wishList[selectedTab].type as WishTagStatus,
                    ),
                  )
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

                    <Tag status={wishList[selectedTab].type as WishTagStatus} />
                    <Text
                      style={{ color: colors.semantic.textSecondary }}
                    >{`预计时间：${wish.time}`}</Text>
                  </Column>
                </Row>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  wishItem: {
    backgroundColor: colors.semantic.page,
    borderRadius: 12,
    padding: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  categoryButton: {
    paddingVertical: 12,

    borderColor: colors.theme.primary,
    paddingBottom: 4,
  },
});
