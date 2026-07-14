import { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  type ImageSourcePropType,
} from "react-native";
import { Ellipsis } from "lucide-react-native";
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
import { Column, Row } from "@/components/layout";

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
  if (status === "sending") {
    return "发送中";
  }

  if (status === "partner_offline") {
    return "对方离线";
  }

  if (status === "failed") {
    return "发送失败";
  }

  return "";
}

export default function Interact() {
  const keyboardVerticalOffset = useChatInputKeyboardOffset();
  const { token, user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const isAtBottomRef = useRef(true);
  const [inputValue, setInputValue] = useState("");
  const [coupleSpace, setCoupleSpace] = useState<CoupleSpace | null>(null);
  const [isLoadingCoupleSpace, setIsLoadingCoupleSpace] = useState(false);
  const { messages, status, errorMessage, isConnected, sendMessage } =
    usePartnerChat(token);

  const isBound = Boolean(coupleSpace?.isBound && coupleSpace.partner);
  const canSendMessage = isBound && isConnected;

  const selfAvatar: ImageSourcePropType = user?.avatar
    ? { uri: user.avatar }
    : ImagesAvatarMalePng;
  const partnerAvatar: ImageSourcePropType = coupleSpace?.partner?.avatar
    ? { uri: coupleSpace.partner.avatar }
    : ImagesAvatarFemalePng;

  const statusText = useMemo(() => {
    if (isLoadingCoupleSpace) {
      return "正在加载情侣空间...";
    }

    if (!token) {
      return "请先登录";
    }

    if (!isBound) {
      return "绑定情侣后开始聊天";
    }

    if (status === "connecting") {
      return "正在连接...";
    }

    if (status === "connected") {
      return coupleSpace?.partner?.nickname || coupleSpace?.partner?.username || "已连接";
    }

    if (errorMessage) {
      return errorMessage;
    }

    return "聊天连接已断开";
  }, [
    coupleSpace?.partner?.nickname,
    coupleSpace?.partner?.username,
    errorMessage,
    isBound,
    isLoadingCoupleSpace,
    status,
    token,
  ]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - layoutMeasurement.height - contentOffset.y;
    const nextIsAtBottom = distanceFromBottom <= BOTTOM_THRESHOLD;

    isAtBottomRef.current = nextIsAtBottom;
  };

  const handleSend = () => {
    const nextValue = inputValue.trim();
    if (!nextValue || !canSendMessage) {
      return;
    }

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

      try {
        setIsLoadingCoupleSpace(true);
        const response = await getCoupleSpace();
        setCoupleSpace(response.coupleSpace);
      } catch {
        setCoupleSpace(null);
      } finally {
        setIsLoadingCoupleSpace(false);
      }
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

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Column flex={1} style={styles.page}>
      <Row content="space-between" items="center">
        <TouchableOpacity>
          <Column gap={4}>
            <Text style={styles.title}>聊天</Text>
            <Text style={styles.status}>{statusText}</Text>
          </Column>
        </TouchableOpacity>
        <Ellipsis color="#333" />
      </Row>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? 0 : keyboardVerticalOffset
        }
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            if (isAtBottomRef.current) {
              scrollToBottom();
            }
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.list,
            messages.length === 0 && styles.emptyList,
          ]}
        >
          {messages.length === 0 ? (
            <Column center gap={8} style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {isBound ? "还没有消息" : "还没有绑定情侣"}
              </Text>
              <Text style={styles.emptyText}>
                {isBound ? "发一句话，让今天从这里开始。" : "先去我的页面完成情侣绑定。"}
              </Text>
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
        <ChatInput
          value={inputValue}
          disabled={!canSendMessage}
          onChangeText={setInputValue}
          onSend={handleSend}
        />
      </KeyboardAvoidingView>
    </Column>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2f2a2b",
  },
  status: {
    fontSize: 12,
    color: "#8f8a8b",
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scroll: {
    flex: 1,
  },
  list: {
    paddingTop: 20,
    paddingBottom: 16,
    gap: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyState: {
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2f2a2b",
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#8f8a8b",
    textAlign: "center",
  },
});
