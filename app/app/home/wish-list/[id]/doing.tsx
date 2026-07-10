import { useCallback, useEffect, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ImagesCoverPng } from "@/assets";
import { NavBar, PinkButton, toast } from "@/components/common";
import { Column, Row } from "@/components/layout";
import { Tag, VerticalDashedLine } from "@/components/wish-list";
import {
  getWishRecords,
  type WishItem,
  type WishRecordItem,
} from "@/app/features/wish-list/api";
import { useImageViewer } from "@/hooks/use-image-viewer";

const { width: screenWidth } = Dimensions.get("window");

function formatMonthDay(dateText: string) {
  const parts = dateText.split("-");
  if (parts.length !== 3) {
    return dateText;
  }

  return `${parts[1]}/${parts[2]}`;
}

export default function Doing() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [imageHeight, setImageHeight] = useState(150);
  const [wish, setWish] = useState<WishItem | null>(null);
  const [records, setRecords] = useState<WishRecordItem[]>([]);
  const { openViewer, Viewer } = useImageViewer();

  const loadData = useCallback(async () => {
    const parsedWishId = Number(id);

    if (!Number.isInteger(parsedWishId) || parsedWishId <= 0) {
      toast.error("愿望不存在");
      return;
    }

    try {
      const response = await getWishRecords(parsedWishId);
      setWish(response.wish);
      setRecords(response.records);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "加载愿望记录失败";
      toast.error(message);
    }
  }, [id]);

  useEffect(() => {
    if (wish?.cover) {
      Image.getSize(
        wish.cover,
        (width, height) => {
          const calculatedHeight = screenWidth * (height / width);
          setImageHeight(calculatedHeight);
        },
        () => {
          const asset = Image.resolveAssetSource(ImagesCoverPng);
          if (asset?.width && asset?.height) {
            setImageHeight(screenWidth * (asset.height / asset.width));
          }
        },
      );
      return;
    }

    const asset = Image.resolveAssetSource(ImagesCoverPng);
    if (asset?.width && asset?.height) {
      const calculatedHeight = screenWidth * (asset.height / asset.width);
      setImageHeight(calculatedHeight);
    }
  }, [wish?.cover]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const coverSource: ImageSourcePropType = wish?.cover
    ? { uri: wish.cover }
    : ImagesCoverPng;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavBar
        rightContent={
          <TouchableOpacity
            onPress={() => router.push(`/home/wish-list/${id}/finish`)}
          >
            <Text>结束愿望</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => openViewer(coverSource)}>
          <Image
            source={coverSource}
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
          <Row gap={12}>
            <Text style={styles.title}>{wish?.title || "一起去看海"}</Text>
            <Tag status="doing" />
          </Row>
          <Text style={styles.sectionTitle}>我们的旅程</Text>
          <Row style={styles.divider} />

          {!!records.length ? (
            records.map((item, index) => {
              const isLastItem = index === records.length - 1;

              return (
                <Row key={item.id}>
                  <View style={styles.axisContainer}>
                    <Text style={styles.dateText}>
                      {formatMonthDay(item.recordDate)}
                    </Text>
                    {!isLastItem && <VerticalDashedLine />}
                  </View>

                  <View style={styles.contentContainer}>
                    <Text style={styles.contentTitle}>
                      {item.content || "这一天还没有补充内容"}
                    </Text>

                    {item.mediaUrls.length > 0 && (
                      <Row style={styles.imageGrid}>
                        {item.mediaUrls.map((img, idx) => (
                          <TouchableOpacity
                            key={`${item.id}-${idx}`}
                            onPress={() => openViewer({ uri: img })}
                          >
                            <Image
                              source={{ uri: img }}
                              style={styles.gridImage}
                            />
                          </TouchableOpacity>
                        ))}
                      </Row>
                    )}
                  </View>
                </Row>
              );
            })
          ) : (
            <Text style={styles.emptyText}>暂无记录，快去添加第一条吧。</Text>
          )}
        </Column>
      </ScrollView>

      <View style={{ paddingHorizontal: 16 }}>
        <PinkButton
          text="添加记录"
          onPress={() => router.push(`/home/wish-list/${id}/records/create`)}
        />
      </View>
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
  sectionTitle: {
    fontWeight: "bold",
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
