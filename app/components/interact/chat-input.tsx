import { useEffect, useRef, useState } from "react";
import { BlurView } from "expo-blur";
import {
  Animated,
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
  const [isRecording, setIsRecording] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const barHeights = useRef([
    new Animated.Value(0.4),
    new Animated.Value(0.75),
    new Animated.Value(0.55),
  ]).current;
  const canSend = value.trim().length > 0 && !disabled;

  const toggleVoiceMode = () => {
    Keyboard.dismiss();
    setIsVoiceMode((current) => !current);
    setIsRecording(false);
  };

  useEffect(() => {
    if (!isRecording) {
      pulse.stopAnimation();
      barHeights.forEach((bar) => bar.stopAnimation());
      pulse.setValue(0);
      barHeights[0].setValue(0.4);
      barHeights[1].setValue(0.75);
      barHeights[2].setValue(0.55);
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    const barLoops = barHeights.map((bar, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: [0.82, 0.58, 0.9][index],
            duration: 320 + index * 80,
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: [0.36, 0.92, 0.42][index],
            duration: 420 + index * 90,
            useNativeDriver: true,
          }),
        ])
      )
    );

    pulseLoop.start();
    barLoops.forEach((loop) => loop.start());

    return () => {
      pulseLoop.stop();
      barLoops.forEach((loop) => loop.stop());
    };
  }, [barHeights, isRecording, pulse]);

  if (isVoiceMode) {
    return (
      <BlurView intensity={34} tint="light" style={styles.shell}>
        <TouchableOpacity
          activeOpacity={1}
          disabled={disabled}
          onPressIn={() => setIsRecording(true)}
          onPressOut={() => setIsRecording(false)}
          style={styles.voiceModeSurface}
        >
          {isRecording ? (
            <Row items="center" gap={10} style={styles.bar}>
             
              <View style={styles.recordingScrim} />
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.recordingCard,
                  {
                    opacity: pulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.88, 1],
                    }),
                    transform: [
                      {
                        scale: pulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.985, 1.02],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.recordingTop}>
                  <Animated.View
                    style={[
                      styles.recordingDot,
                      {
                        transform: [
                          {
                            scale: pulse.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.9, 1.12],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                  <Text style={styles.recordingTitle}>正在录音</Text>
                </View>
                <View style={styles.recordingBars}>
                  {barHeights.map((bar, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.recordingBar,
                        {
                          transform: [{ scaleY: bar }],
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.recordingHint}>松开发送</Text>
              </Animated.View>
             
            </Row>
          ) : (
            <Row items="center" gap={10} style={styles.bar}>
              <TouchableOpacity activeOpacity={0.82} onPress={toggleVoiceMode}>
                <View style={styles.sideButton}>
                  <KeyboardIcon size={18} color="#564853" />
                </View>
              </TouchableOpacity>

              <View style={[styles.voiceInput, disabled && styles.voiceInputDisabled]}>
                <View style={styles.recordIndicator}>
                  <Mic size={16} color={disabled ? "#baaeb4" : "#ff6f8f"} />
                </View>
                <Text style={[styles.voiceText, disabled && styles.voiceTextDisabled]}>
                  按住说话
                </Text>
              </View>

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
          )}
        </TouchableOpacity>
      </BlurView>
    );
  }

  return (
    <BlurView intensity={34} tint="light" style={styles.shell}>
      <Row items="center" gap={10} style={styles.bar}>
        <TouchableOpacity activeOpacity={0.82} onPress={toggleVoiceMode}>
          <View style={styles.sideButton}>
            <Mic size={18} color="#564853" />
          </View>
        </TouchableOpacity>

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
    position: "relative",
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
  voiceModeSurface: {
    height: 64,
    justifyContent: "center",
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
  recordIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,111,143,0.14)",
  },
  recordingScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(32,22,28,0.14)",
  },
  recordingCard: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.46)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.56)",
    shadowColor: "#20161c",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
  },
  recordingTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recordingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ff6f8f",
  },
  recordingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#352a30",
  },
  recordingBars: {
    width: 28,
    height: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  recordingBar: {
    width: 4,
    height: 14,
    borderRadius: 999,
    backgroundColor: "#ff6f8f",
  },
  recordingHint: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7d6872",
    letterSpacing: 0.2,
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
