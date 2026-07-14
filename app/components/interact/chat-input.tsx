import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { CirclePlus, Mic, Smile } from "lucide-react-native";
import { Row } from "@/components/layout";

export function ChatInput() {
  return (
    <Row items="center" gap={10} style={styles.chatInputBar}>
      <TouchableOpacity onPress={() => {}}>
        <Mic size={24} color="#333" />
      </TouchableOpacity>
      <TextInput
        placeholder="输入消息..."
        placeholderTextColor="#9b9b9b"
        style={styles.chatInput}
      />
      <TouchableOpacity onPress={() => {}}>
        <Smile size={24} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {}}>
        <CirclePlus size={24} color="#333" />
      </TouchableOpacity>
    </Row>
  );
}

const styles = StyleSheet.create({
  chatInputBar: {
    height: 52,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 26,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  chatInput: {
    flex: 1,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#f4f4f4",
    color: "#333",
    fontSize: 15,
  },
});
