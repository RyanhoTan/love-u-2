import { NavBar, toast } from "@/components/common";
import { Column, Row } from "@/components/layout";
import { Camera, ChevronRight } from "lucide-react-native";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  TextInput,
  Alert,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import DatePicker from "react-native-date-picker";
import * as ImagePicker from "expo-image-picker";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { WebView } from "react-native-webview";

export default function CreateWishList() {
  // TODO: 后面放到接口和菜单里显示
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  // 注释：控制地图 Webview 弹窗的可见性
  const [openMapPicker, setOpenMapPicker] = useState(false);

  // 注释：接收 H5 地图组件传回的数据
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // 注释：高德选址组件用户点击“确认”后，会向原生发送包含 location 和 name 的消息
      if (data && data.location) {
        const [lng, lat] = data.location.split(",");
        setSelectedLocation({
          name: data.name || "已选位置",
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        });
        setOpenMapPicker(false);
        toast.success("地点选择成功");
      }
    } catch (error) {
      console.log("解析地图数据失败", error);
    }
  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // 解构出显示 ActionSheet 的方法
  const { showActionSheetWithOptions } = useActionSheet();

  const takePhoto = async () => {
    // 请求相机权限
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("提示", "您拒绝了相机权限，无法进行拍照");
      return;
    }
    // 打开相机拍摄
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"], // 仅选择图片
      allowsEditing: true, // 允许剪裁
      aspect: [16, 9], // 16：9
    });

    // 如果用户没有取消拍照，则保存图片路径
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  /**
   * 功能：打开系统相册选择图片
   */
  const pickImageFromLibrary = async () => {
    // 请求相册权限
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("提示", "您拒绝了相册权限，无法选择图片");
      return;
    }

    // 打开相册
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
    });

    // 如果用户没有取消选择，则保存图片路径
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  /**
   * 功能：点击按钮后弹起底部的选择器
   */
  const onPressSelectImage = () => {
    const options = ["拍照", "从相册选择", "取消"];
    const cancelButtonIndex = 2;
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: "请选择图片来源", // 提示标题
      },
      (selectedIndex?: number) => {
        // 根据用户的点击下标执行对应操作
        switch (selectedIndex) {
          case 0:
            takePhoto();
            break;
          case 1:
            pickImageFromLibrary();
            break;
          case cancelButtonIndex:
            // 点击取消，不做操作
            break;
        }
      },
    );
  };

  const [text, setText] = useState("");
  const maxLength = 200; // 设置最大字数限制为 200 字

  const [date, setDate] = useState(new Date());

  const [openDatePicker, setOpenDatePicker] = useState(false);

  // 注释：保存用户输入的预算金额
  const [budget, setBudget] = useState("");
  // 注释：控制预算输入弹窗的可见性
  const [openBudgetPicker, setOpenBudgetPicker] = useState(false);

  const menus = [
    {
      label: "时间",
      value: date ? date.toLocaleDateString() : "选择时间",
      onPress: () => setOpenDatePicker(true),
    },
    {
      label: "地点",
      value: selectedLocation ? selectedLocation.name : "选择地点",
      onPress: () => setOpenMapPicker(true),
    },
    {
      label: "预算",
      // 注释：如果填了预算就显示金额，没填就显示默认文字
      value: !!budget ? `￥${budget}` : "选择预算",
      onPress: () => setOpenBudgetPicker(true),
    },
  ];

  const amapKey = process.env.EXPO_PUBLIC_AMAP_KEY; // 从环境变量中获取高德地图 API Key
  const amapSecurityKey = process.env.EXPO_PUBLIC_AMAP_SECRET; // 从环境变量中获取高德地图 API Secret（如果需要服务器验证签名时使用）

  const mapUrl = `https://m.amap.com/picker/?key=${amapKey}&jscode=${amapSecurityKey}&keywords=美食,景点,购物,公园`;
  // 注释：向 Webview 注入的 JS 代码。用于监听高德 H5 的确认事件，并通过 window.ReactNativeWebView 发送给 RN
  const injectedJavaScriptBeforeContentLoaded = `
  (function() {
    // 强制高德组件读取安全密钥，解决搜不到位置、列表空白的问题
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

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 24 }}>
      <NavBar
        title="创建愿望"
        rightContent={
          <TouchableOpacity
            style={{
              padding: 8,
              backgroundColor: "rgba(255, 77, 115, 0.12)",
              borderRadius: 16,
            }}
            onPress={() => toast.info("下一步")}
          >
            <Text style={{ fontWeight: "bold", color: "#FF6B8B" }}>下一步</Text>
          </TouchableOpacity>
        }
      />
      <TouchableOpacity
        style={styles.coverTouchable}
        activeOpacity={0.8}
        onPress={onPressSelectImage}
      >
        {/* 第一层：基础纵向渐变（从浅粉到白） */}
        <LinearGradient
          colors={["#FFE5E9", "#FFFFFF"]}
          start={[1, 1]}
          end={[1, 0]}
          style={StyleSheet.absoluteFill} // 铺满父容器
        />

        {/* 第二层：叠加一个横向的微弱渐变（例如左侧补充一点微黄或更深的粉，右侧透明） */}
        <LinearGradient
          colors={["rgba(255, 182, 193, 0.4)", "transparent"]}
          start={[1, 0]}
          end={[0, 0]} // 横向渐变
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.contentContainer}>
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <Column center>
              <Camera color={"#ffadba"} height={36} width={36} />
              <Text>添加封面</Text>
            </Column>
          )}
        </View>
      </TouchableOpacity>
      <Column gap={8}>
        <Text style={{ fontWeight: "bold" }}>愿望标题</Text>
        <TextInput
          placeholder="输入愿望标题"
          style={[styles.wishInput, { borderWidth: 1, borderColor: "#E5E5E5" }]}
        />
      </Column>
      <Column gap={8}>
        <Text style={{ fontWeight: "bold" }}>愿望描述</Text>
        <View style={styles.container}>
          <TextInput
            placeholder="输入愿望描述"
            style={[
              styles.wishInput,
              {
                textAlignVertical: "top",
                minHeight: 90,
                paddingBottom: 32,
              },
            ]}
            multiline
            maxLength={maxLength}
            onChangeText={(val) => setText(val)}
            value={text}
          />
          <Text style={styles.counterText}>
            {text.length}/{maxLength}
          </Text>
        </View>
      </Column>

      {menus.map((item, index) => (
        <TouchableOpacity key={index} onPress={item.onPress}>
          <Row items="center" content="space-between">
            <Text style={styles.menuTitle}>{item.label}</Text>
            <Row items="center" gap={8}>
              <Text style={styles.menuValue}>{item.value}</Text>
              <ChevronRight color="#999" />
            </Row>
          </Row>
        </TouchableOpacity>
      ))}

      <DatePicker
        modal
        open={openDatePicker}
        date={date}
        locale="zh-Hans" // 设置语言为中文
        mode="date" // 基础模式为日期选择
        title={"选择时间"}
        confirmText="确定"
        cancelText="取消"
        onConfirm={(selectedDate) => {
          setOpenDatePicker(false);

          setDate(selectedDate);
        }}
        onCancel={() => {
          setOpenDatePicker(false);
        }}
      />

      {/* 地图选择弹窗 */}
      {/* 地图选择弹窗 */}
      <Modal
        visible={openMapPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOpenMapPicker(false)}
      >
        <View style={styles.modalOverlayContainer}>
          <TouchableOpacity
            style={styles.topMaskView}
            activeOpacity={1}
            onPress={() => setOpenMapPicker(false)}
          />

          <View style={styles.mapModalContent}>
            {/* 顶栏操作 */}
            <Row
              items="center"
              content="space-between"
              style={styles.modalHeader}
            >
              <View style={{ width: 40 }} />
              <Text style={styles.modalTitle}>选择地点</Text>

              <TouchableOpacity onPress={() => setOpenMapPicker(false)}>
                <Text style={styles.closeText}>关闭</Text>
              </TouchableOpacity>
            </Row>

            {/* Webview 地图核心部分 */}
            <View style={styles.mapWebviewWrapper}>
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
      {/* 注释：预算输入弹窗 */}
      <Modal
        visible={openBudgetPicker}
        animationType="slide"
        transparent={true} // 注释：开启半透明遮罩效果
        onRequestClose={() => setOpenBudgetPicker(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, gap: 16 }}>
              {/* 注释：点击遮罩层可以关闭弹窗 */}
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setOpenBudgetPicker(false)}
              >
                {/* 注释：底部弹出的输入框卡片 */}
                <View
                  style={styles.budgetModalContent}
                  onStartShouldSetResponder={() => true}
                >
                  <Row
                    items="center"
                    content="space-between"
                    style={{ width: "100%", marginBottom: 16 }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                      设置预算金额
                    </Text>
                    <TouchableOpacity
                      onPress={() => setOpenBudgetPicker(false)}
                    >
                      <Text style={{ color: "#FF6B8B", fontWeight: "bold" }}>
                        确定
                      </Text>
                    </TouchableOpacity>
                  </Row>

                  <View style={styles.budgetInputWrapper}>
                    <Text style={styles.budgetCurrency}>￥</Text>
                    <TextInput
                      style={styles.budgetTextInput}
                      keyboardType="numeric" // 注释：拉起纯数字键盘
                      placeholder="0"
                      value={budget}
                      maxLength={8}
                      autoFocus={true} // 注释：弹窗出现时自动聚焦拉起键盘
                      onChangeText={(text) =>
                        setBudget(text.replace(/[^0-9]/g, ""))
                      } // 注释：过滤掉非数字
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  coverTouchable: {
    width: "100%",
    aspectRatio: 16 / 9,
    alignSelf: "center",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 139, 0.2)",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "transparent",
  },
  wishInput: {
    borderRadius: 12,
    padding: 12,
  },
  container: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    position: "relative",
  },
  counterText: {
    position: "absolute",
    right: 8,
    bottom: 4,
    fontSize: 12,
    color: "#999",
  },
  menuTitle: {
    fontWeight: "bold",
  },
  menuValue: {
    color: "#999",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-end",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  closeText: {
    fontSize: 16,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end", //让内容靠底部排列
  },

  modalOverlayContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // 整个屏幕的半透明黑
    justifyContent: "flex-end",
  },

  // 上半部分的独立点击关闭区域
  topMaskView: {
    flex: 1,
    width: "100%",
  },

  // 地图半屏卡片
  mapModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "60%", // 固定高度
    width: "100%",
    overflow: "hidden",
  },

  mapWebviewWrapper: {
    flex: 1,
    width: "100%",
  },

  modalHeader: {
    height: 54,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },

  // 注释：底部输入卡片容器
  budgetModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  // 注释：输入框包裹器
  budgetInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#FF6B8B",
    width: "100%",
    paddingBottom: 8,
  },
  // 注释：货比符号样式
  budgetCurrency: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6B8B",
    marginRight: 8,
  },
  // 注释：弹窗内输入框本体样式
  budgetTextInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C1C1E",
    padding: 0, // 注释：清除 Android 默认内边距
  },
});
