/**
 * 共享 mock 媒体数据 —— 愿望 & 相册共用。
 * 图片用 picsum.photos（id 模式，每张不同），视频用 mux.dev HLS 流。
 */

// ── 图片 ────────────────────────────────────────────

/**
 * 通过 picsum ID 生成确定性图片 URL。
 * picsum id 范围约 0–1084，每个 id 对应一张固定照片。
 */
export function mockImage(id: number, w = 800, h = 600): string {
  return `https://picsum.photos/id/${id}/${w}/${h}`;
}

// ── 视频 ────────────────────────────────────────────

export const MOCK_VIDEO_URL =
  "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

// ── 愿望 ────────────────────────────────────────────

export type WishStatus = "todo" | "doing" | "done";

export interface MockWish {
  id: number;
  cover: string;
  title: string;
  time: string;
  status: WishStatus;
}

export interface MockWishCategory {
  id: number;
  type: WishStatus;
  categoryName: string;
  wishList: MockWish[];
}

/** 三类愿望，按 picsum id 区间分配避免撞图 */
export const MOCK_WISH_CATEGORIES: MockWishCategory[] = [
  {
    id: 1,
    type: "todo",
    categoryName: "想做",
    wishList: [
      {
        id: 1,
        cover: mockImage(10, 600, 800),
        title: "一起去看海",
        time: "2025-08-15",
        status: "todo",
      },
      {
        id: 2,
        cover: mockImage(11, 600, 800),
        title: "一起去旅行",
        time: "2025-10-01",
        status: "todo",
      },
      {
        id: 3,
        cover: mockImage(12, 600, 800),
        title: "山顶露营看日出",
        time: "2025-09-20",
        status: "todo",
      },
      {
        id: 4,
        cover: mockImage(13, 600, 800),
        title: "学潜水",
        time: "2025-12-01",
        status: "todo",
      },
    ],
  },
  {
    id: 2,
    type: "doing",
    categoryName: "进行中",
    wishList: [
      {
        id: 5,
        cover: mockImage(14, 600, 800),
        title: "一起养一只猫",
        time: "2025-06-30",
        status: "doing",
      },
      {
        id: 6,
        cover: mockImage(15, 600, 800),
        title: "学会做对方最爱吃的菜",
        time: "2025-07-15",
        status: "doing",
      },
      {
        id: 7,
        cover: mockImage(16, 600, 800),
        title: "拍一套情侣写真",
        time: "2025-08-01",
        status: "doing",
      },
    ],
  },
  {
    id: 3,
    type: "done",
    categoryName: "已完成",
    wishList: [
      {
        id: 8,
        cover: mockImage(20, 600, 800),
        title: "一起去迪士尼",
        time: "2024-12-25",
        status: "done",
      },
      {
        id: 9,
        cover: mockImage(21, 600, 800),
        title: "海边看日落",
        time: "2024-08-10",
        status: "done",
      },
      {
        id: 10,
        cover: mockImage(22, 600, 800),
        title: "一起听一场演唱会",
        time: "2024-10-20",
        status: "done",
      },
      {
        id: 11,
        cover: mockImage(23, 600, 800),
        title: "一起滑冰",
        time: "2025-01-15",
        status: "done",
      },
      {
        id: 12,
        cover: mockImage(24, 600, 800),
        title: "逛美术馆",
        time: "2025-03-08",
        status: "done",
      },
    ],
  },
];
