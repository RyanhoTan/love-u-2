# Phase 24 context — Wish budget editing

PRD-WISH-001 将预算列为可选心愿字段。`wishes.budget_amount` 为 MySQL `INT NULL`；创建 schema 已接受任意非负整数或 null，但未约束 MySQL signed INT 上限。Web 创建页与 app 创建页都用人民币整数元，空值编码为 null；`formatBudget(null)` 在详情展示“未定”。

当前 PATCH 在 Phase 23 支持标题、描述、状态、目标日期，使用严格 Zod schema 和最终写入时的情侣/个人心愿授权谓词。服务端 handler 会根据 schema 已定义字段动态绑定 SQL assignment。Web 使用 TanStack Query mutation，成功时刷新心愿列表、详情和记录；移动端 `/home/wish-list/[id]/edit` 已按变更字段组装 payload。

本阶段应共享创建/更新预算 schema，最大 `2,147,483,647` 对应 MySQL signed INT，`null` 明确清除。更新只提交预算字段；不能附带过时的标题/描述/日期。输入接受只由十进制数字组成的 0 到最大值，空文本转为 null，负数、小数、字符和超范围均显示校验错误。

不改 schema migration、币种/小数、创建流程、记录表单或地点/封面。测试使用实际导出的 schemas 做边界矩阵，配合各 workspace 构建检查；无真实数据库或设备集成环境。

实现完成：创建和更新共用最大值 `2,147,483,647` 的 nullable budget schema；PATCH handler 只对显式提供的值增加 `budget_amount = ?`。Web 预算详情行新增 dialog；移动端心愿编辑页新增预算输入并按 changed-fields 组装 payload。空字符串提交 null，值未变化不会触发写请求。

验证：create/update 的 15 项实际 schema 矩阵通过；server lint/build、Web API 生成/lint/build、app lint/typecheck 和 diff 检查均通过。Web build 有依赖注释和 bundle 大小既有警告。未进行真实数据库或设备验证。
