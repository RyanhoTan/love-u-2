import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  BarChart3,
  Bell,
  ChevronRight,
  Heart,
  Info,
  LucideProps,
  Palette,
  Shield,
  User,
} from "lucide-react-native";
import { ImagesAvatarMalePng } from "@/assets";
import { toast } from "@/components/common";
import { Row } from "@/components/layout";
import { useAuth } from "@/app/features/auth/auth-context";

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<LucideProps>;
  iconColor: string;
  onPress: () => void;
}

export default function Mine() {
  const router = useRouter();
  const { signOut, user } = useAuth();

  const menuItems: MenuItem[] = [
    {
      id: "profile",
      title: "个人资料",
      icon: User,
      iconColor: "#4A90FF",
      onPress: () => router.push("/home/profile"),
    },
    {
      id: "space",
      title: "情侣空间",
      icon: Heart,
      iconColor: "#FF5C8A",
      onPress: () => router.push("/home/couple-space/bind"),
    },
    {
      id: "notification",
      title: "通知设置",
      icon: Bell,
      iconColor: "#FFB020",
      onPress: () => router.push("/home/notification-settings"),
    },
    {
      id: "theme",
      title: "主题换肤",
      icon: Palette,
      iconColor: "#6C63FF",
      onPress: () => toast.info("主题换肤"),
    },
    {
      id: "report",
      title: "恋爱报告",
      icon: BarChart3,
      iconColor: "#9C4DFF",
      onPress: () => toast.info("恋爱报告"),
    },
    {
      id: "privacy",
      title: "隐私与安全",
      icon: Shield,
      iconColor: "#5A6BFF",
      onPress: () => toast.info("隐私与安全"),
    },
    {
      id: "about",
      title: "关于我们",
      icon: Info,
      iconColor: "#3EA0FF",
      onPress: () => toast.info("关于我们"),
    },
  ];

  const handleSignOut = () => {
    signOut();
    toast.success("退出登录成功");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Image source={ImagesAvatarMalePng} style={styles.avatar} />

        <View style={styles.profileText}>
          <Text style={styles.username}>{user?.username || "Ryanho"}</Text>

          <Row items="center" gap={6} style={styles.badge}>
            <Text style={styles.badgeText}>Sweet Boy</Text>
          </Row>
        </View>
      </View>

      <View style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              index < menuItems.length - 1 && styles.menuItemBorder,
            ]}
            onPress={item.onPress}
            activeOpacity={0.85}
          >
            <Row items="center" content="space-between">
              <Row items="center" gap={14}>
                <View style={styles.iconWrap}>
                  <item.icon
                    size={18}
                    color={item.iconColor}
                    strokeWidth={2.2}
                  />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
              </Row>

              <ChevronRight size={18} color="#C8C6D1" />
            </Row>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        activeOpacity={0.85}
      >
        <Text style={styles.signOutText}>退出登录</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingTop: 12,
    paddingBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 10,
    paddingVertical: 18,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FDE8ED",
  },
  profileText: {
    gap: 10,
  },
  username: {
    fontSize: 30,
    fontWeight: "700",
    color: "#2E2430",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  badgeText: {
    fontSize: 14,
    color: "#8F6C79",
    fontWeight: "600",
  },
  menuCard: {
    marginTop: 10,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#F4A7B9",
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  menuItem: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F2E4EA",
  },
  iconWrap: {
    width: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    fontSize: 18,
    color: "#34313B",
    fontWeight: "500",
  },
  signOutButton: {
    marginTop: 18,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 238, 242, 0.95)",
  },
  signOutText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF5C84",
  },
});
