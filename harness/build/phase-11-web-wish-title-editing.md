# Phase 11 — Web wish title editing

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001: 用户可以编辑心愿；状态、字段与删除语义须保持真实和跨端一致。
- Phase 08 已有受当前情侣关系/个人范围约束的 `/wishes/:id` PATCH，可更新 status 与 description。
- 当前 server `updateWishSchema`、handler、OpenAPI 和 Web detail 页面均未支持/呈现标题编辑。

## Objective

Web 用户可以查看并编辑心愿标题。服务端只接受经校验的标题值，并在更新时再次检查当前关系/个人资源范围；Web 保存成功只在真实 PATCH 成功后反映新标题，失败时保留草稿并显示错误。

## In scope

- 为 `updateWishSchema` 增加可选 title：trim、非空、最多 100 字符；至少一个更新字段仍为必填。
- 在现有参数化、原子范围授权的 UPDATE 语句中加入固定 `title` 列更新；保留 status 和 description。
- 同步 `web/openapi.json` 的 PATCH summary/description/schema，并重新生成 Web 类型。
- Web 心愿详情显示真实标题，增加标题编辑按钮和有提交中/错误状态的 dialog。
- 同步 PRD 实现基线、PLANS 和 build log。

## Explicit non-goals

- 不添加移动端标题编辑 UI。
- 不编辑描述以外的其他元数据字段，不改变状态流转、记录、软删除、恢复或永久删除。
- 不新增数据库列、表、迁移、依赖或自动化测试框架。
- 不连接 MySQL、生产环境或真实用户数据。

## Acceptance criteria

- `title` 接受 trim 后 1–100 字符的字符串；拒绝空白标题和超过 100 字符的标题。
- 未知字段仍由 Zod 拒绝；空 PATCH 仍拒绝；现有 status-only 和 description-only 请求仍接受。
- 标题值通过 SQL 参数写入；字段/SQL 列映射由服务端代码固定。
- 更新 UPDATE 仍包含现有 relationship/creator 授权条件、未删除条件及关系状态重检。
- Web 详情可读到并显示真实标题；编辑 dialog 在保存中禁用重复提交，失败时保留输入，成功后依 Query invalidation 更新真实标题。
- `pnpm --dir server lint`、`pnpm --dir server build`、`pnpm --dir web api`、`pnpm --dir web lint`、`pnpm --dir web build` 和 `git diff --check` 通过。

## Verification

- 使用 Zod parse/safeParse 验证合法、空白、超长、unknown、空 PATCH 与既有 status/description payload。
- 运行 server lint/build。
- 生成 Web API 类型后运行 Web lint/build。
- 静态 review 检查 SQL 参数和值域、关系授权和错误/成功流。
- `git diff --check`。

## Risks and limitations

- 本仓库当前没有集成测试脚本；schema 解析和构建不能代替真实数据库授权集成测试。
- 未连接 MySQL，无法观察跨情侣/关系解绑竞争条件的运行时结果；本阶段沿用 Phase 08 已有 SQL 授权谓词。

## Handoff and stop condition

满足验收、记录真实验证和限制并单独提交后完成。后续移动端仍需单独接入同一 title PATCH，并验证端间一致。
