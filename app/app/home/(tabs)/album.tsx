import { Row } from "@/components/layout";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Search, CloudUpload, Ellipsis } from "lucide-react-native";
import { toast } from "@/components/common";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useState } from "react";
import { AllAlbums } from "@/components/album";

const AllRoute = () => <AllAlbums />;
const PhotosRoute = () => (
  <View>
    <Text>照片内容</Text>
  </View>
);
const VideosRoute = () => (
  <View>
    <Text>视频内容</Text>
  </View>
);
const FavoritesRoute = () => (
  <View>
    <Text>收藏内容</Text>
  </View>
);

const renderScene = SceneMap({
  all: AllRoute,
  photos: PhotosRoute,
  videos: VideosRoute,
  favorites: FavoritesRoute,
});

export default function Album() {
  const headerMenus = [
    { name: "搜索", icon: Search, onPress: () => toast.info("搜索") },
    { name: "上传", icon: CloudUpload, onPress: () => toast.info("上传") },
    { name: "更多", icon: Ellipsis, onPress: () => toast.info("更多") },
  ];

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "all", title: "全部" },
    { key: "photos", title: "照片" },
    { key: "videos", title: "视频" },
    { key: "favorites", title: "收藏" },
  ]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flex: 1, gap: 12 }}
    >
      <Row content="space-between">
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>相册</Text>
        <Row gap={12}>
          {headerMenus.map((menu, index) => (
            <TouchableOpacity
              key={index}
              onPress={menu.onPress}
              style={{ padding: 8 }}
            >
              <menu.icon />
            </TouchableOpacity>
          ))}
        </Row>
      </Row>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        // 可选：启用懒加载，提升初始化性能
        lazy
        renderTabBar={(props) => (
          <TabBar
            {...props}
            // 自定义指示器样式 (底部动画线)
            indicatorStyle={{
              backgroundColor: "#FF6b81",
              height: 3,
              borderRadius: 2,
            }}
            // Tab 背景色
            style={{ backgroundColor: "transparent", marginBottom: 16 }}
            // 文本选中颜色
            activeColor="#FF6b81"
            // 文本未选中颜色
            inactiveColor="#aaa"
          />
        )}
      />
    </ScrollView>
  );
}
