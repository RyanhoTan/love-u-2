import DatePicker from "react-native-date-picker";
import { Row } from "@/components/layout";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type DatePickerModalProps = {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onChangeValue: (value: Date) => void;
};

export function DatePickerModal({
  visible,
  value,
  onClose,
  onChangeValue,
}: DatePickerModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.content} onStartShouldSetResponder={() => true}>
          <Row items="center" content="space-between" style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.title}>选择时间</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.confirmText}>确定</Text>
            </TouchableOpacity>
          </Row>

          <View style={styles.pickerWrapper}>
            <DatePicker
              date={value}
              locale="zh-Hans"
              mode="date"
              onDateChange={onChangeValue}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  cancelText: {
    fontSize: 16,
    color: "#999999",
  },
  confirmText: {
    fontSize: 16,
    color: "#FF6B8B",
  },
  pickerWrapper: {
    alignItems: "center",
    paddingVertical: 16,
  },
});
