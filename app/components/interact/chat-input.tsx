import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { CirclePlus, Mic, Send, Smile } from "lucide-react-native";
import { Row } from "@/components/layout";

interface ChatInputProps {
  value: string;
  disabled?: boolean;
  onChangeText: (value: string) => void;
  onSend: () => void;
}

export function ChatInput({
  value,
  disabled = false,
  onChangeText,
  onSend,
}: ChatInputProps) {
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <Row items="center" gap={10} style={styles.chatInputBar}>
      <TouchableOpacity onPress={() => {}}>
        <Mic size={24} color="#333" />
      </TouchableOpacity>
      <TextInput
        placeholder="输入消息..."
        placeholderTextColor="#9b9b9b"
        style={styles.chatInput}
        value={value}
        editable={!disabled}
        returnKeyType="send"
        onChangeText={onChangeText}
        onSubmitEditing={() => {
          if (canSend) {
            onSend();
          }
        }}
      />
      <TouchableOpacity onPress={() => {}}>
        <Smile size={24} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity
        disabled={!canSend}
        onPress={onSend}
        style={[
          // styles.sendButton, 
          !canSend && styles.sendButtonDisabled]}
      >
        {canSend ? (
          <Send size={24} color="#ff5675" />
        ) : (
          <CirclePlus size={24} color="#333" />
        )}
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
  // sendButton: {
  //   width: 32,
  //   height: 32,
  //   borderRadius: 16,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   backgroundColor: "#ff5675",
  // },
  sendButtonDisabled: {
    backgroundColor: "transparent",
  },
});
