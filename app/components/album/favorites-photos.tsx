import { Image, View, TouchableOpacity, SectionList } from "react-native";
import { Row } from "@/components/layout";
import { chunk } from "@/utils/grid";
import { FAVORITE_PHOTOS, type FavoritePhoto } from "@/data/mock-stories";
import { useImageViewer } from "@/hooks/use-image-viewer";

export function FavoritesPhotosGrid({
  contentWidth,
}: {
  contentWidth: number;
}) {
  const size = contentWidth > 0 ? (contentWidth - 4 * 2) / 3 : 0;
  const { openViewer, Viewer } = useImageViewer();
  const sections = [{ data: chunk(FAVORITE_PHOTOS, 3) }];

  const renderRow = ({ item: row }: { item: FavoritePhoto[] }) => (
    <Row gap={4} style={{ marginBottom: 4 }}>
      {row.map((photo) => (
        <TouchableOpacity
          key={photo.id}
          onPress={() => openViewer(photo.source)}
        >
          <Image
            source={photo.source}
            style={{ width: size, height: size, borderRadius: 6 }}
          />
        </TouchableOpacity>
      ))}
      {row.length < 3 && <View style={{ width: size }} />}
    </Row>
  );

  return (
    <>
      <SectionList
        sections={sections}
        keyExtractor={(row, index) => String(row[0]?.id ?? index)}
        showsVerticalScrollIndicator={false}
        renderItem={renderRow}
      />
      {Viewer}
    </>
  );
}
