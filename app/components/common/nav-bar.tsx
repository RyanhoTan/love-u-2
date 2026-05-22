import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Row } from "../layout";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";

export function NavBar({
  title,
  rightContent,
}: {
  title?: string;
  rightContent?: React.ReactNode;
}) {
  const navigation = useNavigation();

  return (
    <Row
      items="center"
      content="center"
      style={{
        position: "relative",
        height: 48, // 显式声明高度，这样后面的组件就不会往上挤压占位
        width: "100%", // 确保占满横向屏幕
      }}
    >
      <TouchableOpacity
        style={{ position: "absolute", left: 0 }}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft width={32} height={32} />
      </TouchableOpacity>

      {title && (
        <Text style={{ textAlign: "center", fontSize: 20 }}>{title}</Text>
      )}

      {rightContent && (
        <View style={{ position: "absolute", right: 8 }}>{rightContent}</View>
      )}
    </Row>
  );
}
