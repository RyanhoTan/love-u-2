import { ImageSourcePropType } from "react-native";
import { ImagesCoverPng } from "@/assets";

export interface Story {
  id: number;
  title: string;
  cover: ImageSourcePropType;
  photos: number;
  videos: number;
}

/** 全部故事相册列表 */
export const STORIES: Story[] = [
  { id: 1, title: "2023年夏天的回忆", cover: ImagesCoverPng, photos: 32, videos: 2 },
  { id: 2, title: "2023年海边之旅",   cover: ImagesCoverPng, photos: 18, videos: 1 },
  { id: 3, title: "2022年冬天的回忆", cover: ImagesCoverPng, photos: 28, videos: 1 },
  { id: 4, title: "2022年圣诞派对",   cover: ImagesCoverPng, photos: 40, videos: 3 },
  { id: 5, title: "2021年春天的回忆", cover: ImagesCoverPng, photos: 45, videos: 3 },
  { id: 6, title: "2021年毕业旅行",   cover: ImagesCoverPng, photos: 55, videos: 5 },
  { id: 7, title: "2020年秋天的回忆", cover: ImagesCoverPng, photos: 19, videos: 0 },
  { id: 8, title: "2020年生日惊喜",   cover: ImagesCoverPng, photos: 23, videos: 2 },
];

/** 根据 ID 获取故事相册标题 */
export function getStoryTitle(id: number): string {
  return STORIES.find((s) => s.id === id)?.title ?? "故事详情";
}

// ---------- 收藏的照片 / 视频 ----------

export interface FavoritePhoto {
  id: number;
  source: ImageSourcePropType;
}

export interface FavoriteVideo {
  id: number;
  source: ImageSourcePropType;
  duration: string; // "03:21"
}

export const FAVORITE_PHOTOS: FavoritePhoto[] = Array.from(
  { length: 15 },
  (_, i) => ({ id: i, source: ImagesCoverPng }),
);

export const FAVORITE_VIDEOS: FavoriteVideo[] = Array.from(
  { length: 7 },
  (_, i) => ({
    id: i,
    source: ImagesCoverPng,
    duration: `0${i % 3}:${String(20 + i * 7).padStart(2, "0")}`,
  }),
);

export interface StoryMediaGroup {
  id: number;
  time: string;
  photos: number;
  videos: number;
  sources: ImageSourcePropType[];
}

/** 根据故事 ID 获取该相册内的媒体分组（日级精度） */
export function getStoryMedias(storyId: number): StoryMediaGroup[] {
  const count = (storyId % 3) + 4; // 4~6 组，不同相册数量不同
  const base = new Date(2023, 7, 20 + storyId); // 不同故事起点日期不同
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const time = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    return {
      id: i,
      time,
      photos: 8 + i * 3,
      videos: i % 2,
      sources: Array.from({ length: 4 + i * 2 }, () => ImagesCoverPng),
    };
  });
}
