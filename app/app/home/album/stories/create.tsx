import { useState } from "react";
import { Image } from "expo-image";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Camera, Images, Play, Plus, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  NavBar,
  toast,
} from "@/components/common";
import {
  createAlbumStory,
  type CreateAlbumMediaPayload,
  uploadAlbumFile,
} from "@/app/features/album/api";
import { Column } from "@/components/layout";
import {
  useImageViewer,
  useVideoViewer,
  useStyledActionSheet,
  type PickedMediaItem,
  useMediaPicker,
} from "@/hooks";
import { colors } from "@/styles/colors";

type StoryTag = {
  id: string;
  name: string;
};

const mockStoryTags: StoryTag[] = [
  { id: "travel", name: "旅行" },
  { id: "daily", name: "日常" },
  { id: "birthday", name: "生日" },
  { id: "anniversary", name: "纪念日" },
];

const MAX_MEDIA_COUNT = 99;

export default function CreateStory() {
  const { Viewer: imageViewer, openViewer: openImageViewer } = useImageViewer();
  const { Viewer: videoViewer, openViewer: openVideoViewer } = useVideoViewer();
  const { showStyledActionSheet } = useStyledActionSheet();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<PickedMediaItem[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const { pickFromLibrary, takePhoto } = useMediaPicker({
    mediaTypes: "mixed",
    mode: "multiple",
    selectionLimit: MAX_MEDIA_COUNT,
  });

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((item) => item !== tagId)
        : [...current, tagId],
    );
  };

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
        message: "用相机记录当下，或从相册挑选想放进故事里的瞬间",
        icons: [
          <Camera key="camera" size={20} color={colors.theme.primary} />,
          <Images key="library" size={20} color={colors.theme.primary} />,
          <X key="cancel" size={20} color={colors.theme.secondary} />,
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

  const getThumbnailUri = (asset: PickedMediaItem) => {
    const source = asset.thumbnailSource;

    if (source && typeof source === "object" && "uri" in source) {
      return typeof source.uri === "string" ? source.uri : "";
    }

    return "";
  };

  const handleCreate = async () => {
    if (isCreating) {
      return;
    }

    const nextTitle = title.trim();
    if (!nextTitle) {
      toast.error("请输入故事标题");
      return;
    }

    try {
      setIsCreating(true);

      const media: CreateAlbumMediaPayload[] = [];

      for (const item of selectedMedia) {
        const upload = await uploadAlbumFile(
          item.uri,
          item.fileName || `${item.id}.${item.type === "image" ? "jpg" : "mp4"}`,
          item.mimeType || (item.type === "image" ? "image/jpeg" : "video/mp4"),
        );

        media.push({
          mediaType: item.type,
          url: upload.url,
          thumbnailUrl: item.type === "video" ? getThumbnailUri(item) : "",
        });
      }

      await createAlbumStory({
        title: nextTitle,
        description: description.trim(),
        media,
      });

      toast.success("故事创建成功");
      router.replace("/home/album/stories");
    } catch (error) {
      const message = error instanceof Error ? error.message : "创建故事失败";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <NavBar
        title="创建时光故事"
        rightContent={
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.createButton}
            onPress={() => void handleCreate()}
          >
            <Text style={styles.createButtonText}>
              {isCreating ? "创建中" : "创建"}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Column gap={8}>
          <Text style={styles.fieldLabel}>标题</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="输入故事标题"
            placeholderTextColor={colors.semantic.textMuted}
            style={[styles.input, styles.titleInput]}
          />
        </Column>

        <Column gap={8}>
          <Text style={styles.fieldLabel}>描述</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="输入故事描述"
            placeholderTextColor={colors.semantic.textMuted}
            style={[styles.input, styles.descriptionInput]}
            multiline
            textAlignVertical="top"
          />
        </Column>

        <Column gap={8}>
          <Text style={styles.fieldLabel}>标签</Text>
          <View style={styles.tagRow}>
            {mockStoryTags.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);

              return (
                <TouchableOpacity
                  key={tag.id}
                  activeOpacity={0.8}
                  onPress={() => toggleTag(tag.id)}
                  style={[
                    styles.tagButton,
                    selected && styles.tagButtonSelected,
                  ]}
                >
                  <Text
                    style={[styles.tagText, selected && styles.tagTextSelected]}
                  >
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {}}
              style={styles.addTagButton}
            >
              <Text style={styles.addTagText}>+ 添加标签</Text>
            </TouchableOpacity>
          </View>
        </Column>

        <Column gap={8}>
          <Text style={styles.fieldLabel}>媒体</Text>
          <View style={styles.mediaGrid}>
            {selectedMedia.map((media) => (
              <View key={media.id} style={styles.mediaCard}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    if (media.type === "image") {
                      openImageViewer({ uri: media.uri });
                      return;
                    }

                    openVideoViewer(
                      { uri: media.uri },
                      title || "故事视频",
                      description || "时光故事媒体预览",
                    );
                  }}
                >
                  {media.type === "image" ? (
                    <Image
                      source={{ uri: media.uri }}
                      style={styles.mediaPreview}
                    />
                  ) : (
                    <View style={[styles.mediaPreview, styles.videoPreview]}>
                      {media.thumbnailSource && (
                        <Image
                          source={media.thumbnailSource}
                          style={StyleSheet.absoluteFill}
                        />
                      )}
                      <View style={styles.videoOverlay} />
                      <Play color={colors.semantic.textInverse} size={24} />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => removeMedia(media.id)}
                  style={styles.removeMediaButton}
                >
                  <X color={colors.semantic.textInverse} size={12} />
                </TouchableOpacity>
              </View>
            ))}

            {selectedMedia.length < MAX_MEDIA_COUNT && (
              <TouchableOpacity
                style={styles.addMediaButton}
                onPress={openMediaActions}
                activeOpacity={0.8}
              >
                <Column center gap={8}>
                  <Plus color={colors.theme.primary} />
                  <Text style={styles.addMediaText}>添加照片/视频</Text>
                </Column>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.mediaCount}>
            {selectedMedia.length} / {MAX_MEDIA_COUNT}
          </Text>
        </Column>
      </ScrollView>
      {imageViewer}
      {videoViewer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.semantic.page,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.semantic.textPrimary,
  },
  createButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.theme.primarySoftBg,
  },
  createButtonText: {
    color: colors.theme.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.semantic.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.semantic.page,
    color: colors.semantic.textPrimary,
  },
  titleInput: {
    minHeight: 48,
  },
  descriptionInput: {
    minHeight: 120,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tagButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.semantic.border,
    backgroundColor: colors.semantic.page,
  },
  tagButtonSelected: {
    borderColor: colors.theme.primary,
    backgroundColor: colors.theme.primaryTint,
  },
  tagText: {
    color: colors.semantic.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  tagTextSelected: {
    color: colors.theme.primary,
  },
  addTagButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.semantic.border,
    backgroundColor: colors.semantic.page,
  },
  addTagText: {
    color: colors.semantic.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  addMediaButton: {
    width: 110,
    height: 110,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.theme.primaryBorder,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: colors.semantic.page,
  },
  addMediaText: {
    color: colors.semantic.textSecondary,
    fontSize: 11,
    textAlign: "center",
  },
  mediaCard: {
    width: 110,
    height: 110,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.semantic.surface,
  },
  mediaPreview: {
    width: "100%",
    height: "100%",
  },
  videoPreview: {
    alignItems: "center",
    justifyContent: "center",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.semantic.overlay,
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
    color: colors.semantic.textMuted,
    fontSize: 12,
  },
});
