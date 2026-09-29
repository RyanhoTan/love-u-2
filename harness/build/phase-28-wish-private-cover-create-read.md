# Phase 28 — Wish private cover create/read

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001：心愿支持可选封面，隐私资源必须保持情侣范围访问。
- `server/src/router_handler/upload.ts`：认证上传只返回 `{ key }`，不返回 public URL。
- Web/App 心愿创建目前读取不存在的 `uploaded.url` 并把其作为 `cover` 提交；server `createWishSchema` 旧契约只接受 URL。
- Phase 27：关系授权后的 300 秒 `createMediaReadUrl` 读取模式及 `private, no-store` 响应策略。
- `server/src/db/schema.ts`：`wishes` 采用 additive column ensure，可为既有表添加缺失 nullable 列。

## Objective

Web/App 可上传并创建带私有封面的心愿；只有先通过现有心愿关系授权的读取 API 才签发短期媒体 URL。既有 `cover` URL 行继续可读且数据不回填、不删除。

## Material decisions

- 在 `wishes` 增加 nullable `cover_object_key VARCHAR(2048)`，原 `cover` 列保留为 legacy URL；不改写或清理历史记录。
- `POST /wishes` 接受 `coverObjectKey`，校验格式和对象键路径属于当前认证上传者；旧 `cover` URL 仍可用于兼容客户端。新 App/Web 只提交 `coverObjectKey`。
- `GET /wishes`、详情、记录、回收站以及返回 Wish 的 mutation 响应在用户/情侣关系授权后序列化签名 URL；不在响应返回 object key、不持久化 signed URL。
- 私有 cover URL 300 秒有效，包含该 URL 的响应设置 `Cache-Control: private, no-store`；页面重新读取取得新链接。Web Wish 查询针对 window focus 单独开启 refetch，App 按当前屏幕生命周期/焦点重新读取。
- cover 字段仍由详情/列表现有 `cover` 名称承载，降低客户端变更面；历史 HTTP(S) URL 原样保留。
- 数据库列仅 additive、nullable，旧应用写入 `cover` 不受影响；回滚时可保留未使用列，不做有损 DROP。

## In scope

- Wish schema additive column、create request schema、对象键所有权检查及 INSERT 更新。
- Wish serializer 在已授权读取后生成签名 cover URL，并为包含链接的 list/detail/create/update/delete/restore responses 禁止缓存。
- Web/App 心愿创建使用上传返回 `key`，通过本地选择文件/资产作上传前后预览，不把 `file://` 或 blob URL 持久化。
- OpenAPI 创建请求契约和生成类型同步；相关 PRD、PLANS、context 与 build log 记录。

## Explicit non-goals

- 不实现已有心愿封面的替换、清除或封面编辑 UI。
- 不迁移 Wish record attachments、Wish chat/audio、Chat 消息或媒体生命周期。
- 不将 R2 public URL 写入 DB，不更改 `cover` 列或删除历史 URL。
- 不执行真实数据库 migration、R2 上传/删除、浏览器/设备联调、push 或 deploy。

## Acceptance criteria

- 对新增 cover object key 保存到 additive nullable 字段；客户端只从 `/upload/media` 上传者的 `key` 形成 `coverObjectKey`，不提交本地 URI/public URL。
- 未授权或不属于当前用户的 key 被拒绝；授权心愿读响应将 object key 转为 300 秒 signed URL，body 不暴露 object key。
- 所有包含已签名 cover 的 Wish GET/POST/PATCH/DELETE/restore 响应设置 `Cache-Control: private, no-store`；历史 `cover` URL 继续可读。
- Web/App 创建表单预览仍可用，保存失败显示错误且不伪报成功；API 返回的 signed cover 用于详情和列表。
- `pnpm --dir server lint`、`pnpm --dir server build`、`pnpm --dir web api`、Web lint/build、App lint/typecheck 与 `git diff --check` 通过；schema matrix 覆盖新/旧契约和对象键归属规则。

## Verification and limitations

- Verification: `pnpm --dir web api`; `pnpm --dir server lint`; `pnpm --dir server build`; `pnpm --dir web lint`; `pnpm --dir web build`; `pnpm --dir app lint`; `pnpm --dir app exec tsc --noEmit`; `git diff --check` — all passed.
- Schema matrix passed for absent cover, legacy URL, valid album key shape, wrong folder, path traversal, query delimiter, and malformed legacy URL. Static authorization review confirmed create rejects keys not prefixed by `album/${authenticatedUserId}/`; all reads serialize only after existing Wish scope checks.
- Additive DDL 未连接真实 MySQL 验证；R2 signed URL、URL 过期、浏览器/设备渲染待集成验证。
- 如果对象上传成功但 DB 写入失败，本阶段不执行 R2 删除，会留下未引用对象；后续媒体生命周期阶段需定义自动清理/补偿策略。

## Handoff

已完成，等待独立提交。后续按 PRD P0 优先处理心愿封面更新/清除或过程记录媒体，以本阶段私有 key 与签名读取契约为基础。
