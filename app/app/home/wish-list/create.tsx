import { NavBar } from "@/components/common";
import { Column } from "@/components/layout";
import { Camera } from "lucide-react-native";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";

export default function CreateWishList() {
  const [text, setText] = useState("");
  const maxLength = 200; // 设置最大字数限制为 200 字
  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 24 }}>
      <NavBar title="创建愿望" />
      <TouchableOpacity style={styles.coverTouchable} activeOpacity={0.8}>
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
          <Column center>
            <Camera color={"#ffadba"} height={36} width={36} />
            <Text>添加封面</Text>
          </Column>
        </View>
      </TouchableOpacity>
      <Column gap={8}>
        <Text>愿望标题</Text>
        <TextInput
          placeholder="输入愿望标题"
          style={[styles.wishInput, { borderWidth: 1, borderColor: "#E5E5E5" }]}
        />
      </Column>
      <Column gap={8}>
        <Text>愿望描述</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  coverTouchable: {
    width: "100%",
    height: 150,
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
    right: 12,
    bottom: 12,
    fontSize: 12,
    color: "#999",
  },
});
