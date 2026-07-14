import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Column } from "@/components/layout";
import {
  Text,
  StyleSheet,
  Pressable,
  View,
  ImageBackground,
  type LayoutChangeEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import {
  IconsHomeLayoutInteractSvg,
  IconsHomeLayoutHomeSvg,
  IconsHomeLayoutAlbumSvg,
  IconsHomeLayoutMineSvg,
  ImagesAuthBackgroundPng,
} from "@/assets";
import { ChatInputKeyboardOffsetContext } from "@/components/interact";

export default function RootLayout() {
  const [tabBarHeight, setTabBarHeight] = useState(0);

  const handleTabsListLayout = (event: LayoutChangeEvent) => {
    setTabBarHeight(event.nativeEvent.layout.height);
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={ImagesAuthBackgroundPng} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
          <StatusBar style="dark" />
          <ChatInputKeyboardOffsetContext.Provider value={tabBarHeight}>
            <Column gap={16} flex={1}>
              <Tabs>
                <Column flex={1}>
                  <TabSlot style={{ flex: 1 }} />
                </Column>

                <TabList
                  onLayout={handleTabsListLayout}
                  style={styles.tabsList}
                >
                  <TabTrigger name="index" href="/" asChild>
                    <TabsButton
                      text="首页"
                      IconComponent={IconsHomeLayoutHomeSvg}
                    />
                  </TabTrigger>

                  <TabTrigger name="interact" href="/home/interact" asChild>
                    <TabsButton
                      text="交互"
                      IconComponent={IconsHomeLayoutInteractSvg}
                    />
                  </TabTrigger>

                  <TabTrigger name="album" href="/home/album" asChild>
                    <TabsButton
                      text="相册"
                      IconComponent={IconsHomeLayoutAlbumSvg}
                    />
                  </TabTrigger>

                  <TabTrigger name="mine" href="/home/mine" asChild>
                    <TabsButton
                      text="我的"
                      IconComponent={IconsHomeLayoutMineSvg}
                    />
                  </TabTrigger>
                </TabList>
              </Tabs>
            </Column>
          </ChatInputKeyboardOffsetContext.Provider>
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
