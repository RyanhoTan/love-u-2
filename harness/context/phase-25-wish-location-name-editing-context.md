# Phase 25 context — Wish location-name editing

心愿模型包含 `location_name VARCHAR(100) NULL`、latitude 和 longitude nullable 字段。`createWishSchema` 已将地点名 trim 并限制在 100 字符；移动端创建可通过 `MapPickerModal` 收集坐标，Web 创建页只录入地点文本。详情 API 序列化空名称为 `""`，坐标保持 number/null。

Phase 23 起 PATCH 由严格 `updateWishSchema` 解析，handler 按 payload 字段动态组装参数化 UPDATE，最终写入仍通过 `buildWishWriteAuthorization` 限制当前情侣/个人范围。当前允许字段有 title/status/description/targetDate/budgetAmount。Web `WishDetailInfo` 以 `MetaRow` 渲染地点；App `app/app/home/wish-list/[id]/edit.tsx` 已按变化字段提交标题、描述、日期、预算。

本阶段仅增加 `locationName` 文本更新。使用创建时的 trim/max 100 规则；PATCH `""` 写 SQL NULL，清除后显示 fallback。两端只发 locationName，不发送未改的其他字段。重要决定：即便名称变化也保留既有 latitude/longitude，因为仅修改名称并不必然表示改变地图位置；Web dialog 和 App 表单需明确告知这一行为。

不做地图、坐标、自动补全和外部地理服务；不改变创建 UI、schema migration、媒体记录或其他心愿字段。验证 schema 正反矩阵及服务端/Web/移动端 lint/build/typecheck，无隔离数据库和真机环境。

实现完成：服务端 PATCH 增加 trim/max 100 的可选 `locationName`，空字符串写 NULL；SQL assignment 只触及 `location_name`，保留坐标。OpenAPI 及生成类型已同步。Web 地点行新增编辑 dialog，移动端编辑页增加地点名称输入；两端仅提交此字段并说明坐标不变。

验证：12 项 schema 矩阵通过；server lint/build、Web API 生成/lint/build、app lint/typecheck、diff 检查通过。首轮 Web build 与 codegen 并行，先读旧生成类型并失败；单独重跑 Web build 通过。未测试真实数据库、设备或并发授权。
