import { Column, Row } from "@/components/layout";
import {
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ImagesAvatarFemalePng } from "@/assets";
import {
  ChevronRight,
  ShieldCog,
  Bell,
  LockKeyhole,
  Settings,
  Info,
  LucideProps,
} from "lucide-react-native";
import React from "react";
import { PinkButton, toast } from "@/components/common";
import { useAuth } from "@/app/features/auth/auth-context";

interface SettingItem {
  id: string;
  title: string;
  icon: React.ComponentType<LucideProps>; // 约束图标名称
  onPress: () => void;
}

export default function Mine() {
  const { signOut } = useAuth();
  const settingList: SettingItem[] = [
    {
      id: "security",
      title: "账号与安全",
      icon: ShieldCog,
      onPress: () => toast.info("账号与安全"),
    },
    {
      id: "notification",
      title: "通知设置",
      icon: Bell,
      onPress: () => toast.info("通知设置"),
    },
    {
      id: "privacy",
      title: "隐私设置",
      icon: LockKeyhole,
      onPress: () => toast.info("隐私设置"),
    },
    {
      id: "general",
      title: "通用设置",
      icon: Settings,
      onPress: () => toast.info("通用设置"),
    },
    {
      id: "about",
      title: "关于我们",
      icon: Info,
      onPress: () => toast.info("关于我们"),
    },
  ];

  const handleSignOut = () => {
    signOut();
    toast.success("退出登录成功");
  };

  return (
    <ScrollView
      contentContainerStyle={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <Column gap={12}>
        <Text style={styles.title}>设置</Text>
        <TouchableOpacity onPress={() => toast.info("个人信息")}>
          <Row
            items="center"
            content="space-between"
            style={{
              padding: 12,
              backgroundColor: "#fff",
              borderRadius: 12,
              height: 110,
            }}
          >
            <Row gap={12} items="center">
              <Image
                source={ImagesAvatarFemalePng}
                style={{ width: 64, height: 64, borderRadius: 32 }}
              />

              <Column gap={4}>
                <Text style={{ fontSize: 16 }}>我的昵称</Text>
                <Text style={{ fontSize: 14, color: "#666" }}>个人信息</Text>
              </Column>
            </Row>

            <ChevronRight size={24} color={"#999595"} />
          </Row>
        </TouchableOpacity>

        {settingList.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.SettingItem}
            onPress={item.onPress}
          >
            <Row content="space-between" items="center">
              <Row gap={12} items="center">
                <item.icon size={24} color={"#999595"} />
                <Text style={{ fontSize: 16 }}>{item.title}</Text>
              </Row>
              <ChevronRight size={24} color={"#999595"} />
            </Row>
          </TouchableOpacity>
        ))}
        <PinkButton text="退出登录" onPress={handleSignOut} />
      </Column>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  SettingItem: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
});
