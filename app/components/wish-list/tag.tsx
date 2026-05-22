import { StyleSheet, Text, View } from "react-native";

export const WISH_TAG_CONFIG = {
  todo: { text: "想做", textColor: "#FF6B8B", bgColor: "#FFF1F4" },
  planning: { text: "计划中", textColor: "#F5A623", bgColor: "#FFF6E8" },
  doing: { text: "进行中", textColor: "#27AE60", bgColor: "#EEF9F1" },
  done: { text: "已完成", textColor: "#4A90E2", bgColor: "#EAF4FF" },
} as const;

export type WishTagStatus = keyof typeof WISH_TAG_CONFIG;

type TagProps = {
  status: WishTagStatus;
};

export function Tag({ status }: TagProps) {
  const config = WISH_TAG_CONFIG[status] || {
    text: "未知",
    textColor: "#9CA3AF",
    bgColor: "#F3F4F6",
  };

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <Text style={[styles.text, { color: config.textColor }]}>
        {config.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
  },
});
