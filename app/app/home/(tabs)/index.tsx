import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  type ImageSourcePropType,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@/app/features/auth/auth-context";
import {
  getAnniversaries,
  type AnniversaryItem,
} from "@/app/features/anniversary/api";
import {
  getCoupleSpace,
  type CoupleSpace,
} from "@/app/features/couple-space/api";
import { Column, Row } from "@/components/layout";
import {
  ImagesAnniversaryCalendarPng,
  ImagesAvatarFemalePng,
  ImagesAvatarMalePng,
  IconsHomeGiftSvg,
} from "@/assets";

function formatDisplayDate(dateText: string) {
  return dateText.replace(/-/g, ".");
}

export default function HomeScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [anniversaries, setAnniversaries] = useState<AnniversaryItem[]>([]);
  const [coupleSpace, setCoupleSpace] = useState<CoupleSpace | null>(null);
  const [homeStatus, setHomeStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");

  const loadHomeData = useCallback(async () => {
    if (!token) {
      setCoupleSpace(null);
      setAnniversaries([]);
      setHomeStatus("ready");
      return;
    }

    try {
      setHomeStatus("loading");
      const coupleSpaceResponse = await getCoupleSpace();
      const nextCoupleSpace = coupleSpaceResponse.coupleSpace;
      const nextAnniversaries = nextCoupleSpace.isBound
        ? (await getAnniversaries()).anniversaries
        : [];

      setCoupleSpace(nextCoupleSpace);
      setAnniversaries(nextAnniversaries);
      setHomeStatus("ready");
    } catch {
      setCoupleSpace(null);
      setAnniversaries([]);
      setHomeStatus("error");
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void loadHomeData();
    }, [loadHomeData]),
  );

  const nextAnniversary = anniversaries[0];
  const leftAvatarSource: ImageSourcePropType = user?.avatar
    ? { uri: user.avatar }
    : ImagesAvatarMalePng;

  if (homeStatus === "loading") {
    return (
      <Column center flex={1} gap={12}>
        <ActivityIndicator color="#ff5b7e" />
        <Text style={{ color: "#8F8F95" }}>正在加载首页…</Text>
      </Column>
    );
  }

  if (homeStatus === "error") {
    return (
      <Column center flex={1} gap={16}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#34313B" }}>
          首页加载失败
        </Text>
        <Text style={{ color: "#8F8F95" }}>请检查网络后重试</Text>
        <TouchableOpacity
          onPress={() => void loadHomeData()}
          style={{
            borderRadius: 20,
            backgroundColor: "#ff5b7e",
            paddingHorizontal: 24,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>重新加载</Text>
        </TouchableOpacity>
      </Column>
    );
  }

  if (!coupleSpace?.isBound || !coupleSpace.partner) {
    return (
      <Column center flex={1} gap={18}>
        <Image
          source={leftAvatarSource}
          style={{ width: 88, height: 88, borderRadius: 44 }}
        />
        <Column center gap={8}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#34313B" }}>
            还没有绑定情侣
          </Text>
          <Text style={{ color: "#8F8F95", textAlign: "center" }}>
            邀请对方加入后，再一起记录心愿和纪念日
          </Text>
        </Column>
        <TouchableOpacity
          onPress={() => router.push("/home/couple-space/bind")}
          style={{
            borderRadius: 24,
            backgroundColor: "#ff5b7e",
            paddingHorizontal: 28,
            paddingVertical: 12,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            去绑定情侣
          </Text>
        </TouchableOpacity>
      </Column>
    );
  }

  const rightAvatarSource: ImageSourcePropType = coupleSpace?.partner?.avatar
    ? { uri: coupleSpace.partner.avatar }
    : ImagesAvatarFemalePng;
  const daysInLoveText =
    coupleSpace.daysInLove === null ? "—" : `${coupleSpace.daysInLove}`;
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
              {formatDisplayDate(nextAnniversary.nextOccurrenceDate)}
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
