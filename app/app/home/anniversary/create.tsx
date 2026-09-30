import { useState, type ComponentType } from "react";
import type { SvgProps } from "react-native-svg";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import {
  IconsAnniversaryCakeSvg,
  IconsAnniversaryLetterLoveSvg,
} from "@/assets";
import {
  createAnniversary,
  type AnniversaryType,
  type AnniversaryRepeatType,
} from "@/app/features/anniversary/api";
import { NavBar, toast } from "@/components/common";
import { DatePickerModal } from "@/components/wish-list/date-picker-modal";
import { Column, Row } from "@/components/layout";
import { useStyledActionSheet } from "@/hooks/use-styled-action-sheet";
import { colors } from "@/styles/colors";

type CategoryItem = {
  id: AnniversaryType;
  label: string;
  Icon: ComponentType<SvgProps>;
};

const CATEGORIES: CategoryItem[] = [
  { id: "love", label: "恋爱", Icon: IconsAnniversaryLetterLoveSvg },
  { id: "birthday", label: "生日", Icon: IconsAnniversaryCakeSvg },
  { id: "holiday", label: "节日", Icon: IconsAnniversaryCakeSvg },
  { id: "custom", label: "自定义", Icon: IconsAnniversaryLetterLoveSvg },
];

const REMINDER_OPTIONS = [
  { days: 0, label: "当天" },
  { days: 3, label: "提前 3 天" },
  { days: 7, label: "提前 7 天" },
];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function formatApiDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function reminderLabel(days: number) {
  return days === 0 ? "当天" : `提前 ${days} 天`;
}

export default function AnniversaryCreateScreen() {
  const router = useRouter();
  const { showStyledActionSheet } = useStyledActionSheet();
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<AnniversaryType>("love");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [repeatType, setRepeatType] = useState<AnniversaryRepeatType>("yearly");
  const [reminderDaysBefore, setReminderDaysBefore] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openRepeatSelector = () => {
    showStyledActionSheet(
      {
        title: "选择重复方式",
        options: ["每年", "不重复", "取消"],
        cancelButtonIndex: 2,
      },
      (selectedIndex?: number) => {
        if (selectedIndex === 0) {
          setRepeatType("yearly");
        }

        if (selectedIndex === 1) {
          setRepeatType("none");
        }
      },
    );
  };

  const openReminderSelector = () => {
    const options = [...REMINDER_OPTIONS.map((option) => option.label), "取消"];
    showStyledActionSheet(
      {
        title: "选择提醒计划",
        message: "每个纪念日仅保存一个计划；当前不会发送通知",
        options,
        cancelButtonIndex: options.length - 1,
      },
      (selectedIndex) => {
        const option =
          selectedIndex === undefined
            ? undefined
            : REMINDER_OPTIONS[selectedIndex];
        if (option) {
          setReminderDaysBefore(option.days);
        }
      },
    );
  };

  const repeatLabel = repeatType === "yearly" ? "每年" : "不重复";

  const handleSave = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      toast.error("请输入纪念日名称");
      return;
    }

    try {
      setIsSubmitting(true);
      await createAnniversary({
        title: trimmedTitle,
        type: selectedCategory,
        originalDate: formatApiDate(selectedDate),
        repeatType,
        reminderDaysBefore,
      });
      toast.success("纪念日已保存");
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存纪念日失败";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavBar
        title="新增纪念日"
        rightContent={
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => void handleSave()}
          >
            <Text style={styles.saveText}>
              {isSubmitting ? "保存中..." : "保存"}
            </Text>
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
            value={title}
            onChangeText={setTitle}
            editable={!isSubmitting}
          />
        </Column>

        <Column gap={10}>
          <Text style={styles.sectionTitle}>日期</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.selector}
            onPress={() => setOpenDatePicker(true)}
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          >
            <Text style={styles.selectorValue}>{repeatLabel}</Text>
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
                  disabled={isSubmitting}
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
          <Text style={styles.sectionTitle}>提醒时间计划</Text>
          <Text style={styles.reminderNotice}>
            仅保存计划时间；通知功能尚未上线，当前不会发送提醒。
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.selector}
            onPress={openReminderSelector}
            disabled={isSubmitting}
          >
            <Text style={styles.selectorValue}>
              {reminderLabel(reminderDaysBefore)}
            </Text>
            <ChevronRight size={18} color="#C3C3C3" />
          </TouchableOpacity>
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
  reminderNotice: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.semantic.textSecondary,
  },
});
