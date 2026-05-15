import { Text, TouchableOpacity } from "react-native";

export function PinkButton({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#ff496e",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 30,
        paddingVertical: 12,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 16 }}>{text}</Text>
    </TouchableOpacity>
  );
}
