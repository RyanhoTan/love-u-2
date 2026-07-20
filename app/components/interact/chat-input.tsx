import { useState } from "react";
import { BlurView } from "expo-blur";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
    <BlurView intensity={34} tint="light" style={styles.shell}>
      <Row items="center" gap={10} style={styles.bar}>
        <TouchableOpacity activeOpacity={0.82} onPress={toggleVoiceMode}>
          <View style={styles.sideButton}>
            {isVoiceMode ? (
              <KeyboardIcon size={18} color="#564853" />
            ) : (
              <Mic size={18} color="#564853" />
            )}
          </View>
        </TouchableOpacity>

        {isVoiceMode ? (
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={disabled}
            style={[styles.voiceInput, disabled && styles.voiceInputDisabled]}
          >
            <Mic size={16} color={disabled ? "#baaeb4" : "#ff6f8f"} />
            <Text style={[styles.voiceText, disabled && styles.voiceTextDisabled]}>
              按住说话
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.textField, disabled && styles.textFieldDisabled]}>
            <TextInput
              placeholder="输入想说的话..."
              placeholderTextColor="#aa9aa2"
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
          </View>
        )}

        <TouchableOpacity activeOpacity={0.82} onPress={() => {}}>
          <View style={styles.sideButton}>
            <Smile size={18} color="#564853" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.82}
          disabled={!canSend}
          onPress={onSend}
        >
          <View
            style={[
              styles.sendButton,
              canSend ? styles.sendButtonActive : styles.sendButtonIdle,
            ]}
          >
            {canSend ? (
              <Send size={18} color="#ffffff" />
            ) : (
              <CirclePlus size={18} color="#564853" />
            )}
          </View>
        </TouchableOpacity>
      </Row>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: "hidden",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.74)",
    backgroundColor: "rgba(255,255,255,0.38)",
  },
  bar: {
    minHeight: 64,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sideButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.58)",
  },
  textField: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.78)",
  },
  textFieldDisabled: {
    backgroundColor: "rgba(245,241,243,0.88)",
  },
  chatInput: {
    color: "#352a30",
    fontSize: 15,
    paddingVertical: 0,
  },
  voiceInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff6f8",
  },
  voiceInputDisabled: {
    backgroundColor: "#f4eff1",
  },
  voiceText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#564853",
  },
  voiceTextDisabled: {
    color: "#baaeb4",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: "#ff6f8f",
  },
  sendButtonIdle: {
    backgroundColor: "rgba(255,255,255,0.58)",
  },
});
