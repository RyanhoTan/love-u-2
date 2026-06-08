import { router } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagesWishFinishPng } from "@/assets";
import { NavBar, PinkButton } from "@/components/common";
import { Column, Row } from "@/components/layout";

const PARTNER_LEFT = "Ryanho";
const PARTNER_RIGHT = "小可爱";

export default function CoupleSpaceFinishScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <NavBar title="情侣绑定" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Column items="center" gap={16}>
          <Image
            source={ImagesWishFinishPng}
            style={styles.heroImage}
            resizeMode="contain"
          />

          <Text style={styles.title}>绑定成功</Text>

          <Row items="center" gap={8} style={styles.nameRow}>
            <Text style={styles.name}>{PARTNER_LEFT}</Text>
            <Text style={styles.separator}>&</Text>
            <Text style={styles.name}>{PARTNER_RIGHT}</Text>
          </Row>

          <Text style={styles.subtitle}>你们已经成功绑定情侣空间</Text>
          <Text style={styles.description}>一起记录更多美好回忆吧！</Text>
        </Column>

        <View style={styles.footer}>
          <PinkButton
            text="完成"
            onPress={() => router.replace("/home/(tabs)/mine")}
            style={styles.button}
          />
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
  },
  heroImage: {
    width: "100%",
    height: 220,
    marginTop: 12,
  },
  title: {
    marginTop: 8,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "800",
    color: "#FF4F7A",
    textAlign: "center",
  },
  nameRow: {
    marginTop: 8,
  },
  name: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#2E2430",
  },
  separator: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "700",
    color: "#FF4F7A",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 22,
    color: "#7E6E78",
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#7E6E78",
    textAlign: "center",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 28,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 14,
  },
});
