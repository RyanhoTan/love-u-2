import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Line, Circle } from "react-native-svg";

/**
 * 组件: 旅行计划页面 - 带顶部空心大圆圈的动态高度虚线组件
 * 功能: 自动撑满父级剩余高度，顶部带有一个品牌色 (#ff275e) 的空心圆
 */
export const TimeLine = () => {
  // 定义圆的属性，方便统一计算和调整
  const strokeWidth = 4; // 圆圈的边框粗细
  const radius = 8; // 圆圈的半径（半径8，代表圆的直径是16）
  const size = 20; // SVG 画布的宽度，略大于圆的直径防止锯齿被裁切
  const center = size / 2; // 圆心坐标，居中

  return (
    <View style={styles.container}>
      {/* 调整画布宽度，确保能容纳下大圆圈 */}
      <Svg width={size} height="100%">
        {/* 绘制垂直虚线 
          y1 设为 center，让虚线从圆心开始向下画；
          因为圆是空心的，如果你不想虚线穿过圆心，可以将 y1 改为 center + radius
        */}
        <Line
          x1={center}
          y1={center + radius} /* 从圆圈的下边缘开始画虚线，保持空心纯净 */
          x2={center}
          y2="100%" /* 动态画到最底部 */
          stroke="#ff275e20" /* 虚线颜色 */
          strokeWidth="2" /* 线条宽度 */
          strokeDasharray="4, 4" /* 4px 实线，4px 空白，交替形成虚线 */
        />

        {/*  
          必须写在 Line 的后面，确保圆圈的层级在虚线之上（虽然这里它们没有重叠）
        */}
        <Circle
          cx={center} /* 圆心 X 坐标 */
          cy={center} /* 圆心 Y 坐标 */
          r={radius} /* 圆的半径 */
          fill="transparent" /* 关键：设置填充为透明，实现空心效果 */
          stroke="#ff275e" /* 边框颜色 */
          strokeWidth={strokeWidth} /* 边框厚度，突出“边框很大”的效果 */
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 /* 核心：利用 flex 自动撑开 */,
    width: "100%",
    alignItems: "center",
    marginTop: 6 /* 让整个组件和上方的日期文字保持间距 */,
  },
});
