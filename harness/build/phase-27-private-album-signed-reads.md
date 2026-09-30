# Phase 27 — Private album reads with short-lived signed URLs

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-MEMORY-001：关系媒体读取需要关系权限及受控 URL；签名过期、越权访问是验收路径。
- Phase 26：相册与故事媒体已保存由认证上传接口返回的 `objectKey`，但没有签名读取地址。
- `server/src/router_handler/media.ts`：`GET /media/:id/url` 先以活动 album scope 查询记录，再为对象键生成 300 秒签名 URL，响应 `private, no-store`。
- `server/src/router_handler/album.ts`：媒体与故事 serializer 仍从旧 `url` 列序列化；故事封面、媒体明细的 scope 和缩略图行为需核对。
- Web PhotosPage 与 App 故事列表/详情消费 `url`、`coverUrl`、`thumbnailUrl` 字段，已有兼容形状。

## Objective

已授权的相册/故事读取响应为私有 object-key 媒体生成短期签名 URL，并让现有 Web 图库和 App 故事页面可加载新媒体；响应不泄露对象键或长期 public URL。

## Material decisions

- 只有完成认证用户的 album/relationship scope 查询后，才为已授权的 `object_key` 调用 `createMediaReadUrl`；保留 `url` / `coverUrl` 字段以兼容两端现有消费者。
- 每个 signed URL 使用现有 300 秒 TTL；包含 signed URL 的读取和创建/收藏响应设置 `Cache-Control: private, no-store`。重新读取会重新签名。
- `object_key` 不进入 JSON 响应；不把签名地址写回数据库，不公开 bucket URL。
- legacy `object_key` 为空的已有行继续按旧 `url` 读取；本阶段不进行 URL/key 数据迁移或处理 Wish legacy media。
- `object_key` 媒体的 `thumbnailUrl` 不返回本机 `file://` 路径。新登记的相册与故事上传停止提交本地 URI 为 thumbnail 元数据；视频封面在 App 使用安全占位图，详情仍可通过签名 URL 播放。
- 故事封面读取只联结同关系/创建者范围内的封面媒体；故事详情媒体查询也应用当前 scope，避免仅凭 `source_id` 扩大数据集。
- 暂不实现签名 URL 自动续期 timer；用户重新进入或手动重载页面时由已授权 API 获取新地址。自动续期和大媒体分页在后续性能阶段评估。

## In scope

- 为 object-key 的 `AlbumMedia` 和故事封面序列化 300 秒签名 URL，并阻止缓存相关响应。
- 确保 album media、story、story media 的数据读取都受当前 authenticated album scope 限制。
- 同步 OpenAPI 对签名 URL / `coverMediaType` 响应语义的描述与生成类型。
- Web 图库以返回的签名 URL 加载私有图片/视频；App 故事列表/存放位置页与详情使用签名链接，并对视频封面使用静态安全占位。
- 清除 App 上传路径中的本地缩略图 URI，并同步 PRD、计划、阶段 context 和 build log。

## Explicit non-goals

- 不向 Web/App 增加对象键直读权限、不使用公开 bucket URL、不更改用户/情侣认证模型。
- 不迁移旧媒体、Wish 封面/记录或聊天语音；不实现上传回滚、孤儿对象清理、删除、压缩、缩略图生成或分页。
- 不保证签名地址过期后当前打开的屏幕自动续期；再次读取会签发新 URL。
- 不连接真实数据库、R2、用户账号、浏览器或设备；不部署或推送。

## Acceptance criteria

- 已授权对象键媒体的 GET 响应 `url` 为 300 秒签名地址；URL 不写数据库、`object_key` 不出现在 response body。
- 媒体、故事封面和故事详情媒体均在签名前受当前关系 scope 保护；不存在或越权媒体不返回签名地址。
- 所有包含签名地址的 endpoint responses 设置 `Cache-Control: private, no-store`；GET 时签名失败不伪装为读取成功。
- legacy URL 行和 legacy wish record 媒体保持现有兼容行为；本地 `file://` 缩略图不跨端返回。
- Web 相册网格、App 故事列表/位置选择和故事详情对图片使用签名 URL；App 不把视频 URL 作为图片源，点击视频仍进入既有播放器。
- OpenAPI 与生成类型描述 `coverMediaType` 及签名 `url` 字段；`pnpm --dir server lint`、`pnpm --dir server build`、`pnpm --dir web api`、Web lint/build、App lint/typecheck 与 `git diff --check` 通过。

## Verification and limitations

- `pnpm --dir server lint`、`pnpm --dir server build`、`pnpm --dir web api`、`pnpm --dir web lint`、`pnpm --dir web build`、`pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、`git diff --check` 均通过。
- 静态复核所有调用 async media/story serializer 的路径都在当前 scope 查询之后；故事封面 join 和详情媒体查询另有关系/创建者 scope；包含签名链接的 7 个读取/写入响应统一 `private, no-store`。
- `createMediaReadUrl` 在签发后不持久化 URL；现有函数默认 300 秒，媒体 ID endpoint 显式使用同一 TTL。OpenAPI 生成类型包含 `coverMediaType` 和 URL 过期说明。
- Web 页面在窗口重新聚焦时由 TanStack Query 重新获取；App 故事/位置/详情页面在重新聚焦时重取短时 URL。App 视频封面显示占位图，详情仍调用既有播放器。
- Web build 仍有依赖 Zod 注释位置和 >500 kB bundle 的警告。
- 现有列表没有分页，因此每次已授权读取会为返回的所有 object-key 媒体生成签名；规模增长时需在后续加入分页/按需 URL。
- 没有 DB/R2/浏览器/设备集成；未观察真实 300 秒过期或 R2 签名访问。服务器无自动化 test 脚本，本阶段没有把静态核对记作集成测试。

## Handoff

完成后独立提交。后续继续 Wish/Chat 上传消费者迁移、媒体生命周期补偿与过期 URL 的客户端自动刷新评估。
