import { Column, Row } from "@/components/layout";
import { Image, Text, View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagesWishFinishPng, ImagesCoverPng } from "@/assets";
import { LinearGradient } from "expo-linear-gradient";
import { PinkButton, toast } from "@/components/common";

export default function Finish() {
  // TODO: 先写死数据，后续对接接口
  const finishData = [
    {
      title: "一起去看海",
      value: "2024.05.03",
    },
    {
      title: "持续时间",
      value: "3天",
    },
    {
      title: "共同回忆",
      value: "123条记录",
    },
  ];

  const finishImages = [ImagesCoverPng, ImagesCoverPng, ImagesCoverPng];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={["#FFE5E9", "#FFFFFF"]}
          start={[1, 0]}
          end={[1, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Image source={ImagesWishFinishPng} style={styles.headerImage} />
      </View>
      <SafeAreaView style={styles.contentArea}>
        <Column gap={24} center>
          <Text style={styles.title}>愿望完成啦！🎉</Text>
          <Text style={styles.subtitle}>一起去看海</Text>
          <Row gap={16}>
            {finishData.map((item, index) => (
              <Column key={index} center gap={8} style={styles.finishDataCard}>
                <Text>{item.title}</Text>
                <Text>{item.value}</Text>
              </Column>
            ))}
          </Row>
          <Row gap={12} center>
            {finishImages?.map((image, index) => (
              <Image key={index} source={image} style={styles.memoryImage} />
            ))}
          </Row>
          {/*TODO: 这里看看能不能用AI总结 */}
          <Text
            style={styles.summary}
          >{`“和你一起看海的每一刻，”\n          都是我最珍贵的回忆 ❤`}</Text>
        </Column>
        <PinkButton
          text="查看回忆"
          onPress={() => toast.info("跳转到回忆页面")}
          style={styles.footerButton}
        />
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flexGrow: 1,
  },
  headerBackground: {
    paddingTop: 80,
  },
  headerImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },
  contentArea: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  finishDataCard: {
    backgroundColor: "#FFE5E9AA",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 139, 0.2)",
  },
  memoryImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
    borderRadius: 8,
  },
  summary: {
    fontWeight: "bold",
    fontSize: 16,
  },
  footerButton: {
    marginTop: "auto",
  },
});
