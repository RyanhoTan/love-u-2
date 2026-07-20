import { useEffect, useRef, useState } from "react";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { ImagesAvatarFemalePng, ImagesAvatarMalePng } from "@/assets";
import { useAuth } from "@/app/features/auth/auth-context";
import {
  getCoupleSpace,
  type CoupleSpace,
} from "@/app/features/couple-space/api";
import { usePartnerChat } from "@/app/features/partner-chat/use-partner-chat";
import {
  ChatInput,
  ChatListItem,
  useChatInputKeyboardOffset,
} from "@/components/interact";
import { Column } from "@/components/layout";

const BOTTOM_THRESHOLD = 20;

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function getStatusText(status: string) {
  if (status === "read") return "已读";
  if (status === "sending") return "发送中";
  if (status === "partner_offline") return "对方离线";
  if (status === "failed") return "发送失败";
  return "";
}

export default function Interact() {
  const keyboardVerticalOffset = useChatInputKeyboardOffset();
  const isFocused = useIsFocused();
  const { token, user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const isAtBottomRef = useRef(true);
  const [inputValue, setInputValue] = useState("");
  const [coupleSpace, setCoupleSpace] = useState<CoupleSpace | null>(null);
  const { messages, sendMessage } =
    usePartnerChat(token, { isVisible: isFocused });

  const isBound = Boolean(coupleSpace?.isBound && coupleSpace.partner);
  const canSendMessage = isBound;

  const selfAvatar: ImageSourcePropType = user?.avatar
    ? { uri: user.avatar }
    : ImagesAvatarMalePng;
  const partnerAvatar: ImageSourcePropType = coupleSpace?.partner?.avatar
    ? { uri: coupleSpace.partner.avatar }
    : ImagesAvatarFemalePng;



  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - layoutMeasurement.height - contentOffset.y;
    isAtBottomRef.current = distanceFromBottom <= BOTTOM_THRESHOLD;
  };

  const handleSend = () => {
    const nextValue = inputValue.trim();
    if (!nextValue || !canSendMessage) return;

    sendMessage(nextValue);
    setInputValue("");
    isAtBottomRef.current = true;
    scrollToBottom();
  };

  useEffect(() => {
    async function loadCoupleSpace() {
      if (!token) {
        setCoupleSpace(null);
        return;
      }

      const response = await getCoupleSpace();
      setCoupleSpace(response.coupleSpace);
    }

    void loadCoupleSpace();
  }, [token]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const subscription = Keyboard.addListener(showEvent, () => {
      if (isAtBottomRef.current) {
        scrollToBottom();
        setTimeout(scrollToBottom, 120);
      }
    });

    return () => subscription.remove();
  }, []);

  return (

    <>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <Column flex={1} style={styles.content}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={
            Platform.OS === "ios" ? 0 : keyboardVerticalOffset + 12
          }
          style={styles.keyboardAvoidingView}
        >
          <BlurView intensity={28} tint="light" style={styles.threadCard}>
            <LinearGradient
              colors={["rgba(255,255,255,0.40)", "rgba(255,255,255,0.12)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.threadHighlight}
            />
            <ScrollView
              ref={scrollRef}
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => {
                if (isAtBottomRef.current) scrollToBottom();
              }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={[
                styles.list,
                messages.length === 0 && styles.emptyList,
              ]}
            >
              <View style={styles.dayMarker}>
                <Text style={styles.dayMarkerText}>Tonight</Text>
              </View>
              {messages.length === 0 ? (
                <Column center gap={12} style={styles.emptyState}>
                  <Text style={styles.emptyEyebrow}>First move</Text>
                  <Text style={styles.emptyTitle}>
                    {isBound ? "还没有消息" : "还没有绑定情侣"}
                  </Text>
                  <Text style={styles.emptyText}>
                    {isBound
                      ? "发一句话，让今天从这里开始。"
                      : "先去我的页面完成情侣绑定。"}
                  </Text>
                  <View style={styles.emptyPrompt}>
                    <Text style={styles.emptyPromptText}>
                      {"“今天最想立刻分享什么？”"}
                    </Text>
                  </View>
                </Column>
              ) : (
                messages.map((item) => {
                  const statusLabel = item.status ? getStatusText(item.status) : "";
                  const timeText = [
                    formatMessageTime(item.sentAt),
                    item.isSelf ? statusLabel : "",
                  ]
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <ChatListItem
                      key={item.id}
                      avatar={item.isSelf ? selfAvatar : partnerAvatar}
                      message={item.text}
                      time={timeText}
                      isSelf={item.isSelf}
                    />
                  );
                })
              )}
            </ScrollView>
          </BlurView>

          <View style={styles.inputWrap}>
            <ChatInput
              value={inputValue}
              disabled={!canSendMessage}
              onChangeText={setInputValue}
              onSend={handleSend}
            />
          </View>
        </KeyboardAvoidingView>
      </Column>
      </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 8,
  },
  glowTop: {
    position: "absolute",
    top: -80,
    right: -36,
    width: 228,
    height: 228,
    borderRadius: 114,
    backgroundColor: "rgba(255,255,255,0.56)",
  },
  glowBottom: {
    position: "absolute",
    left: -94,
    bottom: 128,
    width: 236,
    height: 236,
    borderRadius: 118,
    backgroundColor: "rgba(255,214,228,0.34)",
  },
  keyboardAvoidingView: { flex: 1 },
  threadCard: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    backgroundColor: "rgba(255,255,255,0.40)",
  },
  threadHighlight: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: 120,
  },
  scroll: { flex: 1 },
  list: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 18,
  },
  emptyList: { flexGrow: 1, justifyContent: "center" },
  dayMarker: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.60)",
  },
  dayMarkerText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
    color: "#8a7480",
  },
  emptyState: {
    marginHorizontal: 10,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.54)",
  },
  emptyEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    color: "#d1607d",
  },
  emptyTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: "#2d2028",
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    color: "#786873",
  },
  emptyPrompt: {
    width: "100%",
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: "#fff7fa",
  },
  emptyPromptText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: "#8d6b77",
  },
  inputWrap: { paddingTop: 12 },
});
