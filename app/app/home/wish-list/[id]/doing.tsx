import { NavBar, PinkButton } from "@/components/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ellipsis } from "lucide-react-native";
import { useState, useEffect } from "react";
import {
  Image,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ImagesCoverPng,
  ImagesAvatarMalePng,
  ImagesAvatarFemalePng,
} from "@/assets";
import { Column, Row } from "@/components/layout";
import { Tag, VerticalDashedLine } from "@/components/wish-list";
import { router, useLocalSearchParams } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

export default function Doing() {
  const { wishId } = useLocalSearchParams();
  const [imageHeight, setImageHeight] = useState(150); // 给个默认高度防止闪烁
  useEffect(() => {
    // 功能：获取本地图片的原始宽高，并根据屏幕宽度等比例缩放高度
    const asset = Image.resolveAssetSource(ImagesCoverPng);
    if (asset && asset.width && asset.height) {
      // 核心公式：实际高度 = 屏幕宽度 * (原图高 / 原图宽)
      const calculatedHeight = screenWidth * (asset.height / asset.width);
      setImageHeight(calculatedHeight);
    }
  }, []);

  //   TODO: 先写死数据，后续对接接口
  const recordData = [
    {
      id: "1",
      date: "05/01",
      title:
        "出发啦！✈️ \n今天内容特别多，哪怕换行撑高了页面，左边的线也不会断。\n我们先坐飞机去三亚，晚上可以去吃海鲜大餐\n我们先坐飞机去三亚，\n我们先坐飞机去三亚，\n我们先坐飞机去三亚，\n我们先坐飞机去三亚， 🦞   🦐",
      images: [
        ImagesCoverPng,
        ImagesAvatarMalePng,
        ImagesAvatarFemalePng,
        ImagesCoverPng,
        ImagesAvatarMalePng,
        ImagesAvatarFemalePng,
        ImagesCoverPng,
      ],
    },
    {
      id: "2",
      date: "05/02",
      title: "到达三亚，天气很好 ☀️",
      images: [ImagesAvatarMalePng, ImagesAvatarFemalePng],
    },
    { id: "3", date: "05/03", title: "蜈支洲岛一日游 🏝️", images: [] },
  ];
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavBar rightContent={<Ellipsis />} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={ImagesCoverPng}
          style={{
            width: screenWidth,
            height: imageHeight,
            resizeMode: "contain",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        />
        <Column gap={24} style={styles.container}>
          <Row gap={12}>
            {/* TODO: 这是title， 先写死 */}
            <Text style={styles.title}>一起去看海</Text>
            {/* TODO: 先写死 */}
            <Tag status="doing" />
          </Row>
          <Text style={{ fontWeight: "bold" }}>我们的旅程</Text>
          <Row style={styles.divider} />

          {!!recordData ? (
            recordData.map((item, index) => {
              const isLastItem = index === recordData.length - 1;

              return (
                // 这一行由右侧内容最高的那一边决定整体高度
                <Row key={item.id}>
                  {/* 【左侧轴线区域】 */}
                  <View style={styles.axisContainer}>
                    <Text style={styles.dateText}>{item.date}</Text>
                    {/* 重点：SVG 虚线会包裹在 axisContainer 剩余的空间里自动拉伸 */}
                    {!isLastItem && <VerticalDashedLine />}
                  </View>

                  {/* 【右侧内容区域】 */}
                  <View style={styles.contentContainer}>
                    <Text style={styles.contentTitle}>{item.title}</Text>

                    {item.images && item.images.length > 0 && (
                      <Row style={styles.imageGrid}>
                        {item.images.map((img, index) => (
                          <Image
                            key={index}
                            source={img}
                            style={styles.gridImage}
                          />
                        ))}
                      </Row>
                    )}
                  </View>
                </Row>
              );
            })
          ) : (
            <Text style={{ color: "#666" }}>暂无记录，快去添加第一条吧！</Text>
          )}
        </Column>
      </ScrollView>

      <View style={{ paddingHorizontal: 16 }}>
        <PinkButton
          text="添加记录"
          onPress={() =>
            router.push(`/home/wish-list/${wishId}/records/create`)
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    width: "100%",
  },

  timelineItem: {
    flexDirection: "row",
  },
  axisContainer: {
    width: 55,
    alignItems: "center",
    // 关键：不要给这里设固定高度，让它天然和右侧的 contentContainer 等高
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  contentContainer: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 30, // 决定了每天行程之间的间距（也就是虚线下延的长度）
  },
  contentTitle: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  imageGrid: {
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  gridImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    resizeMode: "cover",
  },
});
