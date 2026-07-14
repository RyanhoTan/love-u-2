import { useEffect, useRef } from "react";
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
} from "react-native";
import { Ellipsis } from "lucide-react-native";
import { ImagesAvatarFemalePng, ImagesAvatarMalePng } from "@/assets";
import {
  ChatInput,
  ChatListItem,
  useChatInputKeyboardOffset,
} from "@/components/interact";
import { Column, Row } from "@/components/layout";

const chatList = [
  {
    id: "1",
    avatar: ImagesAvatarFemalePng,
    message: "今天下班早一点吗，我想和你多聊一会。",
    time: "19:20",
    isSelf: false,
  },
  {
    id: "2",
    avatar: ImagesAvatarMalePng,
    message: "会早一点，忙完就来找你。",
    time: "19:21",
    isSelf: true,
  },
  {
    id: "3",
    avatar: ImagesAvatarFemalePng,
    message: "那我等你，想听你讲讲今天发生了什么。",
    time: "19:22",
    isSelf: false,
  },
  {
    id: "5",
    avatar: ImagesAvatarMalePng,
    message: "好呀，见到你就慢慢说。",
    time: "19:23",
    isSelf: true,
  },
  {
    id: "6",
    avatar: ImagesAvatarMalePng,
    message: "好呀，见到你就慢慢说。",
    time: "19:23",
    isSelf: true,
  },
  {
    id: "7",
    avatar: ImagesAvatarMalePng,
    message: "好呀，见到你就慢慢说。",
    time: "19:23",
    isSelf: true,
  },
  {
    id: "8",
    avatar: ImagesAvatarMalePng,
    message: "好呀，见到你就慢慢说。",
    time: "19:23",
    isSelf: true,
  },
  {
    id: "9",
    avatar: ImagesAvatarMalePng,
    message: "好呀，见到你就慢慢说。",
    time: "19:23",
    isSelf: true,
  },
  {
    id: "10",
    avatar: ImagesAvatarMalePng,
    message: "好呀，见到你就慢慢说。",
    time: "19:23",
    isSelf: true,
  },
  {
    id: "11",
    avatar: ImagesAvatarMalePng,
    message: "好呀，见到你就慢慢说。",
    time: "19:23",
    isSelf: true,
  },
];

const BOTTOM_THRESHOLD = 20;

export default function Interact() {
  const keyboardVerticalOffset = useChatInputKeyboardOffset();
  const scrollRef = useRef<ScrollView>(null);
  const isAtBottomRef = useRef(true);

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
          <Text style={styles.title}>聊天</Text>
        </TouchableOpacity>
        <Ellipsis />
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
          contentContainerStyle={styles.list}
        >
          {chatList.map((item) => (
            <ChatListItem
              key={item.id}
              avatar={item.avatar}
              message={item.message}
              time={item.time}
              isSelf={item.isSelf}
            />
          ))}
        </ScrollView>
        <ChatInput />
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
});
