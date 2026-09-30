# Phase 25 — Wish location-name editing

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001：心愿支持地点，字段按场景可为空。
- Phase 23–24：心愿 PATCH 已支持受校验的目标日期和预算字段；客户端单独提交真实变化字段。
- 创建 schema 已将 `locationName` trim 后限制到 100 字符；wish 数据包含独立 nullable latitude/longitude。
- Web/App 心愿详情都显示地点名称，创建表单均可填写地点文本。

## Objective

Web 和移动端可更新或清除心愿地点名称。服务端对名称执行与创建时相同的 trim/100 字符限制，空字符串写为 NULL 并序列化为 `""`；只更新地点名称，不隐式修改或清除已有经纬度。

## Material decisions

- 本阶段仅编辑 `locationName` 文本，不做地图选择、地理编码、经纬度编辑或路线/导航能力。
- 清空名称是有效操作并将列设为 NULL；超过 100 字符由输入和服务端 schema 阻止，服务端 trim 前后空格。
- 名称与纬经度目前是独立数据库字段。本次文本编辑明确保留既有坐标，UI 同时告知用户，不推测名称变化等于移动坐标变化。
- PATCH 继续使用严格字段 schema、动态 SQL assignment 和现有最终心愿/情侣关系授权；没有 locationName 字段的请求保持旧行为。
- Web 使用现有详情行编辑 dialog；移动端复用已有心愿编辑页的变更字段提交逻辑。
- 不调整新建流程、坐标权限、数据库结构、状态/预算/目标日期语义。

## In scope

- 服务端 PATCH schema/handler 支持可选地点名称，确保清空写 NULL 且保留坐标。
- 同步 OpenAPI 与 Web 生成请求类型。
- Web 地点行和移动端心愿编辑页提供预填、修改、清除及保存错误反馈。
- 同步 PRD 当前基线、阶段计划、context 与 build log。

## Explicit non-goals

- 不实现经纬度更改、地图、地点自动补全、外部地理服务或当前位置能力。
- 不修改封面、预算、标题、描述、目标日期、过程记录或相册媒体。
- 不做真实数据库、账号、浏览器或设备集成；不推送或部署。

## Acceptance criteria

- PATCH 接受可选字符串地点名称；前后空格去除，最大 100 字符，空文本转为数据库 NULL；超长、错误类型或未知字段被拒绝。
- handler 仅为显式提供的 `locationName` 添加 `location_name = ?`；未提交纬经度时不修改其列，最终 UPDATE 仍有现存授权谓词。
- Web/App 编辑值来自服务端；空值保存后显示“未定/—”；无变化不提交；失败时保留草稿并展示错误。
- 两端只提交地点名称，不随保存发送可能过期的标题、描述、日期、预算或坐标。
- OpenAPI/生成类型和 PRD 能力基线一致。
- `pnpm --dir server lint`、`pnpm --dir server build`、`pnpm --dir web api`、`pnpm --dir web lint`、`pnpm --dir web build`、`pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、`git diff --check` 通过。

## Verification and limitations

- 用 `updateWishSchema` 执行 12 项矩阵：空名称与纯空格 trim 后清除、前后空格、100/101 字符、错误类型、未知字段、预算混合更新、标题兼容及空 payload。
- `pnpm --dir server lint`、`pnpm --dir server build`、`pnpm --dir web api`、`pnpm --dir web lint`、`pnpm --dir web build`、`pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、`git diff --check` 均通过。
- 静态复核确认 handler 仅更新 `location_name` 且不生成经纬度 assignment，现有最终 UPDATE 授权条件不变。Web 构建第一次与 OpenAPI 类型生成并行导致读到旧类型，按顺序重新生成类型后重跑通过。
- Web build 有依赖 Zod 注释位置与 >500 kB chunk 的既有警告。
- 没有隔离数据库、浏览器或设备，未验证真实 NULL 回读、表单布局或写入并发。

## Handoff

证据已记录；此阶段独立提交后，继续检查 PRD-WISH-001 的封面、记录编辑和跨端一致性缺口。
