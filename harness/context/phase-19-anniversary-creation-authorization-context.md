# Phase 19 context

创建纪念日先读当前 bound 关系；若此后解绑或关系状态改变，原 `INSERT ... VALUES` 仍把 `relationship_id` 写入刚失效的关系。改用同语句 `SELECT` 当前关系能在插入时复核 id、bound 状态和成员资格。零行插入使用既有“找不到已绑定关系”409，而不是返回已创建成功。

该阶段不改变解绑后既有纪念日归属或历史访问规则。真实并发与 MySQL 隔离语义需要隔离测试库；本地仅能做静态与构建验证。

最终 INSERT 从 `couple_relationships` 的同一条已授权关系行选出 `relationship_id`，其余六个纪念日写入值保持原顺序；WHERE 固定预查关系 id，并要求 bound 与当前用户任一成员身份。`affectedRows === 0` 在后续读取和 201 响应之前返回原有 409。聚焦静态检查确认 9 个占位符（六个值加三个关系/成员条件）及零行分支顺序；server lint/build 通过。
