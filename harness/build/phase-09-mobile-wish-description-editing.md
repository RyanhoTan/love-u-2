# Phase 09 — Mobile wish description editing

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001：心愿可编辑，移动端和 Web 对共同字段保持一致语义。
- `PRD.md` 7.2：补齐心愿描述编辑。
- Phase 08 的服务端 `/wishes/:id` PATCH description 支持及范围授权。
- 移动端详情页当前无编辑入口，`UpdateWishPayload` 仅包含 status。

## Objective

移动端用户可以从心愿详情打开编辑页，修改或清空描述；服务端保存失败时保留输入并显示错误，成功后返回最新详情。

## In scope

- 移动端 API client 类型支持 description-only PATCH，同时保留 status 更新。
- 新增移动端描述编辑页，加载现有心愿、限制最多 1000 字符、保存真实 API 请求。
- 详情页增加编辑描述入口，并在重新获得焦点时刷新数据。
- 同步 PRD 基线和阶段证据。

## Explicit non-goals

- 不编辑标题、封面、日期、地点、预算或经纬度。
- 不改变心愿状态、记录、删除、恢复和永久删除流程。
- 不新增本地持久化或假成功行为。

## Acceptance criteria

- 有效心愿详情可以进入描述编辑页，初始值来自服务端。
- 用户可以修改或清空描述；最多输入 1000 字符。
- 保存中阻止重复提交；失败显示错误并保留草稿。
- 成功只在 PATCH 成功后反馈，并返回更新后的详情。
- `status` 更新调用保持有效。
- app lint 与 TypeScript `--noEmit` 通过。

## Verification

- `pnpm --dir app lint`
- `pnpm --dir app exec tsc --noEmit`
- `git diff --check`

## Handoff and stop condition

验证并独立提交后停止本阶段，Goal 随后继续 PRD-WISH-001 的其他字段和状态一致性缺口。
