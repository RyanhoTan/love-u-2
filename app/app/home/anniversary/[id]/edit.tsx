import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  deleteAnniversary,
  getAnniversaries,
  updateAnniversary,
  type AnniversaryItem,
  type AnniversaryType,
  type CreateAnniversaryPayload,
} from "@/app/features/anniversary/api";
import { NavBar, toast } from "@/components/common";
import { DatePickerModal } from "@/components/wish-list/date-picker-modal";
import { Column } from "@/components/layout";
import { useStyledActionSheet } from "@/hooks/use-styled-action-sheet";
import { colors } from "@/styles/colors";

const CATEGORIES: { id: AnniversaryType; label: string }[] = [
  { id: "love", label: "恋爱" },
  { id: "birthday", label: "生日" },
  { id: "holiday", label: "节日" },
  { id: "custom", label: "自定义" },
];

const REMINDER_PRESETS = [0, 3, 7];

function parseLocalDate(dateText: string) {
  const [year, month, day] = dateText.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatApiDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date) {
  return formatApiDate(date).replaceAll("-", ".");
}

function categoryLabel(type: AnniversaryType) {
  return CATEGORIES.find((category) => category.id === type)?.label ?? "自定义";
}

function reminderLabel(days: number) {
  return days === 0 ? "当天" : `提前 ${days} 天`;
}

export default function EditAnniversaryScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const anniversaryId = Number(id);
  const { showStyledActionSheet } = useStyledActionSheet();
  const [item, setItem] = useState<AnniversaryItem | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<AnniversaryType>("custom");
  const [date, setDate] = useState<Date>(new Date());
  const [repeatType, setRepeatType] = useState<"none" | "yearly">("yearly");
  const [reminderDaysBefore, setReminderDaysBefore] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadAnniversary = useCallback(async () => {
    if (!Number.isInteger(anniversaryId) || anniversaryId <= 0) {
      setLoadError("纪念日不存在");
      setLoadState("error");
      return;
    }

    try {
      setLoadState("loading");
      setLoadError("");
      const response = await getAnniversaries();
      const found = response.anniversaries.find(
        (anniversary) => anniversary.id === anniversaryId,
      );
      if (!found) {
        throw new Error("纪念日不存在或已不可访问");
      }

      setItem(found);
      setTitle(found.title);
      setType(found.type);
      setDate(parseLocalDate(found.originalDate));
      setRepeatType(found.repeatType);
      setReminderDaysBefore(found.reminderDaysBefore);
      setLoadState("ready");
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "加载纪念日失败，请重试",
      );
      setLoadState("error");
    }
  }, [anniversaryId]);

  useEffect(() => {
    void loadAnniversary();
  }, [loadAnniversary]);

  const openCategoryPicker = () => {
    const options = [...CATEGORIES.map((category) => category.label), "取消"];
    showStyledActionSheet(
      {
        title: "选择分类",
        options,
        cancelButtonIndex: options.length - 1,
      },
      (selectedIndex) => {
        if (selectedIndex !== undefined && selectedIndex < CATEGORIES.length) {
          setType(CATEGORIES[selectedIndex].id);
          setActionError("");
        }
      },
    );
  };

  const openRepeatPicker = () => {
    showStyledActionSheet(
      {
        title: "选择重复方式",
        options: ["每年", "不重复", "取消"],
        cancelButtonIndex: 2,
      },
      (selectedIndex) => {
        if (selectedIndex === 0) {
          setRepeatType("yearly");
          setActionError("");
        } else if (selectedIndex === 1) {
          setRepeatType("none");
          setActionError("");
        }
      },
    );
  };

  const openReminderPicker = () => {
    const reminderOptions = REMINDER_PRESETS.includes(reminderDaysBefore)
      ? REMINDER_PRESETS
      : [...REMINDER_PRESETS, reminderDaysBefore];
    const options = [
      ...reminderOptions.map((days) =>
        days === 0 ? "当天" : `提前 ${days} 天`,
      ),
      "取消",
    ];
    showStyledActionSheet(
      {
        title: "选择提醒计划",
        message: "当前不会发送通知",
        options,
        cancelButtonIndex: options.length - 1,
      },
      (selectedIndex) => {
        if (
          selectedIndex === undefined ||
          selectedIndex >= reminderOptions.length
        ) {
          return;
        }
        setReminderDaysBefore(reminderOptions[selectedIndex]);
        setActionError("");
      },
    );
  };

  async function handleSave() {
    const trimmedTitle = title.trim();
    if (!item || saving || deleting || !trimmedTitle) {
      return;
    }

    const payload: CreateAnniversaryPayload = {
      title: trimmedTitle,
      type,
      originalDate: formatApiDate(date),
      repeatType,
      reminderDaysBefore,
    };

    try {
      setSaving(true);
      setActionError("");
      await updateAnniversary(item.id, payload);
      toast.success("纪念日已更新");
      router.back();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "保存纪念日失败");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (!item || saving || deleting) {
      return;
    }

    Alert.alert(
      "删除纪念日",
      `确定删除“${item.title}”吗？当前没有恢复入口。`,
      [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: () => void handleDelete(),
        },
      ],
    );
  }

  async function handleDelete() {
    if (!item || saving || deleting) {
      return;
    }

    try {
      setDeleting(true);
      setActionError("");
      await deleteAnniversary(item.id);
      toast.success("纪念日已删除");
      router.back();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "删除纪念日失败");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavBar title="编辑纪念日" />

      {loadState === "loading" ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.theme.primary} />
          <Text style={styles.mutedText}>正在加载纪念日…</Text>
        </View>
      ) : loadState === "error" ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{loadError}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => void loadAnniversary()}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>重新加载</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Column gap={10}>
              <Text style={styles.label}>名称</Text>
              <TextInput
                accessibilityLabel="纪念日名称"
                value={title}
                onChangeText={(value) => {
                  setTitle(value);
                  setActionError("");
                }}
                placeholder="例如：恋爱纪念日"
                placeholderTextColor={colors.semantic.textMuted}
                maxLength={100}
                editable={!saving && !deleting}
                style={styles.input}
              />
              {!title.trim() ? (
                <Text style={styles.errorText}>请输入纪念日名称</Text>
              ) : null}
            </Column>

            <Column gap={10}>
              <Text style={styles.label}>日期</Text>
              <Selector
                label={formatDisplayDate(date)}
                disabled={saving || deleting}
                onPress={() => setShowDatePicker(true)}
              />
            </Column>

            <Column gap={10}>
              <Text style={styles.label}>分类</Text>
              <Selector
                label={categoryLabel(type)}
                disabled={saving || deleting}
                onPress={openCategoryPicker}
              />
            </Column>

            <Column gap={10}>
              <Text style={styles.label}>重复</Text>
              <Selector
                label={repeatType === "yearly" ? "每年" : "不重复"}
                disabled={saving || deleting}
                onPress={openRepeatPicker}
              />
            </Column>

            <Column gap={10}>
              <Text style={styles.label}>提醒时间计划</Text>
              <Selector
                label={reminderLabel(reminderDaysBefore)}
                disabled={saving || deleting}
                onPress={openReminderPicker}
              />
              <Text style={styles.mutedText}>
                仅保存计划时间；通知功能尚未上线，当前不会发送提醒。
              </Text>
            </Column>

            {actionError ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {actionError}
              </Text>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              accessibilityRole="button"
              disabled={saving || deleting || !title.trim()}
              onPress={() => void handleSave()}
              style={[styles.primaryButton, (saving || deleting) && styles.disabledButton]}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? "保存中…" : "保存修改"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              disabled={saving || deleting}
              onPress={confirmDelete}
              style={styles.dangerButton}
            >
              <Text style={styles.dangerButtonText}>
                {deleting ? "删除中…" : "删除纪念日"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <DatePickerModal
        visible={showDatePicker}
        value={date}
        onClose={() => setShowDatePicker(false)}
        onChangeValue={setDate}
      />
    </SafeAreaView>
  );
}

function Selector({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={[styles.selector, disabled && styles.disabledButton]}
    >
      <Text style={styles.selectorText}>{label}</Text>
      <Text style={styles.selectorHint}>更改</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.semantic.surface,
    paddingHorizontal: 16,
  },
  content: {
    flexGrow: 1,
    gap: 18,
    paddingTop: 20,
    paddingBottom: 24,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.semantic.textPrimary,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.semantic.border,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    color: colors.semantic.textPrimary,
    fontSize: 15,
  },
  selector: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.semantic.border,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.semantic.textPrimary,
  },
  selectorHint: {
    fontSize: 13,
    color: colors.semantic.textSecondary,
  },
  mutedText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.semantic.textSecondary,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#C6284D",
  },
  actions: {
    gap: 10,
    paddingTop: 12,
    paddingBottom: 12,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: colors.theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.semantic.textInverse,
  },
  secondaryButton: {
    borderRadius: 20,
    backgroundColor: colors.theme.primaryTint,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.semantic.textPrimary,
  },
  dangerButton: {
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#F0CCD5",
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C6284D",
  },
  disabledButton: {
    opacity: 0.55,
  },
});
