# Phase 23 — Wish target-date editing

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001：心愿目标日期是共享的真实字段，支持编辑且需跨端保持一致。
- Phase 14：服务端 `wishDateOnlySchema` 已拒绝格式错误、不存在或超出数据库 DATE 范围的日期。
- Phase 12：移动端编辑页只提交确实变更的字段，避免旧草稿覆盖另一个客户端的新值。
- PRD 当前基线：心愿目标日、地点、预算、封面等更新能力仍未完整。

## Objective

Web 和移动端用户可修改心愿目标日期。PATCH 接受并保存经既有真实日历规则校验的 `targetDate`，客户端提交 ISO 日期部分（`YYYY-MM-DD`），不受 UTC 转换影响。

## Material decisions

- 将日期编辑限定为一个独立小阶段；本阶段不顺带开放地点、预算、封面、经纬度或其他心愿字段，方便独立验证与提交。
- `targetDate` 当前是创建必填字段且数据库列为非空 DATE；只允许设置有效日期，不把清空或 nullable 化作为本次能力。
- 更新继续复用 `updateWishSchema` 的严格字段集合、`wishDateOnlySchema` 校验和现有 `buildWishWriteAuthorization` 最终 SQL 条件；不另造日期规则或改变关系授权。
- PATCH 只传本次真正变更的字段；移动端并行编辑标题/描述时仍避免回写未改的旧值。
- Web 使用原生日期输入控件；移动端复用现有本地日期选择器和 `formatLocalDateOnly`。服务端是最终格式、实际日历日和年份范围校验边界。
- 不更改数据库结构、目标日期默认值、排序/提醒行为、过程记录日期语义、依赖或外部服务。

## In scope

- 服务端心愿 PATCH schema/SQL 支持 `targetDate` 并继续应用现有授权条件。
- 同步 OpenAPI 契约和 Web 生成类型。
- Web 心愿详情目标日行提供编辑入口、表单、保存/错误反馈和成功后的查询刷新。
- 移动端心愿编辑页显示本地目标日期并且只提交变更字段。
- 同步 PRD 当前能力基线与执行计划/上下文/日志。

## Explicit non-goals

- 不编辑地点、预算、封面、经纬度、状态策略或其他心愿字段。
- 不允许目标日期置空，不做数据库迁移或批量修复历史日期。
- 不处理心愿记录编辑、提醒发送、日历集成、日期时区/提醒边界。
- 不连接真实数据库、真实账号、设备或浏览器，不推送或部署。

## Acceptance criteria

- 有效 PATCH `{ targetDate: "YYYY-MM-DD" }` 经 schema 校验并更新 `target_date`；无效格式、无效日历日及年份范围错误在数据库写入前拒绝。
- 更新语句仍在最终写入时限制当前心愿/情侣成员授权；既有标题、描述、状态请求不回归。
- Web 与移动端编辑入口以服务端目标日期预填；无变化时不发写请求，成功后展示新日期，失败保留编辑值并反馈错误。
- 移动端将选择器当地日历日期按 `formatLocalDateOnly` 提交，不能通过 UTC 日期转换偏移一天；未变更的标题/描述不随日期保存。
- OpenAPI、生成类型、PRD 当前基线和阶段记录相互一致。
- `pnpm --dir server lint`、`pnpm --dir server build`、`pnpm --dir web api`、`pnpm --dir web lint`、`pnpm --dir web build`、`pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、`git diff --check` 通过。

## Verification and limitations

- 对 `updateWishSchema` 执行 13 项正反矩阵：有效闰日、1000/9999 边界、标题/描述/状态兼容通过；非闰日、月份越界、1000 年前、格式错误、空日期和空 payload 被拒绝。
- `pnpm --dir server lint`、`pnpm --dir server build`、`pnpm --dir web api`、`pnpm --dir web lint`、`pnpm --dir web build`、`pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、`git diff --check` 均通过。
- 静态复核确认 PATCH 将日期绑定到 `target_date = ?`，仍组合既有最终关系授权谓词；OpenAPI 和生成类型均包含 `targetDate`；查询 mutation 已失效列表、详情、记录缓存。
- Web 构建保留既有 Zod 注释位置及 >500 kB chunk 警告；未因本阶段改动处理。
- 不连接 MySQL 或真机，因此并发授权、数据库 DATE 往返和原生日期选择器需后续集成验证。

## Handoff

证据已记录；此阶段独立提交后，继续查看 PRD-WISH-001 中其余字段编辑与记录能力缺口。
