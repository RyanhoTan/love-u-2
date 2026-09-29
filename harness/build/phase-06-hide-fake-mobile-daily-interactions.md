# Phase 06 — Hide fake mobile daily interactions

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-STATUS-001。
- `PRD.md` R1 对状态和一句话 mock、硬编码、假成功的清理要求。
- 移动端首页、状态页和一句话页的现有行为。

## Objective

在真实数据模型和 API 完成前，不让用户进入会展示虚构伴侣内容、并把本地交互声称为已发送或已保存的页面。

## In scope

- 从移动端首页移除今日状态和一句话入口。
- 删除两个没有持久化能力的生产页面。
- 保留真实心愿入口并同步 PRD 基线。

## Explicit non-goals

- 不设计状态/一句话的数据保留策略。
- 不新增数据库表、API、通知或时间线。
- 不删除仍在其他真实功能中使用的状态图标素材。
- 不处理首页未绑定、加载或错误状态；该问题独立实施。

## Acceptance criteria

- 移动端首页不再链接 `/home/status` 或 `/home/asentence`。
- 生产路由不再包含硬编码伴侣状态/句子和无条件成功反馈页面。
- 愿望清单入口保持可用。
- app lint、目标静态检查和 diff 检查通过。

## Verification

- `rg 'home/(status|asentence)|今日状态|今日一句话|今天加班好累' app/app/home`
- `pnpm --dir app lint`
- `git diff --check`

## Handoff and stop condition

验证和独立提交后停止，不自动实现 R2 状态领域。
