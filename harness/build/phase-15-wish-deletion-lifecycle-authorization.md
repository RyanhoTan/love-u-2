# Phase 15 — Wish deletion lifecycle authorization

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001：非当前情侣成员不能修改心愿；用户可软删除、恢复和永久删除。
- Phase 08 的心愿 PATCH 已在 UPDATE 中重新约束关系授权，删除生命周期尚未如此。

## Objective

使心愿删除生命周期的最终写入同时检查心愿状态和当前情侣授权；若预检查之后授权或状态已变化，返回未找到而不是成功。

## In scope

- 将已有 PATCH 的 couple/personal 写入授权条件抽成复用函数。
- 软删除、恢复、永久删除的最终 SQL 使用同一授权条件并检查受影响行数。
- 记录授权、并发失败路径的静态及可运行验证证据。

## Explicit non-goals

- 不决定解绑后的共同数据归属、保留或导出策略；不改变现有读取范围。
- 不改变回收站期限、数据库 schema、自动清理任务、对象存储或客户端 UI。
- 不在无隔离测试数据库的情况下运行实际删除请求。

## Acceptance criteria

- 三条最终写入 SQL 均限定 `id`、删除状态和写入时的当前授权；个人心愿不能在用户已经绑定后写入。
- 关系或行状态在预检查后变化时，零行写入返回 404，不伪报成功。
- 已授权且状态正确时保留原有响应和数据变更语义；PATCH 仍使用同一授权逻辑。
- server lint/build、聚焦授权 SQL 静态检查、`git diff --check` 通过。

## Verification and limitations

- 对实际代码检查三个 mutation 调用都使用统一条件及 `affectedRows`；检查未授权、跨关系、解绑、已绑定个人心愿、状态变化路径。
- 运行 `pnpm --dir server lint`、`pnpm --dir server build` 和 `git diff --check`。
- 无数据库集成环境，因此不宣称已通过真实并发或跨情侣集成测试；后续回归套件需补充该路径。

## Handoff

验收与可运行验证完成后记录 context/build log，独立提交，再继续其他 R1/P0 小点。
