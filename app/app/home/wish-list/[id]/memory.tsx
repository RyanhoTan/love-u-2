import { NavBar, toast } from "@/components/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useImageViewer } from "@/hooks/use-image-viewer";
import {
  Image,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import {
  ImagesCoverPng,
  ImagesAvatarMalePng,
  ImagesAvatarFemalePng,
} from "@/assets";
import { Column, Row } from "@/components/layout";
import { Tag, VerticalDashedLine } from "@/components/wish-list";
import { Ellipsis, Share } from "lucide-react-native";

const { width: screenWidth } = Dimensions.get("window");

export default function Memory() {
  const [imageHeight, setImageHeight] = useState(150);
  const { openViewer, Viewer } = useImageViewer();

  useEffect(() => {
    const asset = Image.resolveAssetSource(ImagesCoverPng);

    if (asset && asset.width && asset.height) {
      const calculatedHeight = screenWidth * (asset.height / asset.width);
      setImageHeight(calculatedHeight);
    }
  }, []);

  const summaryStats = [
    { label: "照片", value: "32" },
    { label: "视频", value: "2" },
    { label: "记录", value: "12" },
  ];

  const recordData = [
    {
      id: "1",
      date: "05/01",
      title:
        "出发啦！\n今天内容特别多，哪怕换行撑高了页面，左边的线也不会断。我们先坐飞机去三亚，晚上可以去吃海鲜大餐。",
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
      title: "到达三亚，天气很好。",
      images: [ImagesAvatarMalePng, ImagesAvatarFemalePng],
    },
    { id: "3", date: "05/03", title: "蜈支洲岛一日游", images: [] },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <NavBar
        rightContent={
          <Row gap={12} items="center">
            <TouchableOpacity
              onPress={() => toast.info("分享功能开发中，敬请期待！")}
            >
              <Share size={22} color="#222" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toast.info("更多功能开发中，敬请期待！")}
            >
              <Ellipsis size={22} color="#222" />
            </TouchableOpacity>
          </Row>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => openViewer(ImagesCoverPng)}>
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
        </TouchableOpacity>
        <Column gap={24} style={styles.container}>
          <Column gap={12}>
            <Row gap={12} items="center">
              <Text style={styles.title}>一起看海</Text>
              <Tag status="done" />
            </Row>
            <Column gap={16} style={styles.summaryCard}>
              <Column gap={4}>
                <Text style={styles.summaryDate}>2025.05.01</Text>
                <Text style={styles.summaryDuration}>完成于第521天</Text>
              </Column>
              <Row content="space-between">
                {summaryStats.map((item) => (
                  <Column
                    key={item.label}
                    center
                    gap={4}
                    style={styles.statItem}
                  >
                    <Text style={styles.statValue}>{item.value}</Text>
                    <Text style={styles.statLabel}>{item.label}</Text>
                  </Column>
                ))}
              </Row>
            </Column>
          </Column>

          <Text style={{ fontWeight: "bold" }}>我们的旅程</Text>
          <Row style={styles.divider} />

          {!!recordData.length ? (
            recordData.map((item, index) => {
              const isLastItem = index === recordData.length - 1;

              return (
                <Row key={item.id}>
                  <View style={styles.axisContainer}>
                    <Text style={styles.dateText}>{item.date}</Text>
                    {!isLastItem && <VerticalDashedLine />}
                  </View>

                  <View style={styles.contentContainer}>
                    <Text style={styles.contentTitle}>{item.title}</Text>

                    {item.images.length > 0 && (
                      <Row style={styles.imageGrid}>
                        {item.images.map((img, idx) => (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => openViewer(img)}
                          >
                            <Image source={img} style={styles.gridImage} />
                          </TouchableOpacity>
                        ))}
                      </Row>
                    )}
                  </View>
                </Row>
              );
            })
          ) : (
            <Text style={styles.emptyText}>暂无记录</Text>
          )}
        </Column>
      </ScrollView>
      {Viewer}
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
  summaryCard: {
    paddingVertical: 16,
  },
  summaryDate: {
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryDuration: {
    color: "#666",
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
  },
  statLabel: {
    color: "#666",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    width: "100%",
  },
  axisContainer: {
    width: 55,
    alignItems: "center",
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  contentContainer: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 30,
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
  emptyText: {
    color: "#666",
  },
});
