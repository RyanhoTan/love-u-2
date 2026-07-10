import { useEffect, useState } from "react";
import * as Clipboard from "expo-clipboard";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ImagesWishHugHeartPng } from "@/assets";
import { useAuth } from "@/app/features/auth/auth-context";
import { createCoupleInvite, getCoupleSpace } from "@/app/features/couple-space/api";
import { NavBar, PinkButton, toast } from "@/components/common";
import { Column, Row } from "@/components/layout";

export default function CoupleSpaceBindScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [myInviteCode, setMyInviteCode] = useState("");
  const [isInviteLoading, setIsInviteLoading] = useState(true);
  const [isInviteReady, setIsInviteReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadInviteCode() {
      if (!token) {
        if (!isMounted) {
          return;
        }

        setMyInviteCode("");
        setIsInviteReady(false);
        setIsInviteLoading(false);
        return;
      }

      setIsInviteLoading(true);

      try {
        const coupleSpaceResponse = await getCoupleSpace();
        const existingCode = coupleSpaceResponse.coupleSpace.activeInvite?.code ?? "";

        if (existingCode) {
          if (!isMounted) {
            return;
          }

          setMyInviteCode(existingCode);
          setIsInviteReady(true);
          return;
        }

        const inviteResponse = await createCoupleInvite();
        if (!isMounted) {
          return;
        }

        const nextInviteCode = inviteResponse.invite?.code ?? "";
        setMyInviteCode(nextInviteCode);
        setIsInviteReady(Boolean(nextInviteCode));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMyInviteCode("");
        setIsInviteReady(false);
        toast.error(
          error instanceof Error ? error.message : "邀请码获取失败，请稍后重试"
        );
      } finally {
        if (isMounted) {
          setIsInviteLoading(false);
        }
      }
    }

    void loadInviteCode();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleCopyCode = async () => {
    if (!myInviteCode) {
      toast.info("邀请码还没有准备好");
      return;
    }

    try {
      await Clipboard.setStringAsync(myInviteCode);
      toast.success("邀请码已复制");
    } catch {
      toast.error("复制失败，请稍后重试");
    }
  };

  const handleBind = () => {
    if (!inviteCode.trim()) {
      toast.info("请输入对方的邀请码");
      return;
    }

    router.push("/home/couple-space/finish");
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavBar title="情侣绑定" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Column items="center" gap={14}>
          <Image
            source={ImagesWishHugHeartPng}
            style={styles.heroImage}
            resizeMode="contain"
          />

          <Text style={styles.title}>邀请另一半加入</Text>
          <Text style={styles.subtitle}>开启你们的专属空间</Text>
        </Column>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>我的邀请码</Text>
          <Row items="center" content="space-between" style={styles.codeRow}>
            {isInviteLoading ? (
              <ActivityIndicator color="#FF4F7A" />
            ) : (
              <Text style={styles.myCode}>
                {isInviteReady ? myInviteCode : "------"}
              </Text>
            )}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.copyButton,
                !isInviteReady && styles.copyButtonDisabled,
              ]}
              onPress={handleCopyCode}
              disabled={!isInviteReady}
            >
              <Text style={styles.copyText}>复制</Text>
            </TouchableOpacity>
          </Row>
        </View>

        <Row items="center" gap={14} style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.orText}>或</Text>
          <View style={styles.divider} />
        </Row>

        <Column gap={10}>
          <Text style={styles.sectionLabel}>输入邀请码</Text>
          <TextInput
            value={inviteCode}
            onChangeText={setInviteCode}
            placeholder="请输入对方的邀请码"
            placeholderTextColor="#C7B8C0"
            autoCapitalize="characters"
            style={styles.input}
          />
        </Column>

        <View style={styles.footer}>
          <PinkButton
            text="立即绑定"
            onPress={handleBind}
            style={styles.bindButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#FFF9FB",
  },
  content: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 18,
  },
  heroImage: {
    width: "100%",
    height: 220,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
    color: "#2E2430",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#8F7D88",
    textAlign: "center",
  },
  card: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E2430",
  },
  codeRow: {
    borderWidth: 1,
    borderColor: "#F0DDE4",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    minHeight: 58,
  },
  myCode: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#2E2430",
  },
  copyButton: {
    borderWidth: 1,
    borderColor: "#FF4F7A",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  copyButtonDisabled: {
    borderColor: "#E9DEE3",
  },
  copyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF4F7A",
  },
  dividerRow: {
    alignItems: "center",
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E9DEE3",
  },
  orText: {
    fontSize: 14,
    color: "#B7A7B0",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E9DEE3",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#2E2430",
    backgroundColor: "#FFFFFF",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 8,
  },
  bindButton: {
    borderRadius: 16,
    paddingVertical: 14,
  },
});
