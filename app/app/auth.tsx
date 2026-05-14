import { Column, Row } from "@/components/layout";
import {
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WeChat, Apple, QQ, Heart } from "@/assets/icons/auth";
import { AuthBackground } from "@/assets/images/auth";
import { useRouter } from "expo-router";

export default function Auth() {
  const router = useRouter();
  return (
    <ImageBackground source={AuthBackground} style={{ flex: 1 }}>
      <SafeAreaView
        style={{ paddingVertical: 24, paddingHorizontal: 36, flex: 1, gap: 16 }}
      >
        <Column style={{ marginTop: 120 }}>
          <Row items="center" gap={2}>
            <Text style={{ fontSize: 23 }}>欢迎回来 </Text>
            <Heart width={24} height={24} />
          </Row>
          <Text style={{ fontSize: 16, color: "#666", marginTop: 19 }}>
            登陆后即可开启你们的专属空间
          </Text>
        </Column>
        <Column gap={16} style={{ marginTop: 40 }}>
          <TextInput
            placeholder="手机号/邮箱"
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput placeholder="密码" secureTextEntry style={styles.input} />
          <TouchableOpacity
            style={{
              alignSelf: "flex-end",
              justifyContent: "center",
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ color: "#8b8a8a" }}>忘记密码?</Text>
          </TouchableOpacity>
        </Column>
        <Column gap={12}>
          {/* TODO: 点击事件 */}
          <TouchableOpacity
            style={{
              backgroundColor: "#ff3b68",
              height: 44,
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {
              router.push("/home");
            }}
          >
            <Text style={{ color: "#fff" }}>登录</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: "#ff3b68",
              height: 44,
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text>注册</Text>
          </TouchableOpacity>
          <Text
            style={{ color: "#8b8a8a", alignSelf: "center", marginTop: 120 }}
          >
            其他登录方式
          </Text>
          <Row gap={24} content="center">
            <TouchableOpacity>
              <WeChat />
            </TouchableOpacity>
            {/* <TouchableOpacity style={{ height: 24, width: 24 }}><Apple/></TouchableOpacity>
        <TouchableOpacity style={{ height: 24, width: 24 }}><QQ/></TouchableOpacity> */}
          </Row>
        </Column>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 15,
    paddingHorizontal: 12,
  },
});
