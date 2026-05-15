import { NavBar } from "@/components/common";
import { Column, Row } from "@/components/layout";
import {
  Text,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  IconsHomeStatusSadSvg,
  IconsHomeStatusShockSvg,
  IconsHomeStatusMissYouSvg,
  IconsHomeStatusHappySvg,
  IconsHomeStatusAngrySvg,
} from "@/assets";
import { toast } from "@/components/common/toast";
import { PinkButton } from "@/components/common/pink-button";

const STATUS_ICONS = [
  { id: "happy", name: "开心", Icon: IconsHomeStatusHappySvg },
  { id: "missYou", name: "想你", Icon: IconsHomeStatusMissYouSvg },
  { id: "sad", name: "难过", Icon: IconsHomeStatusSadSvg },
  { id: "angry", name: "生气", Icon: IconsHomeStatusAngrySvg },
  { id: "shock", name: "惊讶", Icon: IconsHomeStatusShockSvg },
];

export default function Status() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16, gap: 16 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1, gap: 16 }}>
            <ScrollView
              contentContainerStyle={{ minHeight: "100%", gap: 16 }}
              showsVerticalScrollIndicator={false}
            >
              <Column gap={20} flex={1}>
                <NavBar title="今日状态" />

                <Text style={styles.statusText}>对方的状态</Text>
                <View style={{ position: "relative" }}>
                  <Image
                    resizeMode="cover"
                    source={require("@/assets/images/status/pink-bear.png")}
                    style={{
                      width: "100%",
                      height: 200,
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
                <Text style={styles.statusText}>我的状态</Text>

                <Row>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 16 }}
                  >
                    {STATUS_ICONS.map(({ id, name, Icon }) => (
                      <Column key={id} gap={8} center>
                        <TouchableOpacity
                          style={{ gap: 12 }}
                          onPress={() => {
                            setSelectedStatus(id);
                            toast.info(name);
                          }}
                        >
                          <View
                            style={{
                              borderRadius: 50,
                              padding: 8,
                              borderWidth: 4,
                              borderColor:
                                selectedStatus === id
                                  ? "#ff6a94"
                                  : "transparent",
                            }}
                          >
                            <Icon width={49} height={49} />
                          </View>
                          <Text style={{ textAlign: "center" }}>{name}</Text>
                        </TouchableOpacity>
                      </Column>
                    ))}
                  </ScrollView>
                </Row>
                <TextInput
                  multiline
                  placeholder="想对你说点什么..."
                  style={styles.input}
                  onChangeText={(text) => {
                    toast.info("输入内容：" + text);
                  }}
                />
              </Column>
            </ScrollView>
            <View style={{ marginTop: "auto" }}>
              <PinkButton
                onPress={() => toast.success("发送成功")}
                text="发送"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccccccbd",
    borderRadius: 18,
    padding: 12,
    minHeight: 120,
    textAlignVertical: "top",
  },
});
