# Phase 20 — Honest anniversary reminder copy

## Status

`Complete`

## Source inputs

- PRD-DAY-001：用户可配置提前提醒天数，但没有通知能力时不能声称提醒已生效。
- R1 可信核心闭环：失败或尚未实现的能力不得伪装为已生效。
- 服务端只有 `reminder_days_before` 持久化；未找到纪念日通知发送/投递闭环。

## Objective

让用户清楚区分“保存提醒时间计划”和“实际发送通知”；从移动端与 Web 的纪念日页面移除当前不真实的通知承诺。

## In scope

- 移动端创建页在提醒设置旁明确说明通知尚未上线、不会发送。
- Web 的空状态、首页、表单、预览、删除确认移除或限定“会提醒/取消提醒”等生效叙述。
- 维持现有 `reminderDaysBefore` 值、请求契约和成功保存行为。

## Explicit non-goals

- 不建立推送、定时任务、设备 token 或通知偏好表。
- 不改变提醒天数输入控件、多开关优先级、服务器数据或历史数据；控件语义另行改进。
- 不修改其他功能域的提醒文案。

## Acceptance criteria

- 两端设置提醒时间时，都可见“当前不会发送通知”类说明。
- Web 首页/列表/重复选项/删除确认不再承诺会发送或取消不存在的通知。
- 现有提醒字段写入与编辑提交仍不变；app lint/typecheck、Web lint/build、文案静态检查、diff 检查通过。

## Verification and limitations

- 搜索纪念日入口的提醒文案，人工核对不再暗示通知已生效。
- `pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、`pnpm --dir web lint`、`pnpm --dir web build`、`git diff --check`。
- 无真机/浏览器人工检查；现有多开关对应一个 `reminderDaysBefore` 的 UX 不一致仍需独立小点。

## Handoff

证据记录后独立提交，继续 R1/P0 的提醒输入语义或其他缺口。
