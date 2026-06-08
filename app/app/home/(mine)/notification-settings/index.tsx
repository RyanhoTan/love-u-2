import { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, CalendarHeart, MessageCircle, Moon } from "lucide-react-native";
import { NavBar, PinkButton, toast } from "@/components/common";
import { Column, Row } from "@/components/layout";

export default function NotificationSettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [anniversaryRemindersEnabled, setAnniversaryRemindersEnabled] =
    useState(true);
  const [chatRemindersEnabled, setChatRemindersEnabled] = useState(true);
  const [activityRemindersEnabled, setActivityRemindersEnabled] =
    useState(false);
  const [systemAnnouncementsEnabled, setSystemAnnouncementsEnabled] =
    useState(true);

  const handleMasterSwitch = (value: boolean) => {
    setNotificationsEnabled(value);

    if (!value) {
      setAnniversaryRemindersEnabled(false);
      setChatRemindersEnabled(false);
      setActivityRemindersEnabled(false);
      setSystemAnnouncementsEnabled(false);

      return;
    }

    setAnniversaryRemindersEnabled(true);
    setChatRemindersEnabled(true);
    setActivityRemindersEnabled(true);
    setSystemAnnouncementsEnabled(true);
  };

  const handleSave = () => {
    toast.success("通知设置已保存");
  };

  const settingItems = [
    {
      icon: CalendarHeart,
      iconColor: "#FF6B8B",
      title: "纪念日提醒",
      desc: "生日、恋爱纪念日提前提醒",
      value: anniversaryRemindersEnabled,
      onValueChange: setAnniversaryRemindersEnabled,
    },
    {
      icon: MessageCircle,
      iconColor: "#4A90FF",
      title: "聊天提醒",
      desc: "对方发来消息时立即通知",
      value: chatRemindersEnabled,
      onValueChange: setChatRemindersEnabled,
    },
    {
      icon: Moon,
      iconColor: "#8A6CFF",
      title: "动态提醒",
      desc: "对方发布新动态时及时提醒",
      value: activityRemindersEnabled,
      onValueChange: setActivityRemindersEnabled,
    },
    {
      icon: Bell,
      iconColor: "#FFB020",
      title: "系统公告",
      desc: "接收版本更新和系统消息",
      value: systemAnnouncementsEnabled,
      onValueChange: setSystemAnnouncementsEnabled,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavBar title="通知设置" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Row items="center" content="space-between" style={styles.row}>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>全部通知</Text>
              <Text style={styles.rowDesc}>关闭后将暂停所有推送</Text>
            </View>

            <Switch
              value={notificationsEnabled}
              onValueChange={handleMasterSwitch}
              trackColor={{ false: "#E9DDE3", true: "#FF8BAB" }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E9DDE3"
            />
          </Row>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>提醒类型</Text>
          <Text style={styles.sectionHint}>可按需开启不同提醒</Text>
        </View>

        <View style={styles.card}>
          {settingItems.map((item, index) => (
            <View key={item.title}>
              <SettingRow
                icon={item.icon}
                iconColor={item.iconColor}
                title={item.title}
                desc={item.desc}
                value={item.value}
                onValueChange={item.onValueChange}
                disabled={!notificationsEnabled}
              />
              {index < settingItems.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </View>
          ))}
        </View>

        <PinkButton
          text="保存设置"
          onPress={handleSave}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

type SettingRowProps = {
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  iconColor: string;
  title: string;
  desc: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

function SettingRow({
  icon: Icon,
  iconColor,
  title,
  desc,
  value,
  onValueChange,
  disabled = false,
}: SettingRowProps) {
  return (
    <Row
      items="center"
      content="space-between"
      style={[styles.row, disabled && styles.rowDisabled]}
    >
      <Row items="center" gap={12} style={styles.rowTextWrap}>
        <View style={[styles.iconWrap, { backgroundColor: `${iconColor}15` }]}>
          <Icon size={18} color={iconColor} strokeWidth={2.2} />
        </View>

        <Column gap={4} style={styles.rowTextWrap}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowDesc}>{desc}</Text>
        </Column>
      </Row>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E9DDE3", true: "#FF8BAB" }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E9DDE3"
        disabled={disabled}
      />
    </Row>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 18,
  },
  sectionHeader: {
    gap: 4,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2E2430",
  },
  sectionHint: {
    fontSize: 13,
    color: "#9B8993",
  },
  card: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowDisabled: {
    opacity: 0.55,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    color: "#2E2430",
  },
  rowDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: "#8F7D88",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#F2E4EA",
    marginLeft: 68,
  },
  saveButton: {
    marginTop: 2,
    borderRadius: 16,
    paddingVertical: 14,
  },
});
