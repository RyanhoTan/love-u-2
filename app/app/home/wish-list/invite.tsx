import { NavBar, PinkButton, toast } from "@/components/common";
import { Column, Row } from "@/components/layout";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagesWishHugHeartPng } from "@/assets";
import { ReceiptText, Gift, Bell } from "lucide-react-native";

export default function WishListInviteScreen() {
  const cardList = [
    { Icon: Gift, text: "愿望详情" },
    { Icon: ReceiptText, text: "你的描述和计划" },
    { Icon: Bell, text: "后续的更新和通知" },
  ];
  return (
    <SafeAreaView style={styles.container}>
      <NavBar />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Column flex={1} items="center" gap={24}>
          <Text style={styles.title}>邀请另一半一起完成愿望</Text>
          <Text style={styles.subtitle}>分享这个愿望给Ta</Text>
          <Image source={ImagesWishHugHeartPng} style={styles.image} />
          {/* TODO: 替换真实标题 */}
          <Text style={styles.title}>这里是愿望标题</Text>
          <Text style={styles.subtitle}>希望你能和我一起完成这个愿望</Text>
          <Column style={styles.card}>
            <Text style={styles.cardTitle}>对方将收到</Text>

            {cardList.map(({ Icon, text }, index) => (
              <Row key={index} items="center" gap={12}>
                <Icon color={"#FF6B8B"} />
                <Text>{text}</Text>
              </Row>
            ))}
          </Column>
        </Column>

        <View style={{ marginTop: "auto" }}>
          <PinkButton text="发送邀请" onPress={() => toast.info("发送邀请")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
  },
  image: {
    width: "100%",
    height: 220,
  },
  card: {
    width: "100%",
    borderWidth: 2,
    borderColor: "rgba(255, 107, 139, 0.2)",
    padding: 16,
    borderRadius: 8,
    gap: 18,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
