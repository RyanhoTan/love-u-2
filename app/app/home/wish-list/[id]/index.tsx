import { useState, useEffect, useCallback, useRef } from "react";
import { NavBar, PinkButton, toast } from "@/components/common";
import { useImageViewer } from "@/hooks/use-image-viewer";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Clock,
  MapPin,
  Wallet,
  Heart,
  MessageCircleMore,
  Pencil,
} from "lucide-react-native";
import type { ImageSourcePropType } from "react-native";
// 引入 Dimensions 用来获取手机屏幕的宽度
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Column, Row } from "@/components/layout";
import { Tag } from "@/components/wish-list";
import { ImagesCoverPng } from "@/assets";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  getWishById,
  updateWish,
  type WishItem,
} from "@/app/features/wish-list/api";

// 获取当前设备的屏幕宽度
const { width: screenWidth } = Dimensions.get("window");

export default function WishListDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  // 页面：愿望清单详情页
  // 状态：动态存储计算后的图片高度
  const { openViewer, Viewer } = useImageViewer();
  const [imageHeight, setImageHeight] = useState(150); // 给个默认高度防止闪烁
  const [wish, setWish] = useState<WishItem | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [loadError, setLoadError] = useState("");
  const [isStartingPlan, setIsStartingPlan] = useState(false);
  const requestId = useRef(0);

  const loadWish = useCallback(
    async () => {
      const parsedWishId = Number(id);
      const currentRequestId = requestId.current + 1;
      requestId.current = currentRequestId;
      setWish(null);
      setLoadError("");

      if (!Number.isInteger(parsedWishId) || parsedWishId <= 0) {
        setLoadError("心愿不存在，请检查链接后重试");
        setLoadState("error");
        return;
      }

      setLoadState("loading");
      try {
        const response = await getWishById(parsedWishId);
        if (requestId.current === currentRequestId) {
          setWish(response.wish);
          setLoadState("ready");
        }
      } catch (error) {
        if (requestId.current === currentRequestId) {
          setLoadError(
            error instanceof Error ? error.message : "加载心愿详情失败，请重试",
          );
          setLoadState("error");
        }
      }
    },
    [id],
  );

  useFocusEffect(
    useCallback(() => {
      void loadWish();
      return () => {
        requestId.current += 1;
      };
    }, [loadWish]),
  );

  useEffect(() => {
    // 功能：获取图片的原始宽高，并根据屏幕宽度等比例缩放高度
    if (wish?.cover) {
      Image.getSize(
        wish.cover,
        (width, height) => {
          const calculatedHeight = screenWidth * (height / width);
          setImageHeight(calculatedHeight);
        },
        () => {
          const asset = Image.resolveAssetSource(ImagesCoverPng);
          if (asset && asset.width && asset.height) {
            const calculatedHeight = screenWidth * (asset.height / asset.width);
            setImageHeight(calculatedHeight);
          }
        },
      );
      return;
    }

    const asset = Image.resolveAssetSource(ImagesCoverPng);
    if (asset && asset.width && asset.height) {
      const calculatedHeight = screenWidth * (asset.height / asset.width);
      setImageHeight(calculatedHeight);
    }
  }, [wish?.cover]);

  if (loadState !== "ready" || !wish) {
    return (
      <SafeAreaView style={styles.container}>
        <NavBar />
        {loadState === "loading" ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator color="#FF4F7A" />
            <Text style={styles.stateText}>正在加载心愿…</Text>
          </View>
        ) : (
          <View style={styles.stateContainer}>
            <Text accessibilityRole="alert" style={styles.errorText}>
              {loadError || "心愿数据不可用，请重试"}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => void loadWish()}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>重新加载</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  const coverSource: ImageSourcePropType = wish?.cover
    ? { uri: wish.cover }
    : ImagesCoverPng;

  const detailList = [
    {
      id: "Clock",
      Icon: Clock,
      label: "想完成时间",
      value: wish.targetDate || "—",
    },
    {
      id: "MapPin",
      Icon: MapPin,
      label: "地点",
      value: wish.locationName || "—",
    },
    {
      id: "Wallet",
      Icon: Wallet,
      label: "预算",
      value: wish.budgetAmount != null ? `¥${wish.budgetAmount}` : "—",
    },
  ];

  const actionButtons = [
    {
      id: "Heart",
      Icon: Heart,
      onPress: () => toast.info("喜欢"),
    },
    {
      id: "MessageCircleMore",
      Icon: MessageCircleMore,
      onPress: () => toast.info("信息"),
    },
  ];

  const handleStartPlan = async () => {
    const parsedWishId = Number(id);

    if (!Number.isInteger(parsedWishId) || parsedWishId <= 0) {
      toast.error("愿望不存在");
      return;
    }

    if (isStartingPlan) {
      return;
    }

    try {
      setIsStartingPlan(true);
      const response = await updateWish(parsedWishId, { status: "doing" });
      setWish(response.wish);
      router.replace(`/home/wish-list/${parsedWishId}/doing`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "开始计划失败";
      toast.error(message);
    } finally {
      setIsStartingPlan(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航栏部分 */}
      <NavBar
        rightContent={
          wish ? (
            <TouchableOpacity
              accessibilityLabel="编辑心愿标题和描述"
              onPress={() => router.push(`/home/wish-list/${id}/edit`)}
              hitSlop={8}
            >
              <Pencil width={22} height={22} />
            </TouchableOpacity>
          ) : null
        }
      />
      <ScrollView>
        {/* 愿望封面图：宽度占满屏幕，高度等比例缩放 */}
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

        <Column gap={36} style={styles.contentContainer}>
          <Column gap={8}>
            <Row gap={8} items="center">
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {wish.title}
              </Text>
              <Tag status={wish.status} />
            </Row>
            <Text style={{ color: "#666" }}>
              {wish.description || "还没有写下描述"}
            </Text>
          </Column>
          <Row style={styles.divider} />
          <Column gap={20}>
            {detailList.map((item) => (
              <Row key={item.id} gap={8} items="center" content="space-between">
                <Row gap={8} items="center">
                  <item.Icon color="#666" />
                  <Text>{item.label}</Text>
                </Row>
                <Text>{item.value}</Text>
              </Row>
            ))}
          </Column>
        </Column>
      </ScrollView>
      <Row style={styles.bottomBar}>
        <Row style={styles.actionButtonsWrapper}>
          {actionButtons.map((btn) => (
            <TouchableOpacity
              key={btn.id}
              style={styles.actionButton}
              onPress={btn.onPress}
            >
              <btn.Icon />
            </TouchableOpacity>
          ))}
        </Row>

        <Row style={styles.submitButtonWrapper}>
          <PinkButton
            text="开始计划"
            onPress={() => void handleStartPlan()}
            style={{ flex: 1 }}
          />
        </Row>
      </Row>
      {Viewer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    gap: 1,
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  stateText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  errorText: {
    color: "#C6284D",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    color: "#FF4F7A",
    fontSize: 14,
    fontWeight: "600",
  },
  contentContainer: {
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    width: "100%",
  },
  bottomBar: {
    width: "100%",
    alignItems: "center",
  },
  actionButtonsWrapper: {
    flex: 1,
    justifyContent: "space-around",
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#fff8f8",
    borderRadius: 30,
  },
  submitButtonWrapper: {
    flex: 1,
    paddingHorizontal: 8,
  },
});
