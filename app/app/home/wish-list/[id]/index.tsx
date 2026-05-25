import { useState, useEffect } from "react";
import { NavBar, PinkButton, toast } from "@/components/common";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ellipsis,
  Clock,
  MapPin,
  Wallet,
  User,
  Heart,
  MessageCircleMore,
} from "lucide-react-native";
// 引入 Dimensions 用来获取手机屏幕的宽度
import {
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Column, Row } from "@/components/layout";
import { Tag, type WishTagStatus } from "@/components/wish-list";
import {
  ImagesCoverPng,
  ImagesAvatarFemalePng,
  ImagesAvatarMalePng,
} from "@/assets";

// 获取当前设备的屏幕宽度
const { width: screenWidth } = Dimensions.get("window");

export default function WishListDetail() {
  // 页面：愿望清单详情页
  // 状态：动态存储计算后的图片高度
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

  const detailList = [
    {
      id: "Clock",
      Icon: Clock,
      label: "想完成时间",
      value: "2024-12-31",
    },
    {
      id: "MapPin",
      Icon: MapPin,
      label: "地点",
      value: "这是地点",
    },
    {
      id: "Wallet",
      Icon: Wallet,
      label: "预算",
      value: "这是预算",
    },
    {
      id: "User",
      Icon: User,
      label: "创建人",
      customValue: (
        <Row gap={4} items="center">
          <Image
            source={ImagesAvatarFemalePng}
            style={{ width: 24, height: 24, borderRadius: 20 }}
          />
          <Text>这是创建人</Text>
        </Row>
      ),
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

  const participants = [
    { id: "female", source: ImagesAvatarFemalePng },
    { id: "male", source: ImagesAvatarMalePng },
  ];

  //   TODO: 这个状态应该根据实际数据来动态设置，目前是为了展示效果先写死了
  const status: WishTagStatus = "planning";

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航栏部分 */}
      <NavBar
        rightContent={
          <TouchableOpacity onPress={() => toast.info("更多")}>
            <Ellipsis width={24} height={24} />
          </TouchableOpacity>
        }
      />
      <ScrollView>
        {/* 愿望封面图：宽度占满屏幕，高度等比例缩放 */}
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

        <Column gap={36} style={styles.contentContainer}>
          <Column gap={8}>
            <Row gap={8} items="center">
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                这是愿望标题
              </Text>
              <Tag status={status} />
            </Row>
            <Text style={{ color: "#666" }}>
              这是愿望的描述和计划，这是愿望的描述和计划，这是愿望的描述和计划，这是愿望的描述和计划。
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
                {!!item.customValue ? (
                  item.customValue
                ) : (
                  <Text>{item.value}</Text>
                )}
              </Row>
            ))}
          </Column>

          <Row style={styles.divider} />
          <Column gap={12}>
            <Text style={{ fontWeight: "bold" }}>
              参与人（{participants.length}/2）
            </Text>
            <Row gap={12}>
              {participants.map((p) => (
                <Image
                  key={p.id}
                  source={p.source}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
              ))}
            </Row>
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
            onPress={() => toast.info("开始计划")}
            style={{ flex: 1 }}
          />
        </Row>
      </Row>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    gap: 1,
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
