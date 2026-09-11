export const TODAY = {
  hero:
    "https://images.unsplash.com/photo-1780818244691-16209b3b3e82?auto=format&fit=crop&w=800&q=80",
  insights: [
    {
      kicker: "今日状态",
      title: "想你",
      detail: "10:24 更新",
      to: "/status",
    },
    {
      kicker: "一句话",
      title: "晚饭想吃拉面",
      detail: "1 小时前",
      to: "/sentence",
    },
  ],
} as const;

export const WISHES = [
  {
    title: "京都赏樱",
    place: "京都",
    status: "进行中",
    src: "https://images.unsplash.com/photo-1649957866905-bef01af303da?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "海边看日出",
    place: "青岛",
    status: "进行中",
    src: "https://images.unsplash.com/photo-1541757617970-f33144dbec38?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "亲手做戒指",
    place: "工作室",
    status: "进行中",
    src: "https://images.unsplash.com/photo-1719560042123-ebf4f17566d5?auto=format&fit=crop&w=800&q=80",
  },
] as const;
