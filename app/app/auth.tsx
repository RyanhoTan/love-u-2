import { useState } from "react";
import { useRouter } from "expo-router";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "@/components/common";
import { register } from "@/app/features/auth/api";
import { useAuth } from "@/app/features/auth/auth-context";
import { Column, Row } from "@/components/layout";
import {
  IconsAuthHeartSvg,
  IconsAuthWechatSvg,
  ImagesAuthBackgroundPng,
} from "@/assets";

export default function Auth() {
  const router = useRouter();
  const { setUserSession } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername || !password) {
      toast.error("请输入账号和密码");
      return;
    }

    if (!confirmPassword) {
      toast.error("请再次输入密码");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }

    try {
      setIsSubmitting(true);
      await register(trimmedUsername, password);
      setUserSession({ id: 0, username: trimmedUsername });
      toast.success("注册成功");
      router.replace("/auth");
    } catch (error) {
      const message = error instanceof Error ? error.message : "注册失败，请稍后重试";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
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
            注册后即可开启你们的专属空间
          </Text>
        </Column>
        <Column gap={16} style={{ marginTop: 40 }}>
          <TextInput
            placeholder="手机号 / 邮箱 / 用户名"
            autoCapitalize="none"
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
          {showConfirmPassword ? (
            <TextInput
              placeholder="确认密码"
              secureTextEntry
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          ) : (
            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={{ color: "#8b8a8a" }}>忘记密码？</Text>
            </TouchableOpacity>
          )}
        </Column>
        <Column gap={12}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => {
              toast.info("登录接口已移除，请使用注册按钮");
            }}
          >
            <Text style={{ color: "#fff" }}>登录</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isSubmitting}
            style={styles.signUpButton}
            onPress={() => {
              if (!showConfirmPassword) {
                setShowConfirmPassword(true);
                return;
              }

              setShowConfirmPassword(true);
              void handleRegister();
            }}
          >
            <Text>{isSubmitting ? "注册中..." : "注册"}</Text>
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
  forgotPasswordButton: {
    alignSelf: "flex-end",
    justifyContent: "center",
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
