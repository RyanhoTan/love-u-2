import { useEffect, useState } from "react";
import {
  Image,
  type ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Camera, ChevronRight, Images, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { updateUserProfile } from "@/app/features/auth/api";
import { useAuth } from "@/app/features/auth/auth-context";
import { ImagesAvatarMalePng } from "@/assets";
import { NavBar, PinkButton, toast } from "@/components/common";
import { Column, Row } from "@/components/layout";
import { DatePickerModal } from "@/components/wish-list/date-picker-modal";
import {
  type PickedMediaItem,
  useMediaPicker,
  useStyledActionSheet,
} from "@/hooks";
import { colors } from "@/styles/colors";
import { useRouter } from "expo-router";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { updateStoredUser, user } = useAuth();
  const { showStyledActionSheet } = useStyledActionSheet();
  const { pickFromLibrary, takePhoto } = useMediaPicker({
    mediaTypes: "image",
    mode: "single",
    allowsEditing: true,
    aspect: [1, 1],
  });

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [signature, setSignature] = useState("");
  const [birthday, setBirthday] = useState(new Date("2004-05-20"));
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setNickname(user.nickname?.trim() || user.username || "");
    setSignature(user.signature?.trim() || "");
    setAvatarUri(user.avatar || null);

    if (!user.birthday) {
      return;
    }

    const parsedBirthday = new Date(user.birthday);
    if (!Number.isNaN(parsedBirthday.getTime())) {
      setBirthday(parsedBirthday);
    }
  }, [user]);

  const avatarSource: ImageSourcePropType = avatarUri
    ? { uri: avatarUri }
    : ImagesAvatarMalePng;

  const applyAvatar = async (pickMedia: () => Promise<PickedMediaItem[]>) => {
    const assets = await pickMedia();

    if (!assets[0]) {
      return;
    }

    setAvatarUri(assets[0].uri);
  };

  const openAvatarActions = () => {
    showStyledActionSheet(
      {
        title: "更换头像",
        options: ["拍照", "从相册选择", "取消"],
        cancelButtonIndex: 2,
        icons: [
          <Camera key="camera" size={20} color={colors.theme.primary} />,
          <Images key="images" size={20} color={colors.theme.primary} />,
          <X key="cancel" size={20} color={colors.theme.secondary} />,
        ],
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            void applyAvatar(takePhoto);
            break;
          case 1:
            void applyAvatar(pickFromLibrary);
            break;
          default:
            break;
        }
      },
    );
  };

  const handleSave = async () => {
    const trimmedNickname = nickname.trim();
    const trimmedSignature = signature.trim();

    if (!trimmedNickname) {
      toast.error("请输入昵称");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await updateUserProfile({
        nickname: trimmedNickname,
        avatar: avatarUri,
        signature: trimmedSignature,
        birthday: formatDate(birthday),
      });

      await updateStoredUser(response.user);
      toast.success("保存成功");
      router.replace("/home/mine");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "保存失败，请稍后重试";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavBar title="个人资料" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Column items="center" gap={10} style={styles.avatarSection}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={openAvatarActions}
            style={styles.avatarButton}
          >
            <Image source={avatarSource} style={styles.avatar} />

            <View style={styles.cameraBadge}>
              <Camera size={14} color="#FFFFFF" strokeWidth={2.4} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} onPress={openAvatarActions}>
            <Text style={styles.changeAvatarText}>更换头像</Text>
          </TouchableOpacity>
        </Column>

        <Column gap={18} style={styles.form}>
          <Column gap={10} style={styles.fieldGroup}>
            <Text style={styles.label}>昵称</Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="请输入昵称"
              placeholderTextColor="#C3B8BE"
              style={styles.input}
            />
          </Column>

          <Column gap={10} style={styles.fieldGroup}>
            <Text style={styles.label}>个性签名</Text>
            <TextInput
              value={signature}
              onChangeText={setSignature}
              placeholder="写点什么介绍自己"
              placeholderTextColor="#C3B8BE"
              style={[styles.input, styles.signatureInput]}
              multiline
              textAlignVertical="top"
            />
          </Column>

          <Column gap={10} style={styles.fieldGroup}>
            <Text style={styles.label}>生日</Text>
            <TouchableOpacity
              style={styles.selector}
              activeOpacity={0.85}
              onPress={() => setOpenDatePicker(true)}
            >
              <Row items="center" content="space-between">
                <Text style={styles.selectorText}>{formatDate(birthday)}</Text>
                <ChevronRight size={18} color="#C7C2CA" />
              </Row>
            </TouchableOpacity>
          </Column>
        </Column>

        <PinkButton
          text={isSubmitting ? "保存中..." : "保存"}
          onPress={() => void handleSave()}
          style={styles.saveButton}
        />
      </ScrollView>

      <DatePickerModal
        visible={openDatePicker}
        value={birthday}
        onClose={() => setOpenDatePicker(false)}
        onChangeValue={setBirthday}
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
  content: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  avatarSection: {
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    marginBottom: 28,
  },
  avatarButton: {
    position: "relative",
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#FCE6EC",
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#444444",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  changeAvatarText: {
    fontSize: 14,
    color: "#8E7A82",
  },
  form: {
    gap: 18,
  },
  fieldGroup: {
    gap: 10,
  },
  label: {
    fontSize: 15,
    color: "#5F4D55",
    fontWeight: "500",
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#F0E6EA",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 16,
    color: colors.semantic.textPrimary,
    backgroundColor: "#FFFFFF",
  },
  signatureInput: {
    minHeight: 74,
  },
  selector: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#F0E6EA",
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: colors.semantic.textPrimary,
    paddingVertical: 14,
  },
  saveButton: {
    marginTop: 28,
    borderRadius: 14,
    paddingVertical: 15,
  },
});
