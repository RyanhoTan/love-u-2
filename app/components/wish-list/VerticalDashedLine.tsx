import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Line } from "react-native-svg";

/**
 * 组件: 旅行计划页面 - 动态高度虚线组件
 * 功能: 自动撑满父级剩余高度，生成完美的抗锯齿灰色虚线
 */
export const VerticalDashedLine = () => {
  return (
    <View style={styles.container}>
      {/* height="100%" 是核心，让 SVG 高度完全自适应外层 View */}
      <Svg width="2" height="100%">
        <Line
          x1="1"
          y1="0"
          x2="1"
          y2="100%" /* 动态画到最底部 */
          stroke="#E0E0E0" /* 虚线颜色 */
          strokeWidth="2" /* 线条宽度 */
          strokeDasharray="4, 4" /* 关键：4px 实线，4px 空白，交替形成虚线 */
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 /* 核心：利用 flex 自动撑开，高度完全由右侧内容决定 */,
    width: "100%",
    alignItems: "center",
    marginTop: 6 /* 让虚线和上方的日期文字保持一点点呼吸间距 */,
  },
});
