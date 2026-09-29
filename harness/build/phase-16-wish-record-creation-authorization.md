# Phase 16 — Wish record creation authorization

## Status

`Complete`

## Source inputs

- PRD-WISH-001：过程记录属于心愿，非当前情侣成员不得修改心愿。
- Phase 15 提取了情侣/个人心愿写入授权谓词。

## Objective

过程记录 INSERT 在同一语句内确认心愿仍存在、未删除且对请求者可写；没有插入行时返回 404，不能继续生成媒体或伪报创建成功。

## In scope

- 将 `wish_records` 的 INSERT 改为从符合授权与状态条件的 `wishes` 行选择。
- INSERT 结果为零行时在任何缩略图/媒体写入前返回 404。
- 保留请求字段和成功响应形状。

## Explicit non-goals

- 不修改媒体 URL 所有权策略、缩略图来源或对象存储清理。
- 不决定解绑后历史数据归属；不修改读取权限。
- 不修改数据表、API、客户端、事务边界或上传语义。

## Acceptance criteria

- INSERT 本身限定目标心愿 id、当前写入授权及 `deleted_at IS NULL`。
- 预检查后、INSERT 执行前解绑、关系切换或心愿删除时，不新增记录且返回 404，不处理媒体。
- 已授权路径仍保存同样的记录字段和响应；服务端 lint/build 与 diff 检查通过。

## Verification and limitations

- 静态核对 INSERT 的字段/占位符数量、查询谓词及零行分支位置。
- 运行 `pnpm --dir server lint`、`pnpm --dir server build`、`git diff --check`。
- 无隔离 MySQL，不能声称真实并发或跨情侣集成通过；媒体部分失败与用户提供 URL 来源检查是后续独立缺口。

## Handoff

完成可运行检查和风险记录后单独提交，继续其他 PRD R1/P0 小点。
