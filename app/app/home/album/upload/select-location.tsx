import { useState } from "react";
import { router } from "expo-router";
import { Check, FolderClosed, Plus } from "lucide-react-native";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavBar, PinkButton } from "@/components/common";
import { Column, Row } from "@/components/layout";
import { STORIES } from "@/data/mock-stories";
import { colors } from "@/styles/colors";

export default function SelectLocation() {
  const [selectedStoryIds, setSelectedStoryIds] = useState<number[]>([]);
  const [selectedUncategorized, setSelectedUncategorized] = useState(false);

  const toggleUncategorized = () => {
    setSelectedUncategorized((current) => {
      const next = !current;

      if (next) {
        setSelectedStoryIds([]);
      }

      return next;
    });
  };

  const toggleStory = (storyId: number) => {
    setSelectedUncategorized(false);
    setSelectedStoryIds((current) =>
      current.includes(storyId)
        ? current.filter((id) => id !== storyId)
        : [...current, storyId],
    );
  };

  return (
    <SafeAreaView style={styles.page}>
      <NavBar title="选择存放位置" />

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.createStoryButton}
          onPress={() => router.push("/home/album/stories/create")}
        >
          <Column center gap={8}>
            <Plus color={colors.theme.primary} size={24} />
            <Text style={styles.createStoryText}>新建时光故事</Text>
          </Column>
        </TouchableOpacity>

        <Column gap={12}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.storyItem,
              selectedUncategorized && styles.storyItemSelected,
            ]}
            onPress={toggleUncategorized}
          >
            <View style={styles.folderCover}>
              <FolderClosed color={colors.theme.primary} size={30} />
            </View>

            <Row flex={1} items="center" content="space-between" gap={12}>
              <Column flex={1} gap={8}>
                <Text numberOfLines={1} style={styles.storyTitle}>
                  存入“未分类”
                </Text>
                <Text style={styles.storyMeta}>不存入任何故事</Text>
              </Column>

              <View
                style={[
                  styles.checkbox,
                  selectedUncategorized && styles.checkboxSelected,
                ]}
              >
                {selectedUncategorized ? (
                  <Check
                    size={14}
                    color={colors.semantic.textInverse}
                    strokeWidth={3}
                  />
                ) : null}
              </View>
            </Row>
          </TouchableOpacity>

          {STORIES.map((story) => {
            const selected = selectedStoryIds.includes(story.id);

            return (
              <TouchableOpacity
                key={story.id}
                activeOpacity={0.85}
                style={[styles.storyItem, selected && styles.storyItemSelected]}
                onPress={() => toggleStory(story.id)}
              >
                <Image source={story.cover} style={styles.storyCover} />

                <Row flex={1} items="center" content="space-between" gap={12}>
                  <Column flex={1} gap={8}>
                    <Text numberOfLines={1} style={styles.storyTitle}>
                      {story.title}
                    </Text>
                    <Text style={styles.storyMeta}>
                      {story.photos}张照片 · {story.videos}个视频
                    </Text>
                  </Column>

                  <View
                    style={[
                      styles.checkbox,
                      selected && styles.checkboxSelected,
                    ]}
                  >
                    {selected ? (
                      <Check
                        size={14}
                        color={colors.semantic.textInverse}
                        strokeWidth={3}
                      />
                    ) : null}
                  </View>
                </Row>
              </TouchableOpacity>
            );
          })}
        </Column>
      </ScrollView>

      <View style={styles.footer}>
        <PinkButton text="确认" onPress={() => {}} />
      </View>
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
    gap: 16,
  },
  createStoryButton: {
    width: "100%",
    minHeight: 96,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.theme.primaryBorder,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: colors.semantic.page,
  },
  createStoryText: {
    color: colors.semantic.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  storyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.semantic.surface,
  },
  storyItemSelected: {
    backgroundColor: colors.theme.primaryTint,
  },
  storyCover: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  folderCover: {
    width: 72,
    height: 72,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.theme.primaryTint,
  },
  storyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.semantic.textPrimary,
  },
  storyMeta: {
    fontSize: 13,
    color: colors.semantic.textSecondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.semantic.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.semantic.page,
  },
  checkboxSelected: {
    borderColor: colors.theme.primary,
    backgroundColor: colors.theme.primary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.semantic.page,
    borderTopWidth: 0.3,
    borderColor: colors.semantic.border,
  },
});
