import { useMemo, useState } from "react";
import { ScrollView, Text, View, Image } from "react-native";
import { Column, Row } from "../layout";
import { ImagesCoverPng } from "@/assets";

const COLUMNS = 3; // 每行精确显示 3 列
const PAGE_PADDING = 12; // 整个页面左、右两边的安全内边距
const IMAGE_GAP = 8; // 照片与照片之间的缝隙大小

export function Photos() {
  const [gridWidth, setGridWidth] = useState(0);
  const imageSize = useMemo(() => {
    if (!gridWidth) return 0;

    return Math.floor((gridWidth - IMAGE_GAP * (COLUMNS - 1)) / COLUMNS);
  }, [gridWidth]);

  const photos = [
    {
      id: 1,
      time: "2023年8月",
      source: [
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
        ImagesCoverPng,
      ],
    },
    { id: 2, time: "2023年7月", source: [ImagesCoverPng] },
    {
      id: 3,
      time: "2023年6月",
      source: [ImagesCoverPng, ImagesCoverPng, ImagesCoverPng],
    },
  ];
  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: PAGE_PADDING,
        paddingVertical: 16,
      }}
    >
      {photos.map((photo) => (
        <Column key={photo.id}>
          <Row
            items="center"
            content="space-between"
            style={{ marginBottom: 16 }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              {photo.time}
            </Text>
            <Text style={{ fontSize: 14, color: "#aaa" }}>
              {photo.source.length}张
            </Text>
          </Row>
          <View
            onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}
            style={{
              flexWrap: "wrap",
              flex: 1,
              flexDirection: "row",
              paddingBottom: 30,
              gap: IMAGE_GAP,
            }}
          >
            {imageSize > 0 &&
              photo.source.map((src, index) => (
                <Image
                  key={index}
                  source={src}
                  style={{
                    width: imageSize,
                    height: imageSize,
                    borderRadius: 8,
                  }}
                />
              ))}
          </View>
        </Column>
      ))}
    </ScrollView>
  );
}
