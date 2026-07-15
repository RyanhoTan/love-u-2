import { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  CirclePlus,
  Keyboard as KeyboardIcon,
  Mic,
  Send,
  Smile,
} from "lucide-react-native";
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
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const canSend = value.trim().length > 0 && !disabled;
  const toggleVoiceMode = () => {
    Keyboard.dismiss();
    setIsVoiceMode((current) => !current);
  };

  return (
    <Row items="center" gap={10} style={styles.chatInputBar}>
      <TouchableOpacity onPress={toggleVoiceMode}>
        {isVoiceMode ? (
          <KeyboardIcon size={24} color="#333" />
        ) : (
          <Mic size={24} color="#333" />
        )}
      </TouchableOpacity>
      {isVoiceMode ? (
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={disabled}
          style={[styles.voiceInput, disabled && styles.voiceInputDisabled]}
        >
          <Mic size={18} color={disabled ? "#b8b8b8" : "#ff5675"} />
          <Text style={[styles.voiceText, disabled && styles.voiceTextDisabled]}>
            按住 说话
          </Text>
        </TouchableOpacity>
      ) : (
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
      )}
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
  voiceInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ffd2dc",
    backgroundColor: "#fff5f7",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  voiceInputDisabled: {
    borderColor: "#ececec",
    backgroundColor: "#f4f4f4",
  },
  voiceText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "600",
  },
  voiceTextDisabled: {
    color: "#b8b8b8",
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
