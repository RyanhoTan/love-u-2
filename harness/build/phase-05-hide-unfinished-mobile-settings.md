# Phase 05 — Hide unfinished mobile settings

## Status

`Complete`

## Source inputs

- `PRD.md` 7.4 暂缓、隐藏或去除。
- `PRD.md` R1 对通知 mock、硬编码和假成功的清理要求。
- Phase 04 已在 Web 执行的诚实入口原则。

## Objective

让移动端不再把未持久化的通知设置以及未实现的报告、主题能力展示为可用功能。

## In scope

- 隐藏移动端“我的”中的通知设置、主题换肤和恋爱报告入口。
- 删除只保存在组件内、没有任何 API 调用的通知设置页。
- 同步 PRD 当前基线和阶段证据。

## Explicit non-goals

- 不实现推送、账户级通知偏好、报告或主题。
- 不移除当前仅显示说明的隐私与安全、关于我们入口。
- 不修改个人资料、情侣空间或退出登录。
- 不卸载 `expo-notifications`，因为依赖使用情况需单独评估。

## Acceptance criteria

- 移动端“我的”不再展示通知设置、主题换肤和恋爱报告。
- 生产路由中不再存在会无条件提示“通知设置已保存”的页面。
- 个人资料与情侣空间入口不受影响。
- app lint、目标字符串静态检查和 diff 检查通过。

## Verification

- `rg 'notification-settings|主题换肤|恋爱报告|通知设置已保存' app/app`
- `pnpm --dir app lint`
- `git diff --check`

## Handoff and stop condition

验证和独立提交后停止，不自动设计或实现通知后端。
