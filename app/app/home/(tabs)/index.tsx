import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, type ImageSourcePropType } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/app/features/auth/auth-context";
import { getCoupleSpace, type CoupleSpace } from "@/app/features/couple-space/api";
import { Column, Row } from "@/components/layout";
import {
  ImagesAnniversaryCalendarPng,
  ImagesAvatarFemalePng,
  ImagesAvatarMalePng,
  IconsHomeDoubleHeartSvg,
  IconsHomeGiftSvg,
  IconsHomeStatusSvg,
} from "@/assets";
import { MOCK_ANNIVERSARY_LIST } from "@/data/mock-anniversary";

export default function HomeScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const nextAnniversary = MOCK_ANNIVERSARY_LIST[0];
  const [coupleSpace, setCoupleSpace] = useState<CoupleSpace | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCoupleSpace() {
      if (!token) {
        if (isMounted) {
          setCoupleSpace(null);
        }
        return;
      }

      try {
        const response = await getCoupleSpace(token);
        if (isMounted) {
          setCoupleSpace(response.coupleSpace);
        }
      } catch {
        if (isMounted) {
          setCoupleSpace(null);
        }
      }
    }

    void loadCoupleSpace();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const leftAvatarSource: ImageSourcePropType = user?.avatar
    ? { uri: user.avatar }
    : ImagesAvatarMalePng;
  const rightAvatarSource: ImageSourcePropType = coupleSpace?.partner?.avatar
    ? { uri: coupleSpace.partner.avatar }
    : ImagesAvatarFemalePng;
  const daysInLoveText = `${coupleSpace?.daysInLove ?? 0}`;
  const anniversaryDateText = coupleSpace?.relationship?.anniversaryDate
    ? coupleSpace.relationship.anniversaryDate.replace(/-/g, ".")
    : "--.--.--";

  return (
    <Column gap={6} flex={1}>
      <Row gap={20} items="center" content="center" style={{ marginTop: 60 }}>
        <Image
          source={leftAvatarSource}
          style={{ width: 80, height: 80, borderRadius: 50 }}
        />
        <Image
          source={rightAvatarSource}
          style={{ width: 80, height: 80, borderRadius: 50 }}
        />
      </Row>
      <Text style={{ fontSize: 16, marginHorizontal: "auto" }}>我们在一起</Text>
      <Row content="center" items="baseline" gap={8}>
        <Text style={{ fontSize: 64, fontWeight: "bold", color: "#ff5b7e" }}>
          {daysInLoveText}
        </Text>
        <Text style={{ fontSize: 16, color: "#ff5b7e", fontWeight: "bold" }}>
          天
        </Text>
      </Row>
      <Text
        style={{ fontSize: 16, marginHorizontal: "auto", color: "#929091" }}
      >
        {anniversaryDateText}
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
          height: 150,
        }}
      >
        {nextAnniversary ? (
          <Column content="space-around" gap={12} style={{ height: "100%" }}>
            <Text style={{ fontSize: 14 }}>下一个纪念日</Text>
            <Row>
              <Text style={{ fontSize: 18 }}>{nextAnniversary.title}还剩</Text>
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#ff5b7e" }}
              >
                {nextAnniversary.remainingDays}
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
              {nextAnniversary.date}
            </Text>
          </Column>
        ) : (
          <Row
            content="space-around"
            gap={10}
            style={{ paddingVertical: 4, height: "100%" }}
          >
            <Image
              source={ImagesAnniversaryCalendarPng}
              style={{ width: 120, height: 120, resizeMode: "contain" }}
            />
            <Column content="space-between" gap={8}>
              <Text style={{ fontSize: 18, fontWeight: "700" }}>
                还没有纪念日
              </Text>
              <Text style={{ fontSize: 14, color: "#8F8F95" }}>
                记录属于你们的重要日子
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/home/anniversary/create")}
                style={{
                  paddingHorizontal: 28,
                  paddingVertical: 10,
                  backgroundColor: "#2F8CFF",
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
                >
                  添加纪念日
                </Text>
              </TouchableOpacity>
            </Column>
          </Row>
        )}
      </TouchableOpacity>
    </Column>
  );
}
