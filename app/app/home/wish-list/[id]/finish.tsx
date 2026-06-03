import { PinkButton } from "@/components/common";
import { Column, Row } from "@/components/layout";
import { ImagesCoverPng, ImagesWishFinishPng } from "@/assets";
import { colors } from "@/styles/colors";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Finish() {
  const { id } = useLocalSearchParams();

  const finishData = [
    {
      title: "一起看海",
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
          colors={[colors.theme.primaryTint, colors.semantic.page]}
          start={[1, 0]}
          end={[1, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Image source={ImagesWishFinishPng} style={styles.headerImage} />
      </View>
      <SafeAreaView style={styles.contentArea}>
        <Column gap={24} center>
          <Text style={styles.title}>愿望完成啦！</Text>
          <Text style={styles.subtitle}>一起看海</Text>
          <Row gap={16}>
            {finishData.map((item) => (
              <Column
                key={item.title}
                center
                gap={8}
                style={styles.finishDataCard}
              >
                <Text>{item.title}</Text>
                <Text>{item.value}</Text>
              </Column>
            ))}
          </Row>
          <Row gap={12} center>
            {finishImages.map((image, index) => (
              <Image key={index} source={image} style={styles.memoryImage} />
            ))}
          </Row>
          <Text style={styles.summary}>
            “和你一起看海的每一刻，都是我最珍贵的回忆。”
          </Text>
        </Column>
        <PinkButton
          text="查看回忆"
          onPress={() => router.push(`/home/wish-list/${id}/memory`)}
          style={styles.footerButton}
        />
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.semantic.page,
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
    backgroundColor: colors.semantic.page,
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
    backgroundColor: colors.theme.primaryTint,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.theme.primaryBorder,
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
