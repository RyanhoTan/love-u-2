# Phase 22 — Mobile anniversary editing and deletion

## Status

`Complete`

## Source inputs

- PRD-DAY-001：用户可创建、编辑和删除一次性或重复纪念日。
- Phase 21 context：移动端列表顶部的“编辑”仅显示 toast，卡片无导航；服务端和 Web 已有受授权 PATCH/DELETE。

## Objective

移动端用户可打开既有纪念日、查看真实字段、编辑并保存，或确认删除；失败时诚实反馈并保留可重试路径。

## In scope

- 添加 app API PATCH/DELETE 封装。
- 列表卡片导航至按服务端列表读取的编辑页，移除占位编辑入口。
- 编辑名称、分类、日期、重复类型与已存提醒天数；使用现有受保护 PATCH。
- 删除需二次确认，使用既有受保护 DELETE；删除/更新成功后返回列表并刷新。
- 加载失败可重试；保存/删除失败在编辑页显示错误，不清除草稿。

## Explicit non-goals

- 不更改服务端、数据库、OpenAPI 或日期/提醒策略。
- 不重做创建表单，不实现通知投递，不改变解绑后历史数据处置。
- 不接入数据库、真实账号或真机。

## Acceptance criteria

- 列表项打开正确 id 的编辑页并预填服务端返回值。
- 只在 PATCH 确认成功后提示并返回；错误保留编辑值。
- 删除前原生确认；仅在 DELETE 成功后返回；错误保留在编辑页。
- 加载请求失败不显示空表单且可重试。
- app lint/typecheck、静态导航/API/反馈检查和 diff 检查通过。

## Verification and limitations

- 检查表单/API payload 对应字段、异步加载状态、确认删除和失败分支。
- `pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、`git diff --check`。
- 无真机或后端集成；服务端跨情侣/并发授权已有 Phase 17–19 的写入约束，但本阶段不执行数据库请求。

## Handoff

记录结果并独立提交，继续核对 PRD-DAY-001 的时区和重复日期边界。
