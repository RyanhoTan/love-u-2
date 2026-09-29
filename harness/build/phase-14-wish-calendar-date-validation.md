# Phase 14 — Wish calendar date validation

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001：心愿目标日期和过程记录是跨端共享的真实业务字段。
- Phase 13 保证移动端提交所选本地日历日；服务端当前仅用 `YYYY-MM-DD` 正则校验。
- `server/src/db/schema.ts` 为两个字段使用 `DATE NOT NULL`，当前回填默认值为 `1000-01-01`。

## Objective

对心愿目标日和过程记录日验证真实日历日期，避免不可能的日期进入数据库插入流程并以不明确的数据库错误反馈给用户。

## In scope

- 心愿创建 `targetDate` 和过程记录创建 `recordDate` 共用真实日历日期校验。
- 保持四位年份和 `YYYY-MM-DD` 请求格式；将允许年份限制为 1000–9999，与当前 DATE 默认下界相容。
- 更新 `web/openapi.json` 相关请求字段描述并重新生成 Web 类型。
- 记录 PRD、PLANS、context 和 build log 中的完成证据。

## Explicit non-goals

- 不修改日期字段的必填性、服务端时区、数据表结构或历史数据。
- 不增加心愿目标日编辑能力；这是独立后续功能。
- 不修改纪念日或用户生日校验。
- 不访问真实数据库或部署环境。

## Acceptance criteria

- `2024-02-29`、`2000-02-29`、`1000-01-01` 与 `9999-12-31` 在两种请求中可通过。
- `2025-02-29`、`1900-02-29`、`2026-02-30`、`2026-13-01`、`0999-12-31` 和格式错误日期在两种请求中被拒绝。
- 不提供日期或无效日期仍在数据库写入之前由 Zod 拒绝；`parseRequestBody` 映射为 400。
- 其他心愿和记录字段及已存在的状态/标题/描述 PATCH 语义不受影响。
- server lint/build、Web API 生成、Web lint/build、`git diff --check` 通过。

## Verification

- 对两个实际导出的 Zod schema 执行正反日期矩阵，检查通过/拒绝结果。
- 静态确认两个 handler 在 DB 写入前解析请求。
- `pnpm --dir server lint`、`pnpm --dir server build`。
- `pnpm --dir web api`、`pnpm --dir web lint`、`pnpm --dir web build`。
- `git diff --check`。

## Risks and limitations

- 没有真实 MySQL 联调或多时区端到端；此阶段只证明请求验证、类型和构建。
- API 输入校验收紧后，旧客户端若传入不真实日期将收到 400；有效日期与现有请求形状保持兼容。

## Handoff and stop condition

所有验收与验证命令通过、证据记录并独立提交后完成；随后继续 PRD P0 中其他独立缺口。
