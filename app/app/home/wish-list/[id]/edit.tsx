import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { DatePickerModal } from "@/components/wish-list/date-picker-modal";
import {
  getWishById,
  updateWish,
  type WishItem,
} from "@/app/features/wish-list/api";
import { formatLocalDateOnly } from "@/app/features/wish-list/date";
import { NavBar, toast } from "@/components/common";

const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_TITLE_LENGTH = 100;
const MAX_BUDGET_AMOUNT = 2_147_483_647;

function parseLocalDate(dateText: string) {
  const [year, month, day] = dateText.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDisplayDate(date: Date) {
  return formatLocalDateOnly(date).replaceAll("-", ".");
}

function parseBudgetAmount(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (!/^\d+$/.test(trimmed)) {
    return undefined;
  }

  const amount = Number(trimmed);
  return Number.isSafeInteger(amount) && amount <= MAX_BUDGET_AMOUNT
    ? amount
    : undefined;
}

export default function EditWish() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const wishId = Number(id);
  const [wish, setWish] = useState<WishItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [targetDate, setTargetDate] = useState(new Date());
  const [budgetText, setBudgetText] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const normalizedTitle = title.trim();
  const normalizedLocationName = locationName.trim();
  const budgetAmount = parseBudgetAmount(budgetText);
  const isBudgetValid = budgetAmount !== undefined;
  const hasChanges =
    wish !== null &&
    (normalizedTitle !== wish.title ||
      description !== wish.description ||
      formatLocalDateOnly(targetDate) !== wish.targetDate ||
      normalizedLocationName !== wish.locationName ||
      (isBudgetValid && budgetAmount !== wish.budgetAmount));

  const loadWish = useCallback(async () => {
    if (!Number.isInteger(wishId) || wishId <= 0) {
      setLoadError("心愿不存在");
      setLoadState("error");
      return;
    }

    try {
      setLoadState("loading");
      setLoadError("");
      const response = await getWishById(wishId);
      setWish(response.wish);
      setTitle(response.wish.title);
      setDescription(response.wish.description);
      setLocationName(response.wish.locationName);
      setTargetDate(parseLocalDate(response.wish.targetDate));
      setBudgetText(response.wish.budgetAmount?.toString() ?? "");
      setLoadState("ready");
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "加载心愿失败，请重试",
      );
      setLoadState("error");
    }
  }, [wishId]);

  useEffect(() => {
    void loadWish();
  }, [loadWish]);

  async function handleSave() {
    if (
      !wish ||
      saving ||
      normalizedTitle.length === 0 ||
      !isBudgetValid ||
      !hasChanges
    ) {
      return;
    }

    const titleChanged = normalizedTitle !== wish.title;
    const descriptionChanged = description !== wish.description;
    const targetDateChanged = formatLocalDateOnly(targetDate) !== wish.targetDate;
    const locationChanged = normalizedLocationName !== wish.locationName;
    const budgetChanged = budgetAmount !== wish.budgetAmount;
    const payload: {
      title?: string;
      description?: string;
      targetDate?: string;
      budgetAmount?: number | null;
      locationName?: string;
    } = {};
    if (titleChanged) payload.title = normalizedTitle;
    if (descriptionChanged) payload.description = description.trim();
    if (targetDateChanged) payload.targetDate = formatLocalDateOnly(targetDate);
    if (budgetChanged) payload.budgetAmount = budgetAmount;
    if (locationChanged) payload.locationName = normalizedLocationName;

    try {
      setSaving(true);
      setSaveError("");
      await updateWish(wish.id, payload);
      toast.success("心愿保存成功");
      router.back();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "保存失败，请稍后重试",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.page}>
      <NavBar title="编辑心愿" />

      {loadState === "loading" ? (
        <View style={styles.centerState}>
          <ActivityIndicator color="#FF4F7A" />
          <Text style={styles.mutedText}>正在加载心愿…</Text>
        </View>
      ) : loadState === "error" ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{loadError}</Text>
          <TouchableOpacity
            onPress={() => void loadWish()}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>重新加载</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>标题</Text>
            <TextInput
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                setSaveError("");
              }}
              placeholder="写下你们想一起做的事"
              placeholderTextColor="#C3B8BE"
              maxLength={MAX_TITLE_LENGTH}
              editable={!saving}
              accessibilityLabel="心愿标题"
              style={styles.titleInput}
            />
            <Text style={styles.counter}>
              {title.length}/{MAX_TITLE_LENGTH}
            </Text>
            {normalizedTitle.length === 0 ? (
              <Text style={styles.errorText}>标题不能为空</Text>
            ) : null}

            <Text style={styles.label}>描述</Text>
            <TextInput
              value={description}
              onChangeText={(value) => {
                setDescription(value);
                setSaveError("");
              }}
              placeholder="写下你们想一起做这件事的理由"
              placeholderTextColor="#C3B8BE"
              maxLength={MAX_DESCRIPTION_LENGTH}
              multiline
              textAlignVertical="top"
              editable={!saving}
              style={styles.input}
            />
            <Text style={styles.counter}>
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </Text>

            <Text style={styles.label}>目标日期</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`目标日期，${formatDisplayDate(targetDate)}`}
              disabled={saving}
              onPress={() => setShowDatePicker(true)}
              style={styles.dateSelector}
            >
              <Text style={styles.dateText}>{formatDisplayDate(targetDate)}</Text>
              <Text style={styles.dateHint}>点击修改</Text>
            </TouchableOpacity>
            <Text style={styles.label}>预算</Text>
            <View style={styles.budgetField}>
              <Text style={styles.budgetCurrency}>¥</Text>
              <TextInput
                accessibilityLabel="心愿预算"
                value={budgetText}
                onChangeText={(value) => {
                  setBudgetText(value);
                  setSaveError("");
                }}
                placeholder="未设置，留空可清除"
                placeholderTextColor="#C3B8BE"
                keyboardType="number-pad"
                maxLength={10}
                editable={!saving}
                style={styles.budgetInput}
              />
            </View>
            {!isBudgetValid ? (
              <Text style={styles.errorText}>预算须为 0–2,147,483,647 的整数</Text>
            ) : null}
            <Text style={styles.label}>地点名称</Text>
            <TextInput
              accessibilityLabel="心愿地点名称"
              value={locationName}
              onChangeText={(value) => {
                setLocationName(value);
                setSaveError("");
              }}
              placeholder="例如：想去的餐厅或城市"
              placeholderTextColor="#C3B8BE"
              maxLength={100}
              editable={!saving}
              style={styles.titleInput}
            />
            <Text style={styles.fieldHint}>仅修改地点名称，不更改已保存的坐标；留空可清除名称。</Text>
            {saveError ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {saveError}
              </Text>
            ) : null}
          </ScrollView>

          <TouchableOpacity
            accessibilityRole="button"
            disabled={
              saving ||
              !wish ||
              !hasChanges ||
              normalizedTitle.length === 0 ||
              !isBudgetValid
            }
            onPress={() => void handleSave()}
            style={[styles.saveButton, saving && styles.disabledButton]}
          >
            <Text style={styles.saveText}>
              {saving ? "保存中…" : "保存"}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <DatePickerModal
        visible={showDatePicker}
        value={targetDate}
        onClose={() => setShowDatePicker(false)}
        onChangeValue={(value) => {
          setTargetDate(value);
          setSaveError("");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#FFF9FB",
  },
  content: {
    flexGrow: 1,
    gap: 10,
    paddingTop: 18,
  },
  label: {
    color: "#2E2430",
    fontSize: 15,
    fontWeight: "700",
  },
  titleInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#EADDE3",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    color: "#2E2430",
    fontSize: 15,
  },
  input: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: "#EADDE3",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#2E2430",
    fontSize: 15,
    lineHeight: 22,
  },
  dateSelector: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#EADDE3",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    color: "#2E2430",
    fontSize: 15,
    fontWeight: "600",
  },
  dateHint: {
    color: "#8F7D88",
    fontSize: 13,
  },
  fieldHint: {
    color: "#8F7D88",
    fontSize: 12,
    lineHeight: 18,
  },
  budgetField: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#EADDE3",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  budgetCurrency: {
    color: "#8F7D88",
    fontSize: 15,
    marginRight: 8,
  },
  budgetInput: {
    flex: 1,
    paddingVertical: 12,
    color: "#2E2430",
    fontSize: 15,
    textAlign: "right",
  },
  counter: {
    alignSelf: "flex-end",
    color: "#8F7D88",
    fontSize: 12,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  mutedText: {
    color: "#8F7D88",
    fontSize: 14,
  },
  errorText: {
    color: "#C6284D",
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    borderRadius: 20,
    backgroundColor: "#FFF0F4",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    color: "#FF4F7A",
    fontSize: 14,
    fontWeight: "700",
  },
  saveButton: {
    marginBottom: 18,
    borderRadius: 26,
    backgroundColor: "#FF4F7A",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.55,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
