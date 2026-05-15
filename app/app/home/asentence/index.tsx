import { Column } from "@/components/layout";
import {
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavBar } from "@/components/common/nav-bar";
import { toast, PinkButton } from "@/components/common";

export default function ASentence() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingHorizontal: 16,
        gap: 16,
        backgroundColor: "#ffeaea",
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1, gap: 16 }}>
            <NavBar title="今日一句话" />
            <ScrollView
              contentContainerStyle={{ gap: 16 }}
              showsVerticalScrollIndicator={false}
            >
              <Column style={style.card}>
                <Text style={style.cardTitle}>对方留给你的一句话</Text>
                <Column
                  flex={1}
                  center
                  style={{
                    paddingHorizontal: 20,
                    width: "100%",
                    alignSelf: "center",
                  }}
                >
                  <Text style={style.cardText}>
                    {`今天加班好累，
但想到你我就很开心
              `}
                  </Text>
                </Column>
              </Column>

              <Column style={style.card}>
                <Text style={style.cardTitle}>我想对你说</Text>

                <Column
                  flex={1}
                  center
                  style={{
                    paddingHorizontal: 20,
                    width: "100%",
                    alignSelf: "center",
                  }}
                >
                  <TextInput
                    multiline
                    placeholder="和ta说句话吧..."
                    style={style.cardInput}
                    onChangeText={(text) => toast.info(text)}
                  />
                </Column>
              </Column>
            </ScrollView>
            <View style={{ marginTop: "auto" }}>
              <PinkButton
                onPress={() => {
                  Keyboard.dismiss();
                  toast.success("保存成功");
                }}
                text="保存"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 220,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardInput: {
    width: "100%",
    textAlignVertical: "center",
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
  },
});
