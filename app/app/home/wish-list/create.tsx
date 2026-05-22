import { useState } from "react";
import { ChevronRight } from "lucide-react-native";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavBar, toast } from "@/components/common";
import { Column, Row } from "@/components/layout";
import { BudgetPickerModal } from "@/components/wish-list/budget-picker-modal";
import {
  CoverPicker,
  DatePickerModal,
  MapPickerModal,
} from "@/components/wish-list";
import { router } from "expo-router";

type SelectedLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

export default function CreateWishList() {
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [openMapPicker, setOpenMapPicker] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [text, setText] = useState("");
  const maxLength = 200;

  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const [budget, setBudget] = useState("");
  const [openBudgetPicker, setOpenBudgetPicker] = useState(false);

  const menus = [
    {
      label: "时间",
      value: date.toLocaleDateString(),
      onPress: () => setOpenDatePicker(true),
    },
    {
      label: "地点",
      value: selectedLocation ? selectedLocation.name : "选择地点",
      onPress: () => setOpenMapPicker(true),
    },
    {
      label: "预算",
      value: budget ? `¥${budget}` : "选择预算",
      onPress: () => setOpenBudgetPicker(true),
    },
  ];

  return (
    <SafeAreaView style={styles.page}>
      <NavBar
        title="创建愿望"
        rightContent={
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => router.push("/home/wish-list/invite")}
          >
            <Text style={styles.nextButtonText}>下一步</Text>
          </TouchableOpacity>
        }
      />

      <CoverPicker value={selectedImage} onChange={setSelectedImage} />

      <Column gap={8}>
        <Text style={styles.fieldLabel}>愿望标题</Text>
        <TextInput
          placeholder="输入愿望标题"
          style={[styles.wishInput, styles.titleInput]}
        />
      </Column>

      <Column gap={8}>
        <Text style={styles.fieldLabel}>愿望描述</Text>
        <View style={styles.descriptionContainer}>
          <TextInput
            placeholder="输入愿望描述"
            style={[styles.wishInput, styles.descriptionInput]}
            multiline
            maxLength={maxLength}
            onChangeText={setText}
            value={text}
          />
          <Text style={styles.counterText}>
            {text.length}/{maxLength}
          </Text>
        </View>
      </Column>

      {menus.map((item) => (
        <TouchableOpacity key={item.label} onPress={item.onPress}>
          <Row items="center" content="space-between">
            <Text style={styles.menuTitle}>{item.label}</Text>
            <Row items="center" gap={8}>
              <Text style={styles.menuValue}>{item.value}</Text>
              <ChevronRight color="#999999" />
            </Row>
          </Row>
        </TouchableOpacity>
      ))}

      <DatePickerModal
        visible={openDatePicker}
        value={date}
        onClose={() => setOpenDatePicker(false)}
        onChangeValue={setDate}
      />

      <MapPickerModal
        visible={openMapPicker}
        onClose={() => setOpenMapPicker(false)}
        onSelectLocation={(location) => {
          setSelectedLocation(location);
          toast.success(`地点选择成功：${location.name}`);
        }}
      />

      <BudgetPickerModal
        visible={openBudgetPicker}
        value={budget}
        onClose={() => setOpenBudgetPicker(false)}
        onChangeValue={setBudget}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  nextButton: {
    padding: 8,
    backgroundColor: "rgba(255, 77, 115, 0.12)",
    borderRadius: 16,
  },
  nextButtonText: {
    fontWeight: "bold",
    color: "#FF6B8B",
  },
  fieldLabel: {
    fontWeight: "bold",
  },
  wishInput: {
    borderRadius: 12,
    padding: 12,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  descriptionContainer: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    position: "relative",
  },
  descriptionInput: {
    textAlignVertical: "top",
    minHeight: 90,
    paddingBottom: 32,
  },
  counterText: {
    position: "absolute",
    right: 8,
    bottom: 4,
    fontSize: 12,
    color: "#999999",
  },
  menuTitle: {
    fontWeight: "bold",
  },
  menuValue: {
    color: "#999999",
  },
});
