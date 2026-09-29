# Phase 18 — Anniversary mutation authorization

## Status

`Complete`

## Source inputs

- PRD-DAY-001：用户可编辑、删除自己的情侣纪念日；PRD 10.1 要求关系资源按当前用户与 relationship id 在服务端授权。
- 当前编辑/删除在预读时校验关系，但最终 UPDATE 只约束 id 和 active 状态。

## Objective

编辑和删除的最终 SQL 同时确认关系仍 bound、请求者仍是该关系成员，避免预读后解绑/换关系仍可写入。

## In scope

- 两个最终 UPDATE 共用参数化的当前关系授权谓词。
- 保留原先字段与响应；零行写入继续返回 404。
- 记录高风险授权边界及缺少真实数据库集成的限制。

## Explicit non-goals

- 不修改创建、读取、关系解绑策略、日期/提醒业务语义、数据库表或客户端。
- 不访问真实 MySQL 或生产数据。

## Acceptance criteria

- 编辑/删除 UPDATE 均限定 id、active、预读时的 relationship id，以及该关系当前为 bound 且用户为任一方。
- 预读后解绑/换关系或纪念日状态变化导致零行写入时返回 404，不反馈成功。
- 成功路径字段与响应形状不变；server lint/build、授权 SQL 静态检查和 diff 检查通过。

## Verification and limitations

- 静态逐项检查未登录、非成员、跨情侣、解绑、已删除及零行路径。
- `pnpm --dir server lint`、`pnpm --dir server build`、`git diff --check`。
- 无隔离 MySQL；不宣称真实竞态或多账号集成通过。创建阶段的预查后插入间隙留待独立小点。

## Handoff

验证并记录证据后独立提交，继续其他 PRD R1/P0 缺口。
