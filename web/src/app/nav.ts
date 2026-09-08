import {
  Calendar,
  Gift,
  Home,
  Image,
  MessageCircle,
  User,
  type LucideIcon,
} from "lucide-react";
import type { NavId } from "./types";

export const NAV_ITEMS: {
  id: NavId;
  to: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "today", to: "/", label: "今天", icon: Home },
  { id: "messages", to: "/messages", label: "对话", icon: MessageCircle },
  { id: "photos", to: "/photos", label: "相册", icon: Image },
  { id: "wishes", to: "/wishes", label: "心愿", icon: Gift },
  { id: "days", to: "/days", label: "纪念日", icon: Calendar },
  { id: "me", to: "/me", label: "我的", icon: User },
];
