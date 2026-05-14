import { NavBar } from "@/components/common/nav-bar";
import { Column } from "@/components/layout";
import { Text, Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Status() {
  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
      <NavBar title="今日状态" />
      <Column gap={20} flex={1}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 48 }}>
          对方的状态
        </Text>
        <View style={{ position: "relative" }}>
          <Image
            resizeMode="cover"
            source={require("@/assets/images/status/pink-bear.png")}
            style={{
              width: "100%",
              maxHeight: 200,
              borderRadius: 16,
              borderWidth: 5,
              borderColor: "#ffcad3",
              alignSelf: "center",
            }}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              paddingVertical: 16,
              paddingHorizontal: 24,
              backgroundColor: "#ffbcc5",
              borderRadius: 32,
              alignSelf: "flex-start",
              position: "absolute",
              top: 30,
              left: 60,
            }}
          >
            想你
          </Text>
        </View>
      </Column>
    </SafeAreaView>
  );
}
