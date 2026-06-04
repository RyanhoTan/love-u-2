import { Image, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Column, Row } from "@/components/layout";
import {
  ImagesAvatarMalePng,
  ImagesAvatarFemalePng,
  IconsHomeStatusSvg,
  IconsHomeDoubleHeartSvg,
  IconsHomeGiftSvg,
} from "@/assets";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <Column gap={6} flex={1}>
      <Row gap={20} items="center" content="center" style={{ marginTop: 60 }}>
        <Image
          source={ImagesAvatarMalePng}
          style={{ width: 80, height: 80, borderRadius: 50 }}
        />
        <Image
          source={ImagesAvatarFemalePng}
          style={{ width: 80, height: 80, borderRadius: 50 }}
        />
      </Row>
      <Text style={{ fontSize: 16, marginHorizontal: "auto" }}>我们在一起</Text>
      <Row content="center" items="baseline" gap={8}>
        <Text style={{ fontSize: 64, fontWeight: "bold", color: "#ff5b7e" }}>
          520
        </Text>
        <Text style={{ fontSize: 16, color: "#ff5b7e", fontWeight: "bold" }}>
          天
        </Text>
      </Row>
      <Text
        style={{ fontSize: 16, marginHorizontal: "auto", color: "#929091" }}
      >
        2023年01月01日
      </Text>
      <Row center gap={12} style={{ overflow: "hidden" }}>
        <TouchableOpacity onPress={() => router.push("/home/status")}>
          <Column
            center
            gap={8}
            bg="#fff"
            rounded={20}
            style={{ padding: 8, marginTop: 42, width: 120 }}
          >
            <IconsHomeStatusSvg width={72} height={72} />
            <Text style={{ fontSize: 16, textAlign: "center" }}>今日状态</Text>
          </Column>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/home/asentence")}>
          <Column
            center
            gap={8}
            bg="#fff"
            rounded={20}
            style={{ padding: 8, marginTop: 42, width: 120 }}
          >
            <IconsHomeDoubleHeartSvg width={72} height={72} />
            <Text style={{ fontSize: 16, textAlign: "center" }}>一句话</Text>
          </Column>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/home/wish-list")}>
          <Column
            center
            gap={8}
            bg="#fff"
            rounded={20}
            style={{ padding: 8, marginTop: 42, width: 120 }}
          >
            <IconsHomeGiftSvg width={72} height={72} />
            <Text style={{ fontSize: 16, textAlign: "center" }}>愿望清单</Text>
          </Column>
        </TouchableOpacity>
      </Row>
      <TouchableOpacity
        onPress={() => router.push("/home/anniversary")}
        style={{
          padding: 16,
          backgroundColor: "#fff",
          borderRadius: 20,
          marginTop: 42,
        }}
      >
        <Column gap={12}>
          <Text style={{ fontSize: 14 }}>下一个纪念日</Text>
          <Row>
            <Text style={{ fontSize: 18 }}>恋爱纪念日还剩</Text>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: "#ff5b7e" }}
            >
              1
            </Text>
            <Text style={{ fontSize: 18 }}> 天</Text>
          </Row>
          <Text
            style={{
              backgroundColor: "#f0f0f0",
              padding: 4,
              borderRadius: 6,
              alignSelf: "flex-start",
            }}
          >
            2024.01.01
          </Text>
        </Column>
      </TouchableOpacity>
    </Column>
  );
}
