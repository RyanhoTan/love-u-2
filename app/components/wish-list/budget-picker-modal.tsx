import { Row } from "@/components/layout";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type BudgetPickerModalProps = {
  visible: boolean;
  value: string;
  onClose: () => void;
  onChangeValue: (value: string) => void;
};

export function BudgetPickerModal({
  visible,
  value,
  onClose,
  onChangeValue,
}: BudgetPickerModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardWrapper}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={onClose}
            >
              <View
                style={styles.content}
                onStartShouldSetResponder={() => true}
              >
                <Row
                  items="center"
                  content="space-between"
                  style={styles.header}
                >
                  <Text style={styles.title}>设置预算金额</Text>
                  <TouchableOpacity onPress={onClose}>
                    <Text style={styles.confirmText}>确定</Text>
                  </TouchableOpacity>
                </Row>

                <View style={styles.inputWrapper}>
                  <Text style={styles.currency}>¥</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="0"
                    value={value}
                    maxLength={8}
                    autoFocus
                    onChangeText={(text) =>
                      onChangeValue(text.replace(/[^0-9]/g, ""))
                    }
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    gap: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  header: {
    width: "100%",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmText: {
    color: "#FF6B8B",
    fontWeight: "bold",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#FF6B8B",
    width: "100%",
    paddingBottom: 8,
  },
  currency: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6B8B",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C1C1E",
    padding: 0,
  },
});
