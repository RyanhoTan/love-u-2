import { useState } from "react";
import {
  Camera,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Ellipsis,
  Images,
  JapaneseYen,
  MapPin,
  Play,
  Plus,
  X,
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
import {
  IconsHomeStatusAngrySvg,
  IconsHomeStatusHappySvg,
  IconsHomeStatusMissYouSvg,
  IconsHomeStatusSadSvg,
  IconsHomeStatusShockSvg,
  ImagesCoverPng,
} from "@/assets";
import { useStyledActionSheet } from "@/hooks/use-styled-action-sheet";
import { type PickedMediaItem, useMediaPicker } from "@/hooks/use-media-picker";
import { NavBar, PinkButton, toast } from "@/components/common";
import { Column, Row } from "@/components/layout";
import {
  BudgetPickerModal,
  DatePickerModal,
  MapPickerModal,
  Tag,
} from "@/components/wish-list";

type SelectedLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

const STATUS_ICONS = [
  { id: "happy", name: "开心", Icon: IconsHomeStatusHappySvg },
  { id: "missYou", name: "想你", Icon: IconsHomeStatusMissYouSvg },
  { id: "sad", name: "难过", Icon: IconsHomeStatusSadSvg },
  { id: "angry", name: "生气", Icon: IconsHomeStatusAngrySvg },
  { id: "shock", name: "惊讶", Icon: IconsHomeStatusShockSvg },
];

const MAX_MEDIA_COUNT = 99;

export default function CreateRecord() {
  const { showStyledActionSheet } = useStyledActionSheet();
  const [text, setText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [openMapPicker, setOpenMapPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [budget, setBudget] = useState("");
  const [openBudgetPicker, setOpenBudgetPicker] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<PickedMediaItem[]>([]);

  const { pickFromLibrary, takePhoto } = useMediaPicker({
    mediaTypes: "mixed",
    mode: "multiple",
    selectionLimit: MAX_MEDIA_COUNT,
  });

  const addMedia = async (pickMedia: () => Promise<PickedMediaItem[]>) => {
    const assets = await pickMedia();

    if (!assets.length) {
      return;
    }

    setSelectedMedia((current) =>
      [...current, ...assets].slice(0, MAX_MEDIA_COUNT),
    );
  };

  const openMediaActions = () => {
    showStyledActionSheet(
      {
        options: ["拍照", "选择照片/视频", "取消"],
        cancelButtonIndex: 2,
        title: "添加媒体",
        message: "用相机捕捉当下，或从相册挑选你想分享的瞬间",
        destructiveColor: "#FF6B8B",
        icons: [
          <Camera key="camera" size={20} color="#FF6B8B" />,
          <Images key="library" size={20} color="#FF6B8B" />,
          <X key="cancel" size={20} color="#FF9AAF" />,
        ],
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            void addMedia(takePhoto);
            break;
          case 1:
            void addMedia(pickFromLibrary);
            break;
          default:
            break;
        }
      },
    );
  };

  const removeMedia = (mediaId: string) => {
    setSelectedMedia((current) =>
      current.filter((item) => item.id !== mediaId),
    );
  };

  return (
    <SafeAreaView style={styles.page}>
      <NavBar title="进行中" rightContent={<Ellipsis />} />

      <ScrollView contentContainerStyle={styles.content}>
        <Row style={styles.wishCard}>
          <Image source={ImagesCoverPng} style={styles.wishCover} />

          <Column flex={1} style={styles.wishInfo} gap={12}>
            <Row items="center" gap={8}>
              <Text style={styles.wishTitle}>一起去看海</Text>
              <Tag status="planning" />
            </Row>

            <Text numberOfLines={1} style={styles.wishDescription}>
              想和你一起去看海，等日出日落，吹吹海风。
            </Text>

            <Row items="center" gap={4}>
              <MapPin size={15} color="#666" />
              <Text style={styles.wishMeta}>三亚 · 大东海</Text>
            </Row>
          </Column>
        </Row>

        <TouchableOpacity
          onPress={() => setOpenDatePicker(true)}
          style={styles.dateButton}
        >
          <CalendarDays size={16} />
          <Text>{date.toLocaleDateString()}</Text>
          <ChevronDown size={16} />
        </TouchableOpacity>

        <View style={styles.descriptionContainer}>
          <TextInput
            placeholder="今天发生了什么..."
            style={styles.descriptionInput}
            multiline
            maxLength={300}
            onChangeText={setText}
            value={text}
          />
          <Text style={styles.counterText}>{text.length}/300</Text>
        </View>

        <Text style={styles.sectionTitle}>心情</Text>

        <Row>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodList}
          >
            {STATUS_ICONS.map(({ id, name, Icon }) => (
              <Column key={id} center>
                <TouchableOpacity
                  style={styles.moodButton}
                  onPress={() => {
                    setSelectedStatus(id);
                    toast.info(name);
                  }}
                >
                  <View
                    style={[
                      styles.moodIconWrapper,
                      selectedStatus === id && styles.moodIconWrapperActive,
                    ]}
                  >
                    <Icon width={36} height={36} />
                  </View>
                  <Text style={styles.moodLabel}>{name}</Text>
                </TouchableOpacity>
              </Column>
            ))}
          </ScrollView>
        </Row>

        <Row style={styles.mediaGrid}>
          {selectedMedia.map((media) => (
            <View key={media.id} style={styles.mediaCard}>
              {media.type === "image" ? (
                <Image
                  source={{ uri: media.uri }}
                  style={styles.mediaPreview}
                />
              ) : (
                <View style={[styles.mediaPreview, styles.videoPreview]}>
                  {media.thumbnailUri && (
                    <Image
                      source={{ uri: media.thumbnailUri }}
                      style={{
                        ...StyleSheet.absoluteFill,
                        resizeMode: "cover",
                      }}
                    />
                  )}
                  <View
                    style={{
                      ...StyleSheet.absoluteFill,
                      backgroundColor: "rgba(0,0,0,0.2)",
                    }}
                  />

                  <Play
                    color="#fff"
                    size={24}
                    fill="#fff"
                    style={{ zIndex: 1 }}
                  />
                </View>
              )}

              <TouchableOpacity
                onPress={() => removeMedia(media.id)}
                style={styles.removeMediaButton}
              >
                <X color="#fff" size={12} />
              </TouchableOpacity>
            </View>
          ))}

          {selectedMedia.length < MAX_MEDIA_COUNT && (
            <TouchableOpacity
              style={styles.addMediaButton}
              onPress={openMediaActions}
            >
              <Column center gap={8}>
                <Plus color="#FF6B8B" />
                <Text style={styles.addMediaText}>添加照片/视频</Text>
              </Column>
            </TouchableOpacity>
          )}
        </Row>
        <Text style={{ alignSelf: "flex-end", color: "#aaa" }}>
          {`${selectedMedia.length} / ${MAX_MEDIA_COUNT}`}
        </Text>
        <Column gap={12}>
          <Row items="center" gap={16}>
            <Text>地点</Text>
            <TouchableOpacity
              onPress={() => setOpenMapPicker(true)}
              style={styles.locationButton}
            >
              <Row items="center" gap={8}>
                <MapPin size={16} color="#aaa" />
                <Text style={styles.fieldValue}>
                  {selectedLocation?.name ?? "点击选择地点"}
                </Text>
              </Row>
              <ChevronRight size={16} color="#aaa" />
            </TouchableOpacity>
          </Row>

          <Row items="center" gap={16}>
            <Text>花费</Text>
            <TouchableOpacity
              onPress={() => setOpenBudgetPicker(true)}
              style={styles.locationButton}
            >
              <Row items="center" gap={8}>
                <JapaneseYen color="#aaa" size={16} />
                <Text style={styles.fieldValue}>{budget || "输入金额"}</Text>
              </Row>
              <Text style={styles.fieldValue}>元</Text>
            </TouchableOpacity>
          </Row>
        </Column>
      </ScrollView>

      <View style={styles.footer}>
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
  page: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
    gap: 12,
  },
  wishCard: {
    backgroundColor: "#FFF1F4",
    borderRadius: 8,
    overflow: "hidden",
    height: 120,
  },
  wishCover: {
    width: 120,
    height: 120,
    resizeMode: "cover",
  },
  wishInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  wishTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  wishDescription: {
    color: "#333",
  },
  wishMeta: {
    fontSize: 14,
    color: "#666",
  },
  dateButton: {
    alignSelf: "flex-end",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    gap: 9,
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
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  moodList: {
    gap: 16,
  },
  moodButton: {
    gap: 2,
  },
  moodIconWrapper: {
    borderRadius: 50,
    padding: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  moodIconWrapperActive: {
    borderColor: "#ff6a94",
  },
  moodLabel: {
    textAlign: "center",
  },
  mediaGrid: {
    flexWrap: "wrap",
    gap: 12,
  },
  addMediaButton: {
    borderWidth: 1,
    borderColor: "#bf7878",
    borderRadius: 8,
    borderStyle: "dashed",
    height: 110,
    width: 110,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  addMediaText: {
    color: "#aaa",
    fontSize: 11,
    textAlign: "center",
  },
  mediaCard: {
    width: 110,
    height: 110,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#fff8f8",
  },
  mediaPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  videoPreview: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  removeMediaButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
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
  fieldValue: {
    color: "#aaa",
  },
  footer: {
    paddingHorizontal: 16,
  },
});
