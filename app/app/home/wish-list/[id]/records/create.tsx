import { NavBar, PinkButton, toast } from "@/components/common";
import { Row, Column } from "@/components/layout";
import {
  Ellipsis,
  MapPin,
  CalendarDays,
  ChevronDown,
  Plus,
  ChevronRight,
  JapaneseYen,
} from "lucide-react-native";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  IconsHomeStatusSadSvg,
  IconsHomeStatusShockSvg,
  IconsHomeStatusMissYouSvg,
  IconsHomeStatusHappySvg,
  IconsHomeStatusAngrySvg,
  ImagesCoverPng,
} from "@/assets";
import {
  DatePickerModal,
  MapPickerModal,
  BudgetPickerModal,
  Tag,
} from "@/components/wish-list";

type SelectedLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

export default function CreateRecord() {
  const [text, setText] = useState("");
  const maxLength = 300;

  const STATUS_ICONS = [
    { id: "happy", name: "开心", Icon: IconsHomeStatusHappySvg },
    { id: "missYou", name: "想你", Icon: IconsHomeStatusMissYouSvg },
    { id: "sad", name: "难过", Icon: IconsHomeStatusSadSvg },
    { id: "angry", name: "生气", Icon: IconsHomeStatusAngrySvg },
    { id: "shock", name: "惊讶", Icon: IconsHomeStatusShockSvg },
  ];

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [openMapPicker, setOpenMapPicker] = useState(false);

  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const [budget, setBudget] = useState("");
  const [openBudgetPicker, setOpenBudgetPicker] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <NavBar title="进行中" rightContent={<Ellipsis />} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Row
          style={{
            backgroundColor: "#FFF1F4",
            borderRadius: 8,
            overflow: "hidden",
            height: 120,
          }}
        >
          <Image
            source={ImagesCoverPng}
            style={{ height: 120, width: 120, resizeMode: "cover" }}
          />
          <Column
            flex={1}
            style={{ paddingHorizontal: 16, paddingVertical: 12 }}
            gap={12}
          >
            <Row items="center" gap={8}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                一起去看海
              </Text>
              <Tag status="planning" />
            </Row>
            <Text numberOfLines={1}>
              想和你一起去看海，等日出日落，吹吹海风~
            </Text>
            <Row content="space-between">
              <Row items="center" gap={4}>
                <MapPin size={15} color={"#666"} />
                <Text style={{ fontSize: 14, color: "#666" }}>
                  三亚 · 大东海
                </Text>
              </Row>
            </Row>
          </Column>
        </Row>

        <TouchableOpacity
          onPress={() => setOpenDatePicker(true)}
          style={{
            alignSelf: "flex-end",
            flexDirection: "row",
            borderWidth: 1,
            borderColor: "#ccc",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: "center",
            gap: 9,
          }}
        >
          <CalendarDays size={16} />
          <Text>2024.05.02</Text>
          <ChevronDown size={16} />
        </TouchableOpacity>

        <View style={styles.descriptionContainer}>
          <TextInput
            placeholder="今天发生了什么..."
            style={styles.descriptionInput}
            multiline
            maxLength={maxLength}
            onChangeText={setText}
            value={text}
          />
          <Text style={styles.counterText}>
            {text.length}/{maxLength}
          </Text>
        </View>
        <Text style={styles.mood}>心情</Text>

        <Row>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16 }}
          >
            {STATUS_ICONS.map(({ id, name, Icon }) => (
              <Column key={id} center>
                <TouchableOpacity
                  style={{ gap: 2 }}
                  onPress={() => {
                    setSelectedStatus(id);
                    toast.info(name);
                  }}
                >
                  <View
                    style={{
                      borderRadius: 50,
                      padding: 8,
                      borderWidth: 2,
                      borderColor:
                        selectedStatus === id ? "#ff6a94" : "transparent",
                    }}
                  >
                    <Icon width={36} height={36} />
                  </View>
                  <Text style={{ textAlign: "center" }}>{name}</Text>
                </TouchableOpacity>
              </Column>
            ))}
          </ScrollView>
        </Row>
        {/* TODO: 添加媒体功能，
            修改一下app\components\wish-list\cover-picker.tsx组件后放到这里 */}
        <TouchableOpacity style={styles.addMediaButton}>
          <Column center gap={8}>
            <Plus color={"#FF6B8B"} />
            <Text style={{ color: "#aaa", fontSize: 11 }}>添加照片/视频</Text>
          </Column>
        </TouchableOpacity>
        <Column gap={12}>
          <Row items="center" gap={16}>
            <Text>地点</Text>
            <TouchableOpacity
              onPress={() => setOpenMapPicker(true)}
              style={styles.locationButton}
            >
              <Row items="center" gap={8}>
                <MapPin size={16} color={"#aaa"} />
                <Text style={{ color: "#aaa" }}>点击选择地点</Text>
              </Row>
              <ChevronRight size={16} color={"#aaa"} />
            </TouchableOpacity>
          </Row>

          <Row items="center" gap={16}>
            <Text>花费</Text>
            <TouchableOpacity
              onPress={() => setOpenBudgetPicker(true)}
              style={styles.locationButton}
            >
              <Row items="center" gap={8}>
                <JapaneseYen color={"#aaa"} size={16} />
                <Text style={{ color: "#aaa" }}>输入金额</Text>
              </Row>
              <Text style={{ color: "#aaa" }}>元</Text>
            </TouchableOpacity>
          </Row>
        </Column>
      </ScrollView>
      <View style={{ paddingHorizontal: 16 }}>
        <PinkButton text="保存" onPress={() => toast.success("记录已保存")} />
      </View>

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
  descriptionContainer: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    position: "relative",
  },
  descriptionInput: {
    textAlignVertical: "top",
    minHeight: 80,
    paddingBottom: 32,
    borderRadius: 12,
    padding: 12,
  },
  counterText: {
    position: "absolute",
    right: 8,
    bottom: 4,
    fontSize: 12,
    color: "#999999",
  },
  mood: {
    fontWeight: "bold",
    fontSize: 16,
  },
  addMediaButton: {
    borderWidth: 1,
    borderColor: "#bf7878",
    borderRadius: 8,
    borderStyle: "dashed",
    height: 100,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  locationButton: {
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    gap: 4,
  },
});
