import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagesAvatarFemalePng, ImagesAvatarMalePng } from "@/assets";
import { NavBar, toast } from "@/components/common";
import { Column, Row } from "@/components/layout";

const PARTNER_LEFT = "Ryanho";
const PARTNER_RIGHT = "小可爱";

export default function CoupleSpaceFinishScreen() {
  const handleUnbind = () => {
    toast.info("解除绑定功能待接入");
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavBar title="情侣空间" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Column items="center" gap={14}>
          <Row
            items="center"
            content="center"
            gap={14}
            style={styles.avatarRow}
          >
            <Image source={ImagesAvatarMalePng} style={styles.avatar} />
            <Text style={styles.heroSeparator}>&</Text>
            <Image source={ImagesAvatarFemalePng} style={styles.avatar} />
          </Row>

          <Row items="center" gap={8} style={styles.nameRow}>
            <Text style={styles.name}>{PARTNER_LEFT}</Text>
            <Text style={styles.nameSeparator}>&</Text>
            <Text style={styles.name}>{PARTNER_RIGHT}</Text>
          </Row>

          <View style={styles.statusPill}>
            <Text style={styles.statusText}>已绑定</Text>
          </View>
        </Column>

        <View style={styles.card}>
          <Row items="center" content="space-between" style={styles.infoRow}>
            <Text style={styles.infoLabel}>恋爱开始</Text>
            <Text style={styles.infoValue}>2025.01.01</Text>
          </Row>
          <View style={styles.divider} />
          <Row items="center" content="space-between" style={styles.infoRow}>
            <Text style={styles.infoLabel}>恋爱天数</Text>
            <Text style={styles.infoValue}>520 天</Text>
          </Row>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.unbindButton}
            onPress={handleUnbind}
          >
            <Text style={styles.unbindText}>解除绑定</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#FFF9FB",
  },
  content: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 18,
  },
  avatarRow: {
    marginTop: 8,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#FDE8ED",
  },
  heroSeparator: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
    color: "#FF4F7A",
  },
  nameRow: {
    marginTop: 2,
  },
  name: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "700",
    color: "#2E2430",
  },
  nameSeparator: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "800",
    color: "#FF4F7A",
  },
  statusPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#FFE6EE",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF4F7A",
  },
  card: {
    borderWidth: 1,
    borderColor: "#F0DDE4",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    shadowColor: "#F3A9BB",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  infoRow: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  infoLabel: {
    fontSize: 15,
    lineHeight: 22,
    color: "#7E6E78",
  },
  infoValue: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    color: "#2E2430",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#F2E4EA",
    marginHorizontal: 18,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 28,
  },
  unbindButton: {
    borderWidth: 1.5,
    borderColor: "#FF4F7A",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  unbindText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF4F7A",
  },
});
