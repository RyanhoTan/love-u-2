export const TODAY = {
  hero:
    "https://images.unsplash.com/photo-1780818244691-16209b3b3e82?auto=format&fit=crop&w=800&q=80",
  insights: [
    {
      kicker: "下一个纪念日",
      title: "相识 1000 天",
      detail: "还剩 12 天 · 2026.09.20",
      to: "/days",
    },
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
  memories: [
    {
      alt: "拿铁",
      src: "https://images.unsplash.com/photo-1667592496907-e4167cf2a1f1?auto=format&fit=crop&w=640&q=80",
    },
    {
      alt: "海边日落",
      src: "https://images.unsplash.com/photo-1686848515543-1a8ad4622dcc?auto=format&fit=crop&w=640&q=80",
    },
    {
      alt: "晚餐",
      src: "https://images.unsplash.com/photo-1543209731-86f712718a40?auto=format&fit=crop&w=640&q=80",
    },
    {
      alt: "山间湖泊",
      src: "https://images.unsplash.com/photo-1608820980073-0a946a135983?auto=format&fit=crop&w=640&q=80",
    },
  ],
} as const;

export const PHOTOS = [
  {
    alt: "东京街道",
    src: "https://images.unsplash.com/photo-1683993662295-93debc656a21?auto=format&fit=crop&w=800&q=80",
  },
  {
    alt: "拉面",
    src: "https://images.unsplash.com/photo-1645123986577-dfc9359e982b?auto=format&fit=crop&w=800&q=80",
  },
  {
    alt: "车窗",
    src: "https://images.unsplash.com/photo-1615384698544-85742d5d2279?auto=format&fit=crop&w=800&q=80",
  },
  {
    alt: "樱花",
    src: "https://images.unsplash.com/photo-1522547902298-51566e4fb383?auto=format&fit=crop&w=800&q=80",
  },
  {
    alt: "海边悬崖",
    src: "https://images.unsplash.com/photo-1555702152-8ca6cbc49c6c?auto=format&fit=crop&w=800&q=80",
  },
  {
    alt: "夜城",
    src: "https://images.unsplash.com/photo-1628755847299-20f509e81973?auto=format&fit=crop&w=800&q=80",
  },
  {
    alt: "相机",
    src: "https://images.unsplash.com/photo-1551818014-8279462338b2?auto=format&fit=crop&w=800&q=80",
  },
  {
    alt: "向日葵",
    src: "https://images.unsplash.com/photo-1721059050925-1bcf0a93c81f?auto=format&fit=crop&w=800&q=80",
  },
  {
    alt: "窗边的猫",
    src: "https://images.unsplash.com/photo-1655880095392-eebe6c878073?auto=format&fit=crop&w=800&q=80",
  },
  {
    alt: "甜点",
    src: "https://images.unsplash.com/photo-1788172406580-7a0417c9e53b?auto=format&fit=crop&w=800&q=80",
  },
  {
    alt: "林间小路",
    src: "https://images.unsplash.com/photo-1592842390139-6273d4cf6f57?auto=format&fit=crop&w=800&q=80",
  },
  {
    alt: "手中的咖啡",
    src: "https://images.unsplash.com/photo-1575301095327-7be508b9435b?auto=format&fit=crop&w=800&q=80",
  },
] as const;

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

export const DAYS = {
  next: {
    title: "相识 1000 天",
    remain: 12,
    date: "2026.09.20",
  },
  upcoming: [
    { title: "她的生日", date: "2026.10.19", remain: 41 },
    { title: "在一起周年", date: "2026.07.12", remain: 307 },
    { title: "第一次旅行", date: "2026.12.01", remain: 84 },
  ],
} as const;

export const MESSAGES = [
  { kind: "stamp", text: "今天 10:21" },
  {
    kind: "in",
    text: "今晚想去江边走走吗？",
    time: "10:21",
  },
  {
    kind: "out",
    text: "好，我六点半下班。",
    time: "10:22",
  },
  {
    kind: "photo",
    src: "https://images.unsplash.com/photo-1567108986089-678f178e0bb6?auto=format&fit=crop&w=640&q=80",
    alt: "江边",
  },
  {
    kind: "out",
    text: "那家拉面也一起？",
    time: "10:24",
  },
] as const;
