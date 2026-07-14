import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ellipsis } from "lucide-react-native";
import { ImagesAvatarFemalePng, ImagesAvatarMalePng } from "@/assets";
import { ChatListItem } from "@/components/interact";
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

export default function Interact() {
  return (
    <Column flex={1} style={styles.page}>
      <Row content="space-between" items="center">
        <TouchableOpacity>
          <Text style={styles.title}>聊天</Text>
        </TouchableOpacity>
        <Ellipsis />
      </Row>
      <ScrollView
        showsVerticalScrollIndicator={false}
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
  list: {
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
});
