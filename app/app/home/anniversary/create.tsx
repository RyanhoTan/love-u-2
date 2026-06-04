import { useState, type ComponentType } from "react";
import type { SvgProps } from "react-native-svg";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight } from "lucide-react-native";
import {
  IconsAnniversaryCakeSvg,
  IconsAnniversaryLetterLoveSvg,
} from "@/assets";
import { NavBar } from "@/components/common";
import { DatePickerModal } from "@/components/wish-list/date-picker-modal";
import { Column, Row } from "@/components/layout";
import { useStyledActionSheet } from "@/hooks/use-styled-action-sheet";
import { colors } from "@/styles/colors";

type CategoryItem = {
  id: string;
  label: string;
  Icon: ComponentType<SvgProps>;
};

type RemindItem = {
  key: string;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

const CATEGORIES: CategoryItem[] = [
  { id: "love", label: "恋爱", Icon: IconsAnniversaryLetterLoveSvg },
  { id: "birthday", label: "生日", Icon: IconsAnniversaryCakeSvg },
  { id: "holiday", label: "节日", Icon: IconsAnniversaryCakeSvg },
  { id: "custom", label: "自定义", Icon: IconsAnniversaryLetterLoveSvg },
];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export default function AnniversaryCreateScreen() {
  const { showStyledActionSheet } = useStyledActionSheet();
  const [selectedCategory, setSelectedCategory] = useState("love");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [repeatType, setRepeatType] = useState("每年");
  const [remind7, setRemind7] = useState(true);
  const [remind3, setRemind3] = useState(true);
  const [remindDay, setRemindDay] = useState(true);

  const remindOptions: RemindItem[] = [
    {
      key: "7-days",
      label: "提前 7 天提醒",
      value: remind7,
      onValueChange: setRemind7,
    },
    {
      key: "3-days",
      label: "提前 3 天提醒",
      value: remind3,
      onValueChange: setRemind3,
    },
    {
      key: "same-day",
      label: "当天提醒",
      value: remindDay,
      onValueChange: setRemindDay,
    },
  ];

  const openRepeatSelector = () => {
    showStyledActionSheet(
      {
        title: "选择重复方式",
        options: ["每年", "每月", "取消"],
        cancelButtonIndex: 2,
      },
      (selectedIndex?: number) => {
        if (selectedIndex === 0) {
          setRepeatType("每年");
        }

        if (selectedIndex === 1) {
          setRepeatType("每月");
        }
      },
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavBar
        title="新增纪念日"
        rightContent={
          <TouchableOpacity activeOpacity={0.85}>
            <Text style={styles.saveText}>保存</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Column gap={10}>
          <Text style={styles.sectionTitle}>名称</Text>
          <TextInput
            placeholder="例如：恋爱纪念日"
            placeholderTextColor="#C8C8C8"
            style={styles.input}
          />
        </Column>

        <Column gap={10}>
          <Text style={styles.sectionTitle}>日期</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.selector}
            onPress={() => setOpenDatePicker(true)}
          >
            <Text style={styles.selectorValue}>{formatDate(selectedDate)}</Text>
            <ChevronRight size={18} color="#C3C3C3" />
          </TouchableOpacity>
        </Column>

        <Column gap={10}>
          <Text style={styles.sectionTitle}>重复</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.selector}
            onPress={openRepeatSelector}
          >
            <Text style={styles.selectorValue}>{repeatType}</Text>
            <ChevronRight size={18} color="#C3C3C3" />
          </TouchableOpacity>
        </Column>

        <Column gap={10}>
          <Text style={styles.sectionTitle}>分类</Text>
          <Row gap={10}>
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              const Icon = category.Icon;

              return (
                <TouchableOpacity
                  key={category.id}
                  activeOpacity={0.85}
                  onPress={() => setSelectedCategory(category.id)}
                  style={[
                    styles.categoryCard,
                    isSelected && styles.categoryCardActive,
                  ]}
                >
                  <Icon width={49} height={49} />
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                </TouchableOpacity>
              );
            })}
          </Row>
        </Column>

        <Column gap={12}>
          <Text style={styles.sectionTitle}>提醒</Text>

          {remindOptions.map((option) => (
            <Row
              key={option.key}
              content="space-between"
              items="center"
              style={styles.remindRow}
            >
              <Text style={styles.remindText}>{option.label}</Text>
              <Switch
                value={option.value}
                onValueChange={option.onValueChange}
                trackColor={{
                  false: "#D9D9D9",
                  true: colors.theme.primaryBorder,
                }}
                thumbColor={option.value ? colors.theme.primary : "#F4F4F4"}
              />
            </Row>
          ))}
        </Column>
      </ScrollView>

      <DatePickerModal
        visible={openDatePicker}
        value={selectedDate}
        onClose={() => setOpenDatePicker(false)}
        onChangeValue={setSelectedDate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF2E68",
  },
  content: {
    paddingTop: 18,
    paddingBottom: 20,
    gap: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.semantic.textPrimary,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ECECEC",
    paddingHorizontal: 14,
    color: colors.semantic.textPrimary,
    backgroundColor: "#fff",
  },
  selector: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ECECEC",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  selectorValue: {
    color: colors.semantic.textPrimary,
    fontSize: 14,
  },
  categoryCard: {
    width: 74,
    height: 92,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECECEC",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
  },
  categoryCardActive: {
    borderColor: "#FF6B8B",
    backgroundColor: "#FFF5F8",
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.semantic.textPrimary,
  },
  remindRow: {
    paddingVertical: 2,
  },
  remindText: {
    fontSize: 15,
    color: colors.semantic.textPrimary,
  },
});
