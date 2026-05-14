import { StatusBar } from "expo-status-bar";
import { Column } from "@/components/layout";
import {
  Text,
  StyleSheet,
  Pressable,
  View,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { Interact, Home, Album, Mine } from "@/assets/icons/home-layout";
import { AuthBackground } from "@/assets/images/auth";

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={AuthBackground} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
          <StatusBar style="dark" />
          <Column gap={16} flex={1}>
            <Tabs>
              <Column flex={1}>
                <TabSlot style={{ flex: 1 }} />
              </Column>

              <TabList style={styles.tabsList}>
                <TabTrigger name="index" href="/" asChild>
                  <TabsButton text="首页" IconComponent={Home} />
                </TabTrigger>

                <TabTrigger name="interact" href="/home/interact" asChild>
                  <TabsButton text="交互" IconComponent={Interact} />
                </TabTrigger>

                <TabTrigger name="album" href="/home/album" asChild>
                  <TabsButton text="相册" IconComponent={Album} />
                </TabTrigger>

                <TabTrigger name="mine" href="/home/mine" asChild>
                  <TabsButton text="我的" IconComponent={Mine} />
                </TabTrigger>
              </TabList>
            </Tabs>
          </Column>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

interface TabsButtonProps extends TabTriggerSlotProps {
  text: string;
  IconComponent: React.FC<import("react-native-svg").SvgProps>;
}

function TabsButton({
  text,
  IconComponent,
  isFocused,
  ...props
}: TabsButtonProps) {
  return (
    <Pressable {...props} style={styles.tabsButton}>
      <Column center gap={6}>
        <IconComponent
          width={24}
          height={24}
          color={isFocused ? "#ff5675" : "#b7b7b8"}
        />
        <Text style={{ color: isFocused ? "#ff5675" : "#b7b7b8" }}>{text}</Text>
      </Column>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabsButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabsList: {
    backgroundColor: "#fff",
    height: 64,
    justifyContent: "space-around",
    alignSelf: "center",
    borderRadius: 32,
  },
});
