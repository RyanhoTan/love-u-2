import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
  ToastShowParams,
} from "react-native-toast-message";

type ToastType = "success" | "error" | "info";

const defaultToastOptions: Pick<
  ToastShowParams,
  "position" | "visibilityTime"
> = {
  position: "top",
  visibilityTime: 2500,
};

const showToast = (type: ToastType, text1: string, text2?: string) => {
  Toast.show({
    type,
    text1,
    text2,
    ...defaultToastOptions,
  });
};

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#34c759" }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1NumberOfLines={2}
      text2NumberOfLines={2}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "#ff3b30" }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1NumberOfLines={2}
      text2NumberOfLines={2}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#0a84ff" }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1NumberOfLines={2}
      text2NumberOfLines={2}
    />
  ),
};

export const toast = {
  success: (text1: string, text2?: string) =>
    showToast("success", text1, text2),
  error: (text1: string, text2?: string) => showToast("error", text1, text2),
  info: (text1: string, text2?: string) => showToast("info", text1, text2),
};

export function ToastProvider() {
  return <Toast config={toastConfig} topOffset={64} />;
}
