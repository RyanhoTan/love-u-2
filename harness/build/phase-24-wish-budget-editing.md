# Phase 24 — Wish budget editing

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001：心愿支持可选预算，并可按场景为空。
- Phase 23：心愿 PATCH 已可在两端编辑目标日期，且客户端只提交真实变更字段。
- `server/src/db/schema.ts`：`wishes.budget_amount` 使用 MySQL `INT NULL`。
- 当前 `formatBudget` 对 `null` 显示“未定”；创建表单也使用 `null` 表示未填写。

## Objective

Web 与移动端用户可以修改或清除心愿预算。服务端 PATCH 接受非负整数或 `null`，范围限制为数据库有符号 INT 的 `0` 至 `2,147,483,647`；清空后 API 返回 `null`，界面显示“未定”。

## Material decisions

- 预算以人民币整数元表示，与现有创建表单、记录表单、数据库字段和详情显示一致；不引入小数/分币语义或货币单位选择。
- `null` 表示未设置，因此编辑框留空会清除预算，数字 `0` 是有效且与未设置不同的值。
- 服务端沿用严格 PATCH schema 和既有写入时情侣/个人关系授权；只有 payload 显式包含 `budgetAmount` 才更新，未编辑预算时不覆盖。
- 新建与更新共享同一预算 schema，并补上已存储列所需的最大值限制，避免接受超过 MySQL signed INT 范围的请求。
- Web、移动端都只编辑预算这个字段；其他标题、描述、日期的当前值不随预算单独保存。
- 不改数据库结构、创建流程交互、记录预算、预算格式化、地点/封面或货币体系。

## In scope

- 创建和更新 schema 共享非负整数/nullable/数据库范围校验；PATCH handler 安全绑定 `budget_amount`。
- OpenAPI 与 Web 生成请求类型同步，明确 `null` 清除及数值上限。
- Web 心愿详情预算行增加输入 dialog；移动端心愿编辑页预填并提交变更值。
- 两端允许清空预算、显示整数校验错误、保留服务端失败反馈；更新 PRD 与阶段证据。

## Explicit non-goals

- 不实现小数、货币切换、预算范围、预算分摊或实际支出统计。
- 不改地点坐标、封面、标题、描述、目标日期或心愿记录编辑能力。
- 不连接真实 MySQL、账号、浏览器或移动设备；不推送或部署。

## Acceptance criteria

- 创建和更新 schema 接受 `0`、最大 signed INT 与 `null`；拒绝负数、小数、非数字类型及超过 `2,147,483,647` 的值。
- PATCH `{ budgetAmount: null }` 清除预算；正整数更新写入 `budget_amount`；无字段或不合法预算不进入 SQL 写入。
- UPDATE 仍使用现有最终写入关系授权条件，且仅在 payload 包含预算时添加绑定参数。
- 两端使用服务端值预填；清空后详情展示“未定”；值未变化时不写入；失败保留用户输入并展示错误。
- Web 和移动端只提交变化的字段；预算更新不会携带或覆盖未改的标题、描述和日期。
- OpenAPI 生成类型、PRD 当前能力基线与实现一致。
- `pnpm --dir server lint`、`pnpm --dir server build`、`pnpm --dir web api`、`pnpm --dir web lint`、`pnpm --dir web build`、`pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、`git diff --check` 通过。

## Verification and limitations

- 对 create/update schema 执行 15 项预算与兼容矩阵：0、null、INT 上限、目标日期混合更新、现有 title/status 和空 payload 通过预期；负数、小数、字符串和超过 INT 上限被拒绝。
- `pnpm --dir server lint`、`pnpm --dir server build`、`pnpm --dir web api`、`pnpm --dir web lint`、`pnpm --dir web build`、`pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、`git diff --check` 均通过。
- 静态复核确认预算只在 PATCH 显式提交时绑定到 `budget_amount = ?`，null 保持为 SQL NULL；现有 UPDATE 关系授权不变；Web mutation 继续刷新列表、详情、记录缓存。
- Web build 仍有依赖 Zod 注释位置和 >500 kB chunk 的既有警告。
- 无真实数据库与设备，因此未验证数据库实际写入/回读或控件在不同系统键盘下的交互。

## Handoff

证据已记录；此阶段独立提交后继续 PRD-WISH-001 的剩余编辑与过程记录缺口。
