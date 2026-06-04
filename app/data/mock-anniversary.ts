export type MockAnniversaryItem = {
  id: string;
  title: string;
  date: string;
  repeatLabel?: string;
  remainingDays: number;
  iconBackground: string;
  iconAccent: string;
};

export const MOCK_ANNIVERSARY_LIST: MockAnniversaryItem[] = [
  {
    id: "love",
    title: "恋爱纪念日",
    date: "2024.06.01",
    repeatLabel: "每年",
    remainingDays: 45,
    iconBackground: "#FFE8F0",
    iconAccent: "#FF5B93",
  },
  {
    id: "partner-birthday",
    title: "对方生日",
    date: "2000.05.20",
    repeatLabel: "每年",
    remainingDays: 125,
    iconBackground: "#FFF0E3",
    iconAccent: "#FF8B3D",
  },
  {
    id: "my-birthday",
    title: "我生日",
    date: "2000.08.15",
    repeatLabel: "每年",
    remainingDays: 212,
    iconBackground: "#FFF2E7",
    iconAccent: "#FF9A52",
  },
  {
    id: "trip",
    title: "第一次旅行",
    date: "2024.10.03",
    remainingDays: 322,
    iconBackground: "#EAF5FF",
    iconAccent: "#5FB4FF",
  },
];
