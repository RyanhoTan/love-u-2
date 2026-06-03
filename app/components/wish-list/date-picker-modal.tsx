import DatePicker from "react-native-date-picker";
import { Row } from "@/components/layout";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/styles/colors";

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
    backgroundColor: colors.semantic.overlay,
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: colors.semantic.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.semantic.divider,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.semantic.textPrimary,
  },
  cancelText: {
    fontSize: 16,
    color: colors.semantic.textMuted,
  },
  confirmText: {
    fontSize: 16,
    color: colors.theme.primary,
  },
  pickerWrapper: {
    alignItems: "center",
    paddingVertical: 16,
  },
});
