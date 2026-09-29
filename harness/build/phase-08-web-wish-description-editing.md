# Phase 08 — Web wish description editing

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001：心愿可编辑，Web 与移动端字段语义一致。
- `PRD.md` 7.2：补齐心愿描述编辑。
- `web/src/pages/wishes-page/detail-info.tsx` 中的 description editing TODO。
- 现有 `/wishes/:id` PATCH 仅支持状态更新。

## Objective

Web 用户可以从心愿详情修改或清空描述，服务端验证当前用户仍有权修改该关系/个人范围内的心愿。

## In scope

- 服务端 PATCH 接受 `status` 或 `description`，字段单独可选且至少传一个。
- 描述继续遵循最多 1000 字符限制；空字符串表示清空。
- SQL 写入条件再次校验当前授权范围及未删除状态。
- Web 心愿详情增加描述编辑对话框、保存状态、错误提示和成功后的缓存刷新。
- OpenAPI 与生成 Web types 同步。
- 更新 PRD/阶段证据。

## Explicit non-goals

- 不实现移动端编辑入口。
- 不编辑心愿标题、封面、日期、地点、预算或经纬度。
- 不改变心愿状态流转、删除、恢复、永久删除和记录语义。
- 不改变数据库 schema。

## Acceptance criteria

- Web 用户可以打开编辑框、更新描述或清空描述。
- 请求失败时输入保留，页面不显示成功状态，用户可重试。
- 成功后心愿详情反映服务端返回的描述。
- status-only PATCH 继续工作。
- PATCH 空对象、超长描述与无效状态被 schema 拒绝。
- UPDATE 语句有 id、未删除、关系或创建者范围约束。
- Server/Web lint/build 通过，OpenAPI 类型生成一致。

## Verification

- `pnpm --dir server lint`
- `pnpm --dir server build`
- `pnpm --dir web api`
- `pnpm --dir web lint`
- `pnpm --dir web build`
- `git diff --check`

## Handoff and stop condition

完成、核对并单独提交后停止本阶段，Goal 随后可选择下一项独立 P0 缺口。
