// 颜色分两层：
// 1. theme：通用主题色，跟品牌视觉相关
// 2. semantic：基础颜色语义，跟页面、文本、边框、遮罩相关
export const colors = {
  theme: {
    primary: "#FF6B8B",
    secondary: "#FF9AAF",
    primaryTint: "#FFE5E9",
    primaryBorder: "rgba(255, 107, 139, 0.2)",
    primaryGlow: "rgba(255, 182, 193, 0.4)",
    primarySoftBg: "rgba(255, 77, 115, 0.12)",
  },
  semantic: {
    page: "#FFFFFF",
    surface: "#FFFDFE",
    overlay: "rgba(0, 0, 0, 0.4)",
    border: "#E5E5E5",
    divider: "#F9DDE4",
    textPrimary: "#2F2430",
    textSecondary: "#9A7D86",
    textMuted: "#999999",
    textInverse: "#FFFFFF",
  },
} as const;
