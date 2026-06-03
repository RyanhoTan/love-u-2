import { Row } from "@/components/layout";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { colors } from "@/styles/colors";

type SelectedLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

type MapPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: SelectedLocation) => void;
};

export function MapPickerModal({
  visible,
  onClose,
  onSelectLocation,
}: MapPickerModalProps) {
  const amapKey = process.env.EXPO_PUBLIC_AMAP_KEY;
  const amapSecurityKey = process.env.EXPO_PUBLIC_AMAP_SECRET;

  const mapUrl = `https://m.amap.com/picker/?key=${amapKey}&jscode=${amapSecurityKey}&keywords=%E7%BE%8E%E9%A3%9F,%E6%99%AF%E7%82%B9,%E8%B4%AD%E7%89%A9,%E5%85%AC%E5%9B%AD`;

  const injectedJavaScriptBeforeContentLoaded = `
    (function() {
      window._AMapSecurityConfig = {
        securityJsCode: '${amapSecurityKey}',
      };

      window.addEventListener('message', function(event) {
        var loc = event.data;
        if (loc && loc.location) {
          window.ReactNativeWebView.postMessage(JSON.stringify(loc));
        }
      }, false);
    })();
    true;
  `;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (!data?.location) {
        return;
      }

      const [longitude, latitude] = data.location.split(",");

      onSelectLocation({
        name: data.name || "已选位置",
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });
      onClose();
    } catch (error) {
      console.log("failed to parse map data", error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.topMask}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.content}>
          <Row items="center" content="space-between" style={styles.header}>
            <View style={styles.placeholder} />
            <Text style={styles.title}>选择地点</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>关闭</Text>
            </TouchableOpacity>
          </Row>

          <View style={styles.webviewWrapper}>
            <WebView
              source={{ uri: mapUrl }}
              javaScriptEnabled
              domStorageEnabled
              geolocationEnabled
              injectedJavaScriptBeforeContentLoaded={
                injectedJavaScriptBeforeContentLoaded
              }
              onMessage={handleMessage}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.semantic.overlay,
    justifyContent: "flex-end",
  },
  topMask: {
    flex: 1,
    width: "100%",
  },
  content: {
    backgroundColor: colors.semantic.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "60%",
    width: "100%",
    overflow: "hidden",
  },
  header: {
    height: 54,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.semantic.divider,
    backgroundColor: colors.semantic.surface,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  closeText: {
    fontSize: 16,
    color: colors.semantic.textSecondary,
  },
  webviewWrapper: {
    flex: 1,
    width: "100%",
  },
});
