# Phase 03 — Web profile editing

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-AUTH-001、R1 可信核心闭环以及“个人资料部分实现”的基线。
- 现有 `/userinfo` GET/PUT、Web auth session 与移动端资料编辑行为。
- 用户授权按 PRD 小步实现并在每个小点完成后提交。

## Objective

把 Web “个人资料”从占位页改为可用表单，使用户能够修改昵称、签名和可选生日，并立即刷新
当前 Web session 展示。

## In scope

### Small point A — Nullable birthday contract

- 允许 `/userinfo` PUT 使用 `birthday: null` 清空生日。
- 同步 OpenAPI 与生成的 Web 类型。
- 运行 schema 解析、server lint/build、Web type/build 验证。
- 独立提交。

### Small point B — Web profile form

- 为 Web API 添加资料更新方法。
- 新增真实个人资料编辑页并替换占位路由。
- 支持昵称、签名和可选生日；保留当前头像，不实现新上传。
- 成功后刷新 auth session 并返回“我的”页面。
- 展示字段验证、请求失败与保存中状态。
- 独立提交。

## Explicit non-goals

- 不新增头像上传、性别编辑、密码修改或账号删除。
- 不修改移动端资料页。
- 不访问真实用户数据或部署环境。
- 不推送或部署。

## Dependencies and prerequisites

- `/userinfo` 已支持认证后的 GET/PUT。
- 用户资料表已包含 nickname、avatar、signature、birthday 等字段。
- Web 与 server 依赖已安装；修改前 lint/build 通过。

## Expected affected files

- `server/src/schema/user.ts`
- `web/openapi.json`
- `web/src/api/schemas.d.ts`
- `web/src/api/user.ts`
- `web/src/pages/profile-page/index.tsx`
- `web/src/routes/me.tsx`
- `PRD.md`
- `PLANS.md`
- `harness/build/phase-03-web-profile-editing.md`
- `harness/build-log.md`

## Approval gate

本阶段已由用户的 PRD 实施请求授权。头像上传、密码与账号生命周期另行规划。

## Red, green, refactor, verification plan

- **Red A:** 当前 Zod schema 对 `birthday: null` 返回验证失败。
- **Green A:** null 通过且无效日期仍失败，生成类型为 `string | null`。
- **Red B:** `/me/profile` 当前由 `PlaceholderPage` 提供，没有资料保存调用。
- **Green B:** 真实表单调用 PUT，成功刷新 session，失败保留输入并显示错误。
- **Refactor:** 复用现有 Input、Button、PageBody 和 auth context，避免新依赖。
- **Verify:** server lint/build、Web lint/build、静态路由检查、diff 自审。

## Acceptance criteria

- 无生日用户可只修改昵称或签名，生日也可以被明确清空。
- 无效生日仍被服务端拒绝。
- Web 用户可查看当前用户名/头像，并编辑昵称、签名和生日。
- 昵称最多 30 字符、签名最多 200 字符；生日不能晚于今天。
- 保存失败不离开页面、不显示成功；保存成功后 auth session 和“我的”页立即反映新资料。
- Web profile 路由不再使用占位页。
- server 与 Web lint/build 通过。
- 两个小点分别提交，提交信息遵循仓库历史风格。

## Evidence required before completion

- nullable birthday 修改前后 schema 解析结果。
- API 类型生成结果。
- Web 路由和更新调用的静态证据。
- server/Web lint/build 结果。
- 两个提交 SHA。

## Handoff and stop condition

两个小点验证并提交后将 Phase 03 标记为 `Complete`。不自动扩展到头像、密码或账号删除。
