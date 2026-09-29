# Phase 12 — Mobile wish title editing

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001：用户可编辑心愿；两端字段语义需一致。
- Phase 11 已让 server `/wishes/:id` PATCH 支持 trim 后 1–100 字符的 title，并更新了 Web/OpenAPI 契约。
- 移动端现有 `/home/wish-list/[id]/edit` 页面可以编辑 description，但 API client 类型不支持 title。

## Objective

用户可从移动端心愿详情进入编辑页修改标题和描述。提交时只发送确实修改的字段，避免只编辑标题时用旧描述覆盖服务端的新值；服务端失败时保留输入并只在成功后反馈。

## In scope

- 扩展 app `UpdateWishPayload` 支持 title-only 和 title+description PATCH，同时保留 status/description 请求。
- 在当前编辑页加载并显示真实 title 和 description。
- title 最大 100 字符，trim 后不能为空；描述保留 1000 字符上限并允许清空。
- 根据与加载初始值的比较，仅提交变化字段；无变化时不发空 PATCH。
- 保存中禁用重复提交；失败保留全部输入；成功后提示并返回详情，由 Phase 09 的 focus refresh 拉取最新值。
- 同步 PRD、PLANS 和 build log。

## Explicit non-goals

- 不修改 server/OpenAPI/Web；复用 Phase 11 已完成的契约。
- 不编辑目标日期、地点、预算、封面或经纬度。
- 不改变心愿状态、记录、删除、恢复或永久删除语义。
- 不新增数据库结构、依赖或自动化测试框架。
- 不访问真实账号、生产环境或数据库。

## Acceptance criteria

- 编辑页打开后 title 与 description 初值来自服务端。
- title 支持 1–100 个 trim 后非空字符；description 支持 0–1000 字符。
- 只改 title 时 PATCH body 仅包含 `title`；只改 description 时只包含 `description`；两者都改时两者均发；无更改不发空 PATCH。
- 保存失败保留两字段输入并显示错误；成功 toast 只在 PATCH 成功后展示，随后返回详情。
- 现有 status PATCH 调用通过类型检查且请求形状不变。
- `pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit` 与 `git diff --check` 通过。

## Verification

- app lint 与 `tsc --noEmit`。
- 静态 review 检查 payload 分支只包含变化字段，且状态 PATCH 调用仍兼容。
- `git diff --check`。

## Risks and limitations

- 本仓库无 app 自动化测试基础；payload 条件以源码 review 和 TypeScript 验证。
- 未运行 Android/iOS 模拟器、真实账号或数据库；服务端权限已在 Phase 11 沿用原关系范围约束，但真实跨账号集成仍未验证。

## Handoff and stop condition

所有验收和验证证据记录后单独提交本点，再由活动 Goal 继续其他 P0 缺口。
