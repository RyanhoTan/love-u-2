import { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "@/components/common";
import { Column, Row } from "@/components/layout";
import { useAuth } from "@/app/features/auth/auth-context";
import {
  IconsAuthHeartSvg,
  IconsAuthWechatSvg,
  ImagesAuthBackgroundPng,
} from "@/assets";

export default function Auth() {
  const router = useRouter();
  const { isAuthenticated, signIn, status } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      toast.error("请输入手机号/邮箱和密码");
      return;
    }

    try {
      await signIn(username.trim(), password);
      router.replace("/home");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "登录失败，请稍后重试";
      toast.error(message);
    }
  };

  return (
    <ImageBackground source={ImagesAuthBackgroundPng} style={{ flex: 1 }}>
      <SafeAreaView
        style={{ paddingVertical: 24, paddingHorizontal: 36, flex: 1, gap: 16 }}
      >
        <Column style={{ marginTop: 120 }}>
          <Row items="center" gap={2}>
            <Text style={{ fontSize: 23 }}>欢迎回来 </Text>
            <IconsAuthHeartSvg width={24} height={24} />
          </Row>
          <Text style={{ fontSize: 16, color: "#666", marginTop: 19 }}>
            登录后即可开启你们的专属空间
          </Text>
        </Column>
        <Column gap={16} style={{ marginTop: 40 }}>
          <TextInput
            placeholder="手机号/邮箱"
            keyboardType="numeric"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            placeholder="密码"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={{
              alignSelf: "flex-end",
              justifyContent: "center",
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ color: "#8b8a8a" }}>忘记密码？</Text>
          </TouchableOpacity>
        </Column>
        <Column gap={12}>
          <TouchableOpacity
            disabled={status === "loading"}
            style={styles.loginButton}
            onPress={() => {
              handleLogin();
            }}
          >
            <Text style={{ color: "#fff" }}>
              {status === "loading" ? "登录中..." : "登录"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signUpButton}>
            <Text>注册</Text>
          </TouchableOpacity>
          <Text
            style={{ color: "#8b8a8a", alignSelf: "center", marginTop: 120 }}
          >
            其他登录方式
          </Text>
          <Row gap={24} content="center">
            <TouchableOpacity>
              <IconsAuthWechatSvg />
            </TouchableOpacity>
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
  loginButton: {
    backgroundColor: "#ff3b68",
    height: 44,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  signUpButton: {
    borderWidth: 1,
    borderColor: "#ff3b68",
    height: 44,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
