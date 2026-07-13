import { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
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
import { router, useLocalSearchParams } from "expo-router";
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
import {
  IconsHomeStatusAngrySvg,
  IconsHomeStatusHappySvg,
  IconsHomeStatusMissYouSvg,
  IconsHomeStatusSadSvg,
  IconsHomeStatusShockSvg,
  ImagesCoverPng,
} from "@/assets";
import { NavBar, PinkButton, toast } from "@/components/common";
import { Column, Row } from "@/components/layout";
import { colors } from "@/styles/colors";
import {
  // BudgetPickerModal,
  DatePickerModal,
  MapPickerModal,
  Tag,
} from "@/components/wish-list";
import {
  createWishRecord,
  getWishById,
  type WishItem,
} from "@/app/features/wish-list/api";
import { useStyledActionSheet } from "@/hooks/use-styled-action-sheet";
import { useVideoViewer } from "@/hooks/use-video-viewer";
import { type PickedMediaItem, useMediaPicker } from "@/hooks/use-media-picker";

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
  const scrollRef = useRef<ScrollView>(null);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { showStyledActionSheet } = useStyledActionSheet();
  const { Viewer: videoViewer, openViewer: openVideoViewer } = useVideoViewer();
  const [wish, setWish] = useState<WishItem | null>(null);
  const [loadingWish, setLoadingWish] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [openMapPicker, setOpenMapPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [budget, setBudget] = useState("");
  // const [openBudgetPicker, setOpenBudgetPicker] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<PickedMediaItem[]>([]);

  const { pickFromLibrary, takePhoto } = useMediaPicker({
    mediaTypes: "mixed",
    mode: "multiple",
    selectionLimit: MAX_MEDIA_COUNT,
  });

  useEffect(() => {
    const parsedWishId = Number(id);

    if (!Number.isInteger(parsedWishId) || parsedWishId <= 0) {
      toast.error("愿望不存在");
      setLoadingWish(false);
      return;
    }

    const loadWish = async () => {
      try {
        const response = await getWishById(parsedWishId);
        setWish(response.wish);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "加载愿望详情失败";
        toast.error(message);
      } finally {
        setLoadingWish(false);
      }
    };

    void loadWish();
  }, [id]);

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

  const handleSave = async () => {
    const parsedWishId = Number(id);

    if (!Number.isInteger(parsedWishId) || parsedWishId <= 0) {
      toast.error("愿望不存在");
      return;
    }

    if (!text.trim() && selectedMedia.length === 0) {
      toast.error("请填写记录内容或添加媒体");
      return;
    }

    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      await createWishRecord(parsedWishId, {
        content: text.trim(),
        recordDate: date.toISOString().slice(0, 10),
        mood: selectedStatus || "",
        locationName: selectedLocation?.name || "",
        latitude: selectedLocation?.latitude ?? null,
        longitude: selectedLocation?.longitude ?? null,
        budgetAmount: budget ? Number(budget) : null,
        mediaUrls: selectedMedia.map((media) => media.uri),
      });
      toast.success("记录保存成功");
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存记录失败";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const scrollBudgetIntoView = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  const wishCoverSource = wish?.cover ? { uri: wish.cover } : ImagesCoverPng;

  return (
    <SafeAreaView style={styles.page}>
      <KeyboardAvoidingView
        style={styles.page}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        
        keyboardVerticalOffset={12}
      >
      <NavBar title="进行中" rightContent={<Ellipsis />} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Row style={styles.wishCard}>
          <Image
            contentFit="cover"
            source={wishCoverSource}
            style={styles.wishCover}
          />

          <Column flex={1} style={styles.wishInfo} gap={12}>
            <Row items="center" gap={8}>
              <Text style={styles.wishTitle}>{wish?.title || "愿望记录"}</Text>
              <Tag status={wish?.status || "planning"} />
            </Row>

            <Text numberOfLines={1} style={styles.wishDescription}>
              {wish?.description || "记录这次愿望旅程里值得记住的瞬间"}
            </Text>

            <Row items="center" gap={4}>
              <MapPin size={15} color="#666" />
              <Text style={styles.wishMeta}>
                {wish?.locationName || "还没有设置地点"}
              </Text>
            </Row>
          </Column>
        </Row>

        {loadingWish && (
          <Text style={styles.loadingText}>正在加载愿望信息...</Text>
        )}

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
            {STATUS_ICONS.map(({ id: statusId, name, Icon }) => (
              <Column key={statusId} center>
                <TouchableOpacity
                  style={styles.moodButton}
                  onPress={() => {
                    setSelectedStatus(statusId);
                    toast.info(name);
                  }}
                >
                  <View
                    style={[
                      styles.moodIconWrapper,
                      selectedStatus === statusId &&
                        styles.moodIconWrapperActive,
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
                  contentFit="cover"
                  source={{ uri: media.uri }}
                  style={styles.mediaPreview}
                />
              ) : (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    openVideoViewer(
                      { uri: media.uri },
                      wish?.title || "Wish record video",
                      date.toLocaleDateString(),
                    )
                  }
                >
                  <View style={[styles.mediaPreview, styles.videoPreview]}>
                    {media.thumbnailSource && (
                      <Image
                        source={media.thumbnailSource}
                        style={StyleSheet.absoluteFill}
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
                </TouchableOpacity>
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
        <Text style={styles.mediaCount}>
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
            <View style={styles.locationButton}>
              <Row items="center" gap={8}>
                <JapaneseYen color={colors.theme.primary} size={16} />
                <TextInput
                  value={budget}
                  onChangeText={(text) => setBudget(text.replace(/[^0-9]/g, ""))}
                  onFocus={scrollBudgetIntoView}
                  keyboardType="numeric"
                  placeholder="输入金额"
                  placeholderTextColor={colors.semantic.textMuted}
                  maxLength={8}
                  style={styles.budgetInput}
                />
              </Row>
              <Text style={styles.budgetSuffix}>元</Text>
            </View>
          </Row>
        </Column>
      </ScrollView>

      <View style={styles.footer}>
        <PinkButton
          text={submitting ? "保存中..." : "保存"}
          onPress={() => void handleSave()}
        />
      </View>
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
      {videoViewer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 12,
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
  loadingText: {
    color: "#999",
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
  mediaCount: {
    alignSelf: "flex-end",
    color: "#aaa",
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
  budgetInput: {
    minWidth: 92,
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: 15,
    fontWeight: "600",
    color: colors.semantic.textPrimary,
  },
  budgetSuffix: {
    color: colors.theme.primary,
    fontWeight: "bold",
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
