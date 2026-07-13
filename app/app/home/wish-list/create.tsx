import { useRef, useState } from "react";
import { ChevronRight } from "lucide-react-native";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavBar, toast } from "@/components/common";
import { Column, Row } from "@/components/layout";
import { colors } from "@/styles/colors";
import {
  CoverPicker,
  DatePickerModal,
  MapPickerModal,
} from "@/components/wish-list";
import { createWish } from "@/app/features/wish-list/api";
import { router } from "expo-router";

type SelectedLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

export default function CreateWishList() {
  const scrollRef = useRef<ScrollView>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [openMapPicker, setOpenMapPicker] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  const [text, setText] = useState("");
  const maxLength = 200;

  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const [budget, setBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      onPress: () => undefined,
    },
  ];

  async function handleNextStep() {
    if (!title.trim()) {
      toast.error("请输入愿望标题");
      return;
    }

    try {
      setSubmitting(true);
      await createWish({
        title: title.trim(),
        description: text.trim(),
        cover: selectedImage || "",
        targetDate: date.toISOString().slice(0, 10),
        locationName: selectedLocation ? selectedLocation.name : "",
        latitude: selectedLocation ? selectedLocation.latitude : null,
        longitude: selectedLocation ? selectedLocation.longitude : null,
        budgetAmount: budget ? Number(budget) : null,
      });
      toast.success("愿望创建成功");
      router.replace("/home/wish-list");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "创建愿望失败";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const scrollBudgetIntoView = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  return (
    <SafeAreaView style={styles.page}>
      <KeyboardAvoidingView
        style={styles.page}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={6}
      >
      <NavBar
        title="创建愿望"
        rightContent={
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => void handleNextStep()}
            disabled={submitting}
          >
            <Text style={styles.nextButtonText}>下一步</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
      >
      <CoverPicker value={selectedImage} onChange={setSelectedImage} />

      <Column gap={8}>
        <Text style={styles.fieldLabel}>愿望标题</Text>
        <TextInput
          placeholder="输入愿望标题"
          style={[styles.wishInput, styles.titleInput]}
          value={title}
          onChangeText={setTitle}
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
        <TouchableOpacity
          key={item.label}
          onPress={item.onPress}
          disabled={item.label === "预算"}
        >
          <Row items="center" content="space-between">
            <Text style={styles.menuTitle}>{item.label}</Text>
            {item.label === "预算" ? (
              <View style={styles.budgetInputShell}>
                <Text style={styles.budgetCurrency}>¥</Text>
                <TextInput
                  value={budget}
                  onChangeText={(text) => setBudget(text.replace(/[^0-9]/g, ""))}
                  onFocus={scrollBudgetIntoView}
                  keyboardType="numeric"
                  placeholder="输入预算"
                  placeholderTextColor={colors.semantic.textMuted}
                  maxLength={8}
                  style={styles.budgetInput}
                />
              </View>
            ) : (
              <Row items="center" gap={8}>
                <Text style={styles.menuValue}>{item.value}</Text>
                <ChevronRight color="#999999" />
              </Row>
            )}
          </Row>
        </TouchableOpacity>
      ))}

      </ScrollView>
      </KeyboardAvoidingView>

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

      {/*
      <BudgetPickerModal
        visible={openBudgetPicker}
        value={budget}
        onClose={() => setOpenBudgetPicker(false)}
        onChangeValue={setBudget}
      />
      */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 12,
    gap: 24,
  },
  pageContent: {
    gap: 24,
  },
  nextButton: {
    padding: 8,
    backgroundColor: colors.theme.primarySoftBg,
    borderRadius: 16,
  },
  nextButtonText: {
    fontWeight: "bold",
    color: colors.theme.primary,
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
    borderColor: colors.semantic.border,
  },
  descriptionContainer: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.semantic.border,
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
    color: colors.semantic.textMuted,
  },
  menuTitle: {
    fontWeight: "bold",
  },
  menuValue: {
    color: colors.semantic.textMuted,
  },
  budgetInputShell: {
    // minWidth: 180,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    paddingRight: 6 ,
  },
  budgetCurrency: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.theme.primary,
  },
  budgetInput: {
    // minWidth: 88,
    padding: 0,
    textAlign: "right",
    fontSize: 15,
    fontWeight: "600",
    color: colors.semantic.textPrimary,
  },
});
