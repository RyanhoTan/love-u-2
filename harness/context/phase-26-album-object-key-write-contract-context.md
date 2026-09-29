# Phase 26 context — Album object-key write contract

当前 server `/upload/media` 调用 `uploadMediaBuffer` 将对象存入 `${folder}/${userId}/...`，响应只有 `{ key }`，注释明确不暴露 public URL。`createAlbumMediaSchema` 和 `createAlbumStorySchema.media[]` 要求 `objectKey`，拒绝 `url` 字段作为真实存储键；handler 校验对象归当前用户并从当前 authenticated relation scope 插入 `album_media.object_key`。

Web `UploadPage` 虽调用上传 API，却把不存在的 `uploaded.url` 传给 `/album/media` 的旧 `url` 契约；App 相册上传 hook 甚至把设备本地 `asset.uri` 直接送入登记 API。App 故事上传取得 key/url 二者假定后也把 url 填到 `media[]`。OpenAPI 和生成类型仍记录旧请求字段。

Phase 26 只将 Web/App 相册及 App 故事的写入登记切到 `objectKey`：先上传二进制，再用返回的 key 关联媒体行。服务端无需更改，其 schema/handler 是源契约。全局 `/upload/media` OpenAPI 仍错误声明有 public URL，而且 Wish/Chat 继续消费 `url`，暂不在同阶段扩改。

重要缺口：相册 GET 当前序列化数据库 `url` 列，新 objectKey 行新写 `url = ''`；signed URL handler `/media/:id/url` 已存在但页面未使用。因此 Phase 26 只修复对象注册，不声称用户可预览新上传；Phase 27 必须在媒体 scope 验权后接入短期 signed URL 读取，而不能将 key 改造成可公开读取 URL。

## Phase 26 实施与核验结果

- Web 相册上传使用 `/upload/media` 返回的 `key` 创建 `objectKey` 媒体记录；OpenAPI 请求 schema 和生成类型同步至服务端字段名。
- App 相册上传先传送本地资产字节，再用返回的 `key` 登记；App 故事媒体数组同样提交 `objectKey`。
- `pnpm --dir web api`、Web lint/build、App lint/TypeScript 检查及 6 项服务端 schema 矩阵通过；build 只有现存 Zod 注释与 bundle 大小警告。
- 静态检查确认媒体登记验证当前用户的对象键，并按活动关系 scope 写入；未连接 DB/R2/设备。新媒体预览仍未打通，进入 Phase 27。
