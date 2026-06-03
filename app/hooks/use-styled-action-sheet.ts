import {
  useActionSheet,
  type ActionSheetOptions,
} from "@expo/react-native-action-sheet";
import {
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type StyledActionSheetOptions = Omit<
  ActionSheetOptions,
  | "containerStyle"
  | "separatorStyle"
  | "titleTextStyle"
  | "messageTextStyle"
  | "textStyle"
> & {
  containerStyle?: StyleProp<ViewStyle>;
  separatorStyle?: StyleProp<ViewStyle>;
  titleTextStyle?: StyleProp<TextStyle>;
  messageTextStyle?: StyleProp<TextStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function useStyledActionSheet() {
  const { showActionSheetWithOptions } = useActionSheet();
  const insets = useSafeAreaInsets();

  const showStyledActionSheet = (
    options: StyledActionSheetOptions,
    onSelect: (selectedIndex?: number) => void,
  ) => {
    const {
      containerStyle,
      separatorStyle,
      titleTextStyle,
      messageTextStyle,
      textStyle,
      ...restOptions
    } = options;

    showActionSheetWithOptions(
      {
        useModal: true,
        showSeparators: true,
        tintColor: "#2F2430",
        cancelButtonTintColor: "#FF6B8B",
        tintIcons: false,
        ...restOptions,
        containerStyle: StyleSheet.flatten([
          styles.container,
          { paddingBottom: Math.max(insets.bottom, 12) },
          containerStyle,
        ]),
        separatorStyle: StyleSheet.flatten([styles.separator, separatorStyle]),
        titleTextStyle: StyleSheet.flatten([styles.title, titleTextStyle]),
        messageTextStyle: StyleSheet.flatten([
          styles.message,
          messageTextStyle,
        ]),
        textStyle: StyleSheet.flatten([styles.text, textStyle]),
      },
      onSelect,
    );
  };

  return { showStyledActionSheet };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFDFE",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  separator: {
    backgroundColor: "#F9DDE4",
    marginHorizontal: 16,
    width: undefined,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2F2430",
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
    color: "#9A7D86",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2F2430",
  },
});
