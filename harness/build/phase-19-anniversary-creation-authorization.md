# Phase 19 — Anniversary creation authorization

## Status

`Complete`

## Source inputs

- PRD-DAY-001：情侣共同纪念日应归属当前关系；PRD 10.1 规定服务端关系授权。
- 现有 create 在预查当前 bound 关系后，无条件 `INSERT ... VALUES`，两步之间可能解绑。

## Objective

使创建纪念日的 INSERT 在同一语句中确认原关系仍 bound 且用户仍是成员。

## In scope

- 用 `INSERT ... SELECT FROM couple_relationships` 替换无条件 VALUES。
- 未插入行时在读取结果或反馈成功前返回 409，与预查失败语义一致。
- 保留有效请求字段、响应和客户端契约。

## Explicit non-goals

- 不改纪念日编辑/删除、历史数据处置、提醒发送、日期算法、数据库表或客户端。
- 不访问真实 MySQL、生产数据或外部服务。

## Acceptance criteria

- 最终 INSERT 固定预查的 relationship id，要求关系为 bound 且用户是关系任一方。
- 预查后解绑或关系状态变化导致零行插入时返回 409，不伪报成功。
- 正常已绑定路径保留字段与响应；server lint/build、SQL 静态检查、diff 检查通过。

## Verification and limitations

- 静态检查身份、跨关系、解绑、零行和参数顺序；对外部 DB 不运行实际写入。
- `pnpm --dir server lint`、`pnpm --dir server build`、`git diff --check`。
- 真实竞态结果需要后续隔离 MySQL 集成验证。

## Handoff

记录证据、独立提交后继续 PRD R1/P0。
