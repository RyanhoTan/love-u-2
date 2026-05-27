import { Column } from "@/components/layout";
import { Image, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagesWishFinishPng } from "@/assets";

export default function Finish() {
  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Image
        source={ImagesWishFinishPng}
        style={{ width: "100%", height: 200, resizeMode: "contain" }}
      />
      <Column>
        <Text>愿望已完成</Text>
      </Column>
    </SafeAreaView>
  );
}
