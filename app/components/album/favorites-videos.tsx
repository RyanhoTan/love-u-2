import { Text, Image, View, StyleSheet, TouchableOpacity, SectionList } from "react-native";
import { Row } from "@/components/layout";
import { chunk } from "@/utils/grid";
import { FAVORITE_VIDEOS, type FavoriteVideo } from "@/data/mock-stories";

export function FavoritesVideosGrid({ contentWidth }: { contentWidth: number }) {
  const size = contentWidth > 0 ? (contentWidth - 4 * 2) / 3 : 0;
  const sections = [{ data: chunk(FAVORITE_VIDEOS, 3) }];

  const renderRow = ({ item: row }: { item: FavoriteVideo[] }) => (
    <Row gap={4} style={{ marginBottom: 4 }}>
      {row.map((video) => (
        <TouchableOpacity key={video.id}>
          <View>
            <Image
              source={video.source}
              style={{ width: size, height: size, borderRadius: 6 }}
            />
            <View style={styles.durationTag}>
              <Text style={styles.durationText}>{video.duration}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      {row.length < 3 && <View style={{ width: size }} />}
    </Row>
  );

  return (
    <SectionList
      sections={sections}
      keyExtractor={(row, index) => String(row[0]?.id ?? index)}
      showsVerticalScrollIndicator={false}
      renderItem={renderRow}
    />
  );
}

const styles = StyleSheet.create({
  durationTag: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  durationText: {
    color: "#fff",
    fontSize: 11,
  },
});
