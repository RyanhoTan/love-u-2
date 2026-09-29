# Phase 16 context

原 `createWishRecord` 先经 `findWishById` 确认心愿可见，再检查表存在，最后执行不带任何心愿/关系条件的 `INSERT ... VALUES`。预查和插入之间若关系解绑或心愿删除，仍会创建记录，并可能继续处理媒体。Phase 15 的写入授权谓词可在 `INSERT ... SELECT FROM wishes` 中复用，同时约束 `deleted_at IS NULL`。

该改动只覆盖记录行的插入边界，不处理媒体插入失败后的部分成功、缩略图对象回滚或用户提供 URL 的所有权；这些风险独立存在，不应据此宣称完整媒体闭环。

最终 INSERT 采用 `SELECT wishes.id, ... FROM wishes`，其 WHERE 同时检查 id、复用的写入授权条件和 `deleted_at IS NULL`。字段仍按原先的八个请求/用户值写入，`wish_id` 取同条已授权的心愿行；`affectedRows === 0` 在任何缩略图或媒体操作之前返回 404。静态聚焦检查确认八个值加一个 id 占位符，授权条件另外以参数化值填入。服务端 lint/build 已通过，但没有隔离 MySQL 的真实并发验证。
