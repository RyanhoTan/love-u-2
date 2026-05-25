import { Text, TouchableOpacity, ViewStyle, StyleProp } from "react-native";

export function PinkButton({
  text,
  onPress,
  style,
}: {
  text: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          backgroundColor: "#ff496e",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 30,
          paddingVertical: 12,
        },
        style,
      ]}
    >
      <Text style={{ color: "#fff", fontSize: 16 }}>{text}</Text>
    </TouchableOpacity>
  );
}
