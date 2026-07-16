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
