# Phase 18 context

`findActiveAnniversaryForUser` 首先找用户当前 bound 关系，再按纪念日 id 和 relationship id 读取 active 行；但编辑与删除最终只按 `id` 和 `status = 'active'` 更新。预读后用户解绑或关系改变时，原关系纪念日仍可能被写入。新的最终谓词应同时钉住原 relationship id、bound 状态及成员资格，沿用现有 404 失败语义。

此阶段不决定解绑后历史纪念日如何归属或何时清理。真实 MySQL 事务隔离与并发时序尚不能在本地无授权测试库的情况下验证。

编辑和删除现共用 SQL 谓词：固定预读得到的 relationship id，并要求 `couple_relationships` 中该关系仍为 `bound` 且当前用户是任一成员。两个 UPDATE 仍按 id 与 active 状态筛选；参数都由查询绑定传入，受影响行数为零时返回原有 404。未登录由 handler 的 `getAuthenticatedUserId` 拒绝，非成员或跨关系在预读阶段不可见。预读后的解绑或状态变化由最终 SQL 再拦截。
