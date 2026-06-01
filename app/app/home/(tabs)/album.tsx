import { useRef, useState, useEffect } from "react";
import { Row } from "@/components/layout";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Search, CloudUpload, Ellipsis } from "lucide-react-native";
import { toast } from "@/components/common";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { AllMedias, Favorites, Photos, Videos } from "@/components/album";

const AllRoute = () => <AllMedias />;
const PhotosRoute = () => <Photos />;
const VideosRoute = () => <Videos />;
const FavoritesRoute = () => <Favorites />;

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

  const indicatorPos = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(indicatorPos, {
      toValue: index,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [index, indicatorPos]);

  return (
    <View style={{ flex: 1, paddingVertical: 12 }}>
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
            indicatorStyle={{ backgroundColor: "transparent" }}
            renderIndicator={(indicatorProps) => {
              const tabWidth = indicatorProps.layout.width / routes.length;
              return (
                <Animated.View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    height: 3,
                    backgroundColor: "#FF6b81",
                    borderRadius: 2,
                    width: tabWidth,
                    transform: [
                      { translateX: Animated.multiply(indicatorPos, tabWidth) },
                    ],
                  }}
                />
              );
            }}
            style={{ backgroundColor: "transparent", marginBottom: 16 }}
            // 文本选中颜色
            activeColor="#FF6b81"
            // 文本未选中颜色
            inactiveColor="#aaa"
          />
        )}
      />
    </View>
  );
}
