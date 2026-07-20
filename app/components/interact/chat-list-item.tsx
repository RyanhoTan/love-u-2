import { Image, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
    <Column
      gap={6}
      style={[styles.wrapper, isSelf ? styles.selfWrapper : styles.otherWrapper]}
    >
      <Row items="flex-end" gap={10} reverse={isSelf}>
        <Image source={avatar} style={styles.avatar} />
        {isSelf ? (
          <LinearGradient
            colors={["#ff8ca5", "#ff6a8d"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.selfBubble]}
          >
            <Text style={[styles.message, styles.selfMessage]}>{message}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.otherBubble]}>
            <Text style={styles.message}>{message}</Text>
          </View>
        )}
      </Row>
      <Text style={[styles.time, isSelf ? styles.selfTime : styles.otherTime]}>
        {time}
      </Text>
    </Column>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    maxWidth: "88%",
  },
  selfWrapper: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  otherWrapper: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.88)",
  },
  bubble: {
    maxWidth: "84%",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 24,
  },
  selfBubble: {
    borderBottomRightRadius: 8,
  },
  otherBubble: {
    borderBottomLeftRadius: 8,
    backgroundColor: "rgba(255,255,255,0.74)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.84)",
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: "#2f252b",
  },
  selfMessage: {
    color: "#ffffff",
  },
  time: {
    fontSize: 11,
    lineHeight: 14,
  },
  selfTime: {
    color: "#9f7a88",
    textAlign: "right",
    paddingRight: 46,
  },
  otherTime: {
    color: "#9f7a88",
    paddingLeft: 46,
  },
});
