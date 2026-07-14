import {
  Image,
  StyleSheet,
  Text,
  type ImageSourcePropType,
} from "react-native";
import { Column, Row } from "@/components/layout";

interface ChatListItemProps {
  avatar: ImageSourcePropType;
  message: string;
  time: string;
  isSelf?: boolean;
}

export function ChatListItem({
  avatar,
  message,
  time,
  isSelf = false,
}: ChatListItemProps) {
  return (
    <Row
      items="flex-end"
      gap={10}
      reverse={isSelf}
      style={{ alignSelf: isSelf ? "flex-end" : "flex-start", maxWidth: "88%" }}
    >
      <Image source={avatar} style={styles.avatar} />
      <Column
        gap={6}
        style={{
          backgroundColor: isSelf ? "#ff8da1" : "#ffffff",
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 18,
          alignItems: isSelf ? "flex-end" : "flex-start",
        }}
      >
        <Text style={[styles.message, isSelf && styles.selfMessage]}>
          {message}
        </Text>
        <Text style={[styles.time, isSelf && styles.selfTime]}>{time}</Text>
      </Column>
    </Row>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: "#2f2a2b",
  },
  selfMessage: {
    color: "#ffffff",
  },
  time: {
    fontSize: 11,
    color: "#8f8a8b",
  },
  selfTime: {
    color: "rgba(255,255,255,0.8)",
  },
});
