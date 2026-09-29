# Phase 26 — Album object-key write contract

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-MEMORY-001：关系媒体须经服务端关系授权，不得仅凭可猜测或公开对象地址读取。
- `server/src/schema/album.ts`：相册媒体与故事媒体创建要求 `objectKey`；拒绝 URL、本地路径、空键及越权对象键。
- `server/src/router_handler/upload.ts`：认证上传返回私有存储 `key`，刻意不返回 public URL。
- `server/src/router_handler/album.ts`：媒体登记将对象键关联至当前认证用户/情侣关系；Web 与移动端请求类型最初仍使用 `url`。

## Objective

Web/App 的相册与故事上传流程上传文件后使用服务端返回的对象键，调用登记 API 建立关系范围内媒体记录；客户端不再把浏览器/设备本地 URI 或 public URL 当作服务端对象键。

## Material decisions

- 服务端 schema/handler 是该写入路径的当前真实契约：`POST /upload/media` 获取 `key`，`POST /album/media` 和创建故事的 `media[]` 提交 `objectKey`。
- 对象键与媒体登记是两步操作：对象由已认证用户上传，登记时 server 校验对象键归属并以当前关系 scope 创建记录。
- 本阶段只覆盖 Web/App 相册独立上传与移动端故事创建的写入登记；不将仍在使用 url/audioUrl 的 Wish/Chat 上传消费者混入并行改造。
- 当前服务端 GET/响应的 signed read URL 接入是独立下一阶段；本阶段不声称相册新上传已经能在客户端预览，也不回退到公开 URL。
- `UploadMediaResponse` 的 OpenAPI 声明与不同领域的旧调用者目前也存在差异；待消费者逐一迁移到 object key / 授权读 URL 后再单独更正全局契约。

## In scope

- Web OpenAPI `CreateAlbumMediaRequest` 和 `CreateAlbumStoryMediaInput` 字段从旧 `url` 同步至服务端的 `objectKey`，再生成 TypeScript。
- Web 相册上传先发二进制上传请求，再以返回的 `key` 调用媒体登记 API。
- App 相册上传 hook 先通过现有认证上传函数上传每个资产，再以 `key` 登记记录；故事创建同样提交 object key。
- 补充执行计划、PRD 当前基线、阶段 context/build log。

## Explicit non-goals

- 不暴露 bucket public URL、不添加公开读接口、不修改认证/关系权限逻辑。
- 不接入 signed read URL，不解决照片页/故事页读取新 object-key 文件的显示链路；作为后续独立阶段。
- 不改 Wish cover/record 与聊天音频使用的历史 URL 协议、不做对象回收或孤儿清理。
- 不连接真实 R2、数据库、账号、浏览器或设备；不推送或部署。

## Acceptance criteria

- OpenAPI 生成类型和服务端实际创建 schema 均将相册/故事媒体标识命名为 `objectKey`。
- Web 上传成功后使用返回对象键登记媒体，不能发送浏览器 `File` 本地预览 URL。
- App 相册列表上传实际上传本地 asset 字节后登记返回对象键；移动端故事提交相同类型字段。
- 认证用户的对象键归属检查与 relation scope 仍在服务端执行；客户端没有获得或存储公开 URL。
- 未变更其它 Wish/Chat 上传流程；文档清楚指出新对象读取/显示链路仍待 Phase 27。
- `pnpm --dir web api`、`pnpm --dir web lint`、`pnpm --dir web build`、`pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、schema 矩阵和 `git diff --check` 通过。

## Verification and limitations

- `pnpm --dir web api`、`pnpm --dir web lint`、`pnpm --dir web build`、`pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit` 和 `git diff --check` 均通过。
- 用服务端 Zod schema 执行 6 项矩阵：相册/故事接受对象键，拒绝空值、public URL、本地绝对路径及 url-only 故事媒体。
- 静态复核 `createAlbumMedia` 与 `createAlbumStory`：登记前验证对象键属于当前用户，并以 `buildAlbumScope(userId)` 绑定当前关系；故事媒体在事务中写入。
- Web build 保留依赖 Zod 注释位置和 >500 kB bundle 的既有警告。
- 无真实 DB/R2/设备集成；服务端上传响应 OpenAPI 与旧 Wish/Chat 消费者仍不一致；GET 为新对象返回可展示签名 URL 属于后续必须工作。

## Handoff

此阶段独立提交；下一阶段为经授权的相册 GET/故事 GET 发放短期 signed URL 并接入读取 UI。之后继续迁移 Wish/Chat 媒体协议。
