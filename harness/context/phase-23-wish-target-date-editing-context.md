# Phase 23 context — Wish target-date editing

心愿创建时要求 `targetDate`，schema 已通过共享的 `wishDateOnlySchema` 验证 `YYYY-MM-DD`、真实日历日期及数据库 DATE 范围。现有 `/wishes/:id` PATCH 只支持 `title`、`description` 和 `status`，但 `updateWish` 已在最终 UPDATE 使用 `buildWishWriteAuthorization` 约束当前情侣/个人范围。数据库 `wishes.target_date` 为必填 DATE，故本阶段不开放清空目标日期。

Web 与移动端详情均展示目标日期，但不能编辑它。Web 使用 `/home/wishes/:id` 详情页和 TanStack Query `useUpdateWishMutation`，编辑标题/描述已有独立 dialog。移动端 `app/app/home/wish-list/[id]/edit.tsx` 已同时编辑标题/描述，并只提交实际变更字段；创建/记录日期通过 `formatLocalDateOnly` 避免 UTC 偏移，日期选择器为 `DatePickerModal`。

Phase 23 只加目标日期 PATCH，服务端复用现有校验和授权，无数据库变更。OpenAPI 与 `web/src/api/schemas.d.ts` 需同步。Web 输入用 `type=date`；移动端预填时从 `YYYY-MM-DD` 分段构造本地日期，保存时用 `formatLocalDateOnly`，且日期单独编辑不带未改的标题/描述。

不纳入地点、预算、封面/经纬度编辑、日期清空、记录修改、提醒行为或目标日期排序逻辑。验证只覆盖 schema、静态 SQL/字段检查和各 workspace lint/build；没有真实 MySQL、设备或多账号并发集成环境。

实现完成：服务端 PATCH schema 接受可选 `targetDate`，最终 UPDATE 动态增加 `target_date = ?`；已有关系授权仍套用到整条 UPDATE。OpenAPI 和 Web 生成类型同步。Web 详情目标日行有编辑 dialog 并复用成功后的查询缓存失效；移动端已有标题/描述编辑页新增本地日期选择，只提交已更改字段。

验证结果：schema 13 项矩阵通过；server lint/build、Web API 生成/lint/build、app lint/typecheck、`git diff --check` 均通过。Web build 有依赖中既有注释和 bundle 大小警告。未执行真实数据库、浏览器或真机验证，也未验证多账号并发时序。
