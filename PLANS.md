# 合拍（InSync）执行计划

## 目的

本文件把 `PRD.md` 中已经确认的业务方向转换为经过确认的阶段顺序。单个阶段的范围、非目标、验收条件和验证方式由
`harness/build/` 下对应文件负责；实际进度和证据由 `harness/build-log.md` 负责。

## 当前路线图

`PRD.md` 已建立 Draft v0.1 的业务基线和 R1/R2/R3 方向。PRD 中标为待确认的业务决策仍不能由
代理推测。用户已授权按 PRD 持续推进 R1/P0 功能并逐个小点提交；Phase 02–59 已完成。
Phase 01 只读基线评估仍未开始，但不是当前 P0 迭代目标的前置条件。

| 阶段 | 名称 | 状态 | 依赖 | 结果 |
|---|---|---|---|---|
| 00 | Repository workflow foundation | Complete | 无 | 建立适配本仓库的 Codex 协作文件、边界和证据记录方式 |
| 01 | Repository baseline assessment | Not started | Phase 00 | 形成有证据的现状、风险和候选重构阶段建议，不修改业务代码；当前 P0 迭代不以此为前置条件 |
| 02 | Web today real-data baseline | Complete | Phase 00、PRD-TODAY-001 | 清除 Web 首页模拟业务内容，只呈现真实数据或诚实空状态 |
| 03 | Web profile editing | Complete | PRD-AUTH-001、现有 `/userinfo` | 允许清空生日并将 Web 个人资料从占位页改为真实表单 |
| 04 | Hide unfinished Web settings | Complete | PRD 7.4、R1 可信核心闭环 | 隐藏并移除 Web 个人中心尚无真实能力的入口和占位路由 |
| 05 | Hide unfinished mobile settings | Complete | Phase 04、PRD 7.4、R1 可信核心闭环 | 隐藏移动端通知、报告和主题入口并去除通知假保存页 |
| 06 | Hide fake mobile daily interactions | Complete | PRD-STATUS-001、R1 可信核心闭环 | 隐藏移动端硬编码状态/一句话入口并删除假成功页面 |
| 07 | Mobile today honest states | Complete | Phase 06、PRD-TODAY-001 | 移动端首页区分加载、失败、未绑定与真实已绑定数据 |
| 08 | Web wish description editing | Complete | PRD-WISH-001 | 通过受关系授权的 PATCH 支持 Web 用户编辑心愿描述 |
| 09 | Mobile wish description editing | Complete | Phase 08、PRD-WISH-001 | 移动端从心愿详情编辑描述并在成功后刷新详情 |
| 10 | Mobile wish detail honest states | Complete | PRD-WISH-001 | 加载失败时不展示假心愿字段或状态，并允许重试 |
| 11 | Web wish title editing | Complete | Phase 08、PRD-WISH-001 | Web 用户可通过受授权的 PATCH 修改非空心愿标题 |
| 12 | Mobile wish title editing | Complete | Phase 11、PRD-WISH-001 | 移动端可编辑非空标题，PATCH 只提交实际修改字段 |
| 13 | Mobile wish date-only serialization | Complete | PRD-WISH-001、PRD 10.5 | 创建心愿和过程记录时保留日期选择器显示的本地日历日期 |
| 14 | Wish calendar date validation | Complete | Phase 13、PRD-WISH-001 | 服务端拒绝不真实或超出当前 DATE 范围的心愿及记录日期 |
| 15 | Wish deletion lifecycle authorization | Complete | PRD-WISH-001、Phase 08 | 删除、恢复和永久删除在实际写入时重新约束当前关系授权 |
| 16 | Wish record creation authorization | Complete | Phase 15、PRD-WISH-001 | 过程记录插入与当前心愿/关系授权合为同一 SQL 语句 |
| 17 | Anniversary calendar date validation | Complete | PRD-DAY-001、Phase 14 | 服务端拒绝不真实或超出当前 DATE 范围的纪念日日期 |
| 18 | Anniversary mutation authorization | Complete | PRD-DAY-001、Phase 17 | 编辑与删除纪念日的最终 UPDATE 重新约束当前关系成员资格 |
| 19 | Anniversary creation authorization | Complete | Phase 18、PRD-DAY-001 | 纪念日插入时在同一语句确认当前 bound 关系及成员资格 |
| 20 | Honest anniversary reminder copy | Complete | PRD-DAY-001、R1 可信核心闭环 | 移动/Web 不再声称尚未实现的纪念日通知已经生效 |
| 21 | Mobile anniversary list honest states | Complete | PRD-DAY-001、R1 可信核心闭环 | 移动端纪念日列表区分加载、空数据与请求失败并提供重试 |
| 22 | Mobile anniversary editing and deletion | Complete | Phase 21、PRD-DAY-001 | 移动端列表可进入真实编辑表单并保存或删除纪念日 |
| 23 | Wish target-date editing | Complete | Phase 14、PRD-WISH-001 | 服务端、Web 与移动端支持受校验的心愿目标日期更新 |
| 24 | Wish budget editing | Complete | Phase 08、PRD-WISH-001 | 服务端、Web 与移动端支持校验、清空且不会覆盖其他字段的预算更新 |
| 25 | Wish location-name editing | Complete | Phase 08、PRD-WISH-001 | Web 与移动端可修改或清除地点名称，保存失败有反馈且保留坐标 |
| 26 | Album object-key write contract | Complete | PRD-MEMORY-001 | Web/App 上传后向相册和故事登记服务端返回的私有对象键，不再提交本地 URI |
| 27 | Private album reads with short-lived signed URLs | Complete | Phase 26、PRD-MEMORY-001 | 在关系授权的相册/故事读取响应中签发短时媒体地址，并供两端页面显示 |
| 28 | Wish private cover create/read | Complete | PRD-WISH-001、Phase 27 | Web/App 上传心愿封面后保存私有对象键，并在授权心愿读取中使用短期签名 URL |
| 29 | Wish private cover update/clear | Complete | PRD-WISH-001、Phase 28 | Web/App 可替换或清除心愿封面；PATCH 持续使用私有对象键，不改变关系授权 |
| 30 | Wish record private media | Complete | PRD-WISH-001、Phase 27/28/29 | App/Web 心愿过程记录上传并保存私有对象键，在授权记录读取中签发媒体/缩略图 URL |
| 31 | Private voice messages in partner chat | Complete | PRD-CHAT-001、PRD-MEMORY-001、Phase 27 | Web/App 聊天语音使用私有对象键写入；播放时按当前关系授权刷新短时 URL，兼容旧 URL |
| 32 | Revoke partner chat sockets after unbind | Complete | PRD-CHAT-001、Phase 31 | 解绑提交后关闭既有连接，并在消息/已读事件和心跳周期重新验证当前关系 |
| 33 | Server-backed partner chat history | Complete | PRD-CHAT-001、Phase 32 | 增加当前绑定关系授权的历史分页，并由 Web/App 在连接后读取及按需加载旧消息 |
| 34 | Accurate partner chat delivery states | Complete | PRD-CHAT-001、Phase 33 | 根据对方可用连接与持久化 delivered_at 回报离线/送达状态，并在两端显示状态 |
| 35 | Reject conflicting partner chat idempotency keys | Complete | PRD-CHAT-001、Phase 34 | 同一 clientMessageId 重试保持幂等；复用 ID 发送不同内容时明确拒绝，避免发送端/接收端内容分叉 |
| 36 | Isolate client chat state by relationship | Complete | PRD-CHAT-001、Phase 33/35 | 关系 ID 变化时仅展示对应关系的本地缓存、服务端历史和实时事件，不把旧内存消息带入新会话 |
| 37 | Retry uncertain partner text messages | Complete | PRD-CHAT-001、Phase 35/36 | 发送结果不确定的文字消息可在连接恢复后以同一 clientMessageId 重试；服务端显式拒绝的消息不提供重试 |
| 38 | Clear invalid App auth sessions | Complete | PRD-AUTH-001 | App 收到受保护请求 401 时清除匹配的持久与内存会话；旧 token 的迟到 401 不得清除新会话 |
| 39 | Strengthen couple invite code entropy | Complete | PRD-COUPLE-001 | 新邀请码使用 12 位密码学随机码；旧码继续兼容，新增服务端单元测试 |
| 40 | Acknowledge partner chat delivery | Complete | PRD-CHAT-001、Phase 34 | 协商版 1 客户端经接收端回执后才标记送达；未确认消息可补投，旧客户端兼容 |
| 41 | Retry uncertain uploaded partner audio | Complete | PRD-CHAT-001、Phase 35/37 | 已上传但发送结果不确定的语音可在当前会话内复用原消息 ID 与对象键重试；对象键仅留在内存 |
| 42 | Serialize concurrent couple bindings | Complete | PRD-COUPLE-001、Phase 39 | 邀请码与参与账户在绑定事务中加锁，关系冲突检查使用当前读；真实 MySQL 并发结果仍待集成验证 |
| 43 | Web wish recycle and restore | Complete | PRD-WISH-001、现有回收站 API | Web 可软删除、查看服务端保留截止时间并恢复；本阶段不新增永久删除入口 |
| 44 | Web wish status progression | Complete | PRD-WISH-001 | Web 心愿按 `todo → doing → done` 顺序推进，复用既有 PATCH 契约 |
| 45 | Enforce media upload policy | Complete | PRD-MEMORY-001 | 服务端限制媒体目录、MIME、空文件和上传大小 |
| 46 | Keep Web Today profile failures distinct | Complete | PRD-TODAY-001 | Web 首页区分资料加载/失败与真实未绑定状态 |
| 47 | Enforce exact album media ownership keys | Complete | PRD-MEMORY-001 | 相册/故事上传对象键必须属于当前用户的精确 album 前缀 |
| 48 | Remove hidden Web daily-interaction routes | Complete | PRD-TODAY-001、PRD R1 | 移除未上线状态/一句话假入口 |
| 49 | Make App wish memories failure-safe | Complete | PRD-WISH-001 | App 回忆页只在读取成功后展示空数据或统计 |
| 50 | Make App album story reads failure-safe | Complete | PRD-MEMORY-001 | App 故事列表/详情区分加载失败和成功空数据 |
| 51 | App wish doing-page failure-safe states | Complete | PRD-WISH-001、Phase 49 | App 过程页只在读取成功后呈现心愿、记录及结束/添加操作；失败可重试 |
| 52 | App album photo/video failure-safe states | Complete | PRD-MEMORY-001、Phase 50 | App 照片/视频标签区分加载、失败和成功空数据，并允许重试 |
| 53 | App All Media overview failure-safe states | Complete | PRD-MEMORY-001、Phase 50/52 | “全部”页区分聚合读取失败和成功空数据，并允许重试 |
| 54 | App favorites failure-safe states | Complete | PRD-MEMORY-001、Phase 50 | 收藏故事、照片、视频只在成功读取后显示空状态，失败可重试 |
| 55 | App wish record creation failure-safe states | Complete | PRD-WISH-001、Phase 51 | 创建记录前确认真实心愿已读取成功；失败可重试且不显示假目标 |
| 56 | App wish recycle read failure-safe states | Complete | PRD-WISH-001、Phase 15 | 回收站区分读取失败与成功空状态，失败可重试且旧请求不会覆盖新状态 |
| 57 | App wish-list read failure-safe states | Complete | PRD-WISH-001、Phase 15/56 | 主列表区分加载、失败和分类空状态；失败时隐藏旧卡片并阻止旧选择参与删除 |
| 58 | Verify uploaded media signatures | Complete | PRD-MEMORY-001、Phase 45 | 在对象写入前核对已允许 MIME 与文件头/容器标识，明显不匹配时返回 415 |
| 59 | Unify anniversary reminder plan inputs | Complete | PRD-DAY-001、Phase 20/22 | App/Web 用单选表达服务端的单个提醒天数，并在 Web 编辑时无损保留已有 0–30 天值 |

## 阶段顺序

### Phase 00 — Repository workflow foundation

仅创建和验证本次授权的协作文件。该阶段不修改 `app/`、`web/`、`server/`、依赖、环境配置或
远端 Git 状态。详细计划见 `harness/build/phase-00-repository-workflow-foundation.md`。

### Phase 01 — Repository baseline assessment

作为独立只读评估阶段启动时，对移动端、Web 端、服务端、数据库、媒体与现有验证面进行检查，识别：

- 文档与实现偏差；
- 模块和 API 边界；
- 缺失或脆弱的验证面；
- 安全、隐私、数据迁移和恢复风险；
- 可以独立实施和验证的候选重构阶段。

详细计划见 `harness/build/phase-01-repository-baseline-assessment.md`。该阶段当前仍为 `Not started`，
仅在后续某项工作依赖完整基线盘点时纳入执行，不阻塞当前已获授权的 PRD R1/P0 迭代。

### Phase 02 — Web today real-data baseline

该阶段由用户直接授权启动，可以在尚未执行 Phase 01 时独立完成。它只处理 PRD-TODAY-001 中
Web 首页的模拟业务内容，不实现新的状态、通知或搜索能力。详细计划见
`harness/build/phase-02-web-today-real-data.md`。

### Phase 03 — Web profile editing

该阶段补齐 Web 个人资料编辑。先以独立小提交修复生日无法清空的 API 契约，再以第二个提交替换
占位路由并接入真实 PUT 与 session 刷新。详细计划见
`harness/build/phase-03-web-profile-editing.md`。

### Phase 04 — Hide unfinished Web settings

该阶段落实 PRD 7.4 的诚实入口原则：从 Web 个人中心隐藏通知、恋爱报告和外观入口，并移除对应
占位路由；真实资料编辑和情侣空间保持不变。详细计划见
`harness/build/phase-04-hide-unfinished-web-settings.md`。

### Phase 05 — Hide unfinished mobile settings

该阶段把相同的诚实入口原则应用到移动端：通知偏好尚未持久化，报告和主题也没有业务实现，因此
隐藏三个入口并移除通知设置的本地假保存页。详细计划见
`harness/build/phase-05-hide-unfinished-mobile-settings.md`。

### Phase 06 — Hide fake mobile daily interactions

在 R2 建立真实状态/一句话数据模型之前，该阶段先落实 R1：从移动端首页隐藏两个假交互入口，并
删除硬编码伴侣内容和无条件成功反馈页面。详细计划见
`harness/build/phase-06-hide-fake-mobile-daily-interactions.md`。

### Phase 07 — Mobile today honest states

该阶段补齐移动端首页的真实状态边界：请求期间显示加载，失败时允许重试，未绑定时引导建立关系，
只有服务端确认已绑定后才展示情侣天数、心愿和纪念日。详细计划见
`harness/build/phase-07-mobile-today-honest-states.md`。

### Phase 08 — Web wish description editing

该阶段补齐 Web 心愿详情上明确标记的描述编辑缺口，并扩展 `/wishes/:id` PATCH 契约；状态修改
仍然兼容，描述保存失败时保留输入并显示错误。详细计划见
`harness/build/phase-08-web-wish-description-editing.md`。

### Phase 09 — Mobile wish description editing

该阶段复用 Phase 08 的服务端 PATCH 能力，在移动端详情页提供编辑描述入口和真实保存流程；保存失败
保留草稿，保存成功后回到并刷新详情。详细计划见
`harness/build/phase-09-mobile-wish-description-editing.md`。

### Phase 10 — Mobile wish detail honest states

修复移动端心愿详情在数据加载或读取失败时仍展示写死标题、状态、日期、地点和预算的问题；为加载中和失败状态提供明确反馈与重试。阶段范围仅限移动端心愿详情页，不改变服务端数据、状态流转、其他心愿页面中的交互或历史数据。详细计划见
`harness/build/phase-10-mobile-wish-detail-honest-states.md`。

### Phase 11 — Web wish title editing

在现有描述/状态 PATCH 上增加受范围授权的标题更新，并在 Web 心愿详情展示真实标题及编辑入口。标题去除首尾空白，长度为 1–100；保留描述清空和状态更新兼容。移动端及其他心愿字段不纳入。详细计划见
`harness/build/phase-11-web-wish-title-editing.md`。

### Phase 12 — Mobile wish title editing

在现有移动端描述编辑页补充标题输入，并复用 Phase 11 服务端 PATCH。编辑页分别比较标题和描述，只提交已变化字段，避免保存标题时覆盖另一端刚更新的描述。详细计划见
`harness/build/phase-12-mobile-wish-title-editing.md`。

### Phase 13 — Mobile wish date-only serialization

移动端心愿创建和过程记录创建共用本地日历日期格式化，避免 `Date.toISOString()` 的 UTC 转换让选中的日期提前或延后一天。详细计划见
`harness/build/phase-13-mobile-wish-date-only-serialization.md`。

### Phase 14 — Wish calendar date validation

服务端为心愿目标日和过程记录日增加真实日历日期校验，使无效日期在请求阶段返回可处理的验证错误；同步 OpenAPI 描述。详细计划见
`harness/build/phase-14-wish-calendar-date-validation.md`。

### Phase 15 — Wish deletion lifecycle authorization

复用 Phase 08 已有的写入时关系授权条件，保护心愿软删除、恢复和永久删除，避免预先读取之后关系变化仍可写入。详细计划见
`harness/build/phase-15-wish-deletion-lifecycle-authorization.md`。

### Phase 16 — Wish record creation authorization

心愿过程记录的创建从先查心愿再无条件插入，改为在 INSERT 内查询可写的当前心愿；预检查后关系或心愿状态变化时不创建记录。详细计划见
`harness/build/phase-16-wish-record-creation-authorization.md`。

### Phase 17 — Anniversary calendar date validation

复用心愿日期校验规则，对纪念日创建和全量更新的 `originalDate` 校验真实日历日与数据库日期范围；同步 OpenAPI 字段描述。详细计划见
`harness/build/phase-17-anniversary-calendar-date-validation.md`。

### Phase 18 — Anniversary mutation authorization

纪念日编辑和删除在预读后写入时重新确认目标仍属于同一当前 bound 关系，且用户是关系成员。详细计划见
`harness/build/phase-18-anniversary-mutation-authorization.md`。

### Phase 19 — Anniversary creation authorization

纪念日创建由先查关系后无条件 VALUES 插入，改为从仍为 bound 且用户是成员的关系行 SELECT 插入；零行时返回 409。详细计划见
`harness/build/phase-19-anniversary-creation-authorization.md`。

### Phase 20 — Honest anniversary reminder copy

纪念日两端保留现有提醒天数偏好字段，但明确告知通知尚未上线；移除列表、首页、表单及删除确认中关于已发送提醒的承诺。详细计划见
`harness/build/phase-20-honest-anniversary-reminder-copy.md`。

### Phase 21 — Mobile anniversary list honest states

移动端纪念日列表不再把网络/API 失败渲染为“还没有纪念日”；失败态明确说明读取失败并提供重试。详细计划见
`harness/build/phase-21-mobile-anniversary-list-honest-states.md`。

### Phase 22 — Mobile anniversary editing and deletion

移除移动端纪念日页占位编辑 toast；列表项进入编辑表单，加载真实数据后可保存更新或确认删除，失败时保留草稿并反馈错误。详细计划见
`harness/build/phase-22-mobile-anniversary-editing-and-deletion.md`。

### Phase 23 — Wish target-date editing

在既有真实日历日期校验基础上，扩展受当前心愿关系授权的 PATCH，仅更新用户提交的目标日期；Web 与移动端都可编辑，并保留 `YYYY-MM-DD` 本地日历日语义。此阶段不允许清空目标日期，也不修改地点、预算、封面等其他字段或数据库结构。详细计划见
`harness/build/phase-23-wish-target-date-editing.md`。

### Phase 24 — Wish budget editing

为现有心愿 PATCH 增加可空的非负整数预算更新，并在 Web 与移动端详情编辑；清空表示“未定”。服务端验证与数据库 `INT` 范围对齐，不更新用户未改的其他字段。详细计划见
`harness/build/phase-24-wish-budget-editing.md`。

### Phase 25 — Wish location-name editing

为心愿 PATCH 增加受长度校验的地点名称字段，Web 与移动端均可编辑或清空名称；保持现有经纬度不变，不引入地图/地理编码能力。详细计划见
`harness/build/phase-25-wish-location-name-editing.md`。

### Phase 26 — Album object-key write contract

对齐相册创建接口的 `objectKey` 契约：Web/App 必须先经认证上传获得对象键，再登记为相册媒体或故事媒体；不将本地临时 URI 或公开 URL 当作媒体对象标识。本阶段仅修复写入注册链路，签名读取 URL 接入以及 Wish/Chat 上传消费者另行分阶段处理。详细计划见
`harness/build/phase-26-album-object-key-write-contract.md`。

### Phase 27 — Private album reads with short-lived signed URLs

在既有关系 scope 查询后为 object-key 媒体生成短时签名读取 URL，让 Web 图库和 App 故事列表/详情使用同一受控读取契约；读取响应禁止缓存签名地址，不将本地临时缩略图 URI 回传为可跨设备媒体。保留 legacy URL 兼容，不扩到 Wish/Chat 或对象生命周期。详细计划见
`harness/build/phase-27-private-album-signed-reads.md`。

### Phase 28 — Wish private cover create/read

修复 Web/App 新建心愿封面对不存在 `upload.url` 的依赖：改为上传后提交对象键，在 `wishes` 增加兼容旧数据的 nullable 私有对象键列，并在心愿授权读取后签发 300 秒 URL。旧 `cover` URL 保留读取兼容。本阶段不做封面编辑/清除、Wish 过程记录媒体或 Chat 媒体迁移。详细计划见
`harness/build/phase-28-wish-private-cover-create-read.md`。

### Phase 29 — Wish private cover update/clear

在已有心愿编辑入口增加私有封面替换与清除：替换时先上传后提交当前用户所属对象键，清除时显式提交 null 并同时清空新旧封面列。保留现有关系写入授权，不删除已上传/旧对象。详细计划见
`harness/build/phase-29-wish-cover-edit-clear.md`。

### Phase 30 — Wish record private media

将 Wish 过程记录从失效的上传 `url` 假设迁移到私有对象键：上传后以 key 登记媒体，在已授权 Wish/record scope 内读取时签发短时 URL；视频缩略图也保存对象键。兼容旧 URL 记录和旧客户端写入。本阶段不删除存储对象。详细计划见
`harness/build/phase-30-wish-record-private-media.md`。

### Phase 31 — Private voice messages in partner chat

修复 Web/App 聊天语音仍依赖上传接口不再提供的 `url`：新消息持久化私有对象键，播放时通过要求当前绑定关系成员资格的 REST endpoint 获取 300 秒签名地址；旧 URL 兼容并禁止缓存签名响应。阶段不改变聊天历史同步、WebSocket 重连/去重或对象清理。详细计划见
`harness/build/phase-31-chat-private-audio.md`。

### Phase 32 — Revoke partner chat sockets after unbind

解绑事务提交后关闭本进程中该关系的 WebSocket；所有后续消息和已读事件重新验证当前 bound 关系，心跳为其他进程中的连接提供兜底；Web/App 收到关系撤销关闭码后停止自动重连。保留历史聊天数据，不引入分布式基础设施。详细计划见
`harness/build/phase-32-chat-unbind-socket-revocation.md`。

### Phase 33 — Server-backed partner chat history

为当前绑定关系成员提供按关系 ID 和消息 ID 游标分页的持久化聊天历史；两端 WebSocket ready 后载入最新页，可按需加载更早消息，并与本地缓存及实时消息按服务端消息 ID 合并。解绑或关系切换后旧关系历史不能经新请求读取。详细计划见
`harness/build/phase-33-chat-server-history.md`。

### Phase 34 — Accurate partner chat delivery states

仅在消息已交给当前关系下开放的接收方 WebSocket 时标记送达；没有可用连接时回报 `partner_offline`，离线重放也只确认实际提交到开放 socket 的消息；两端展示已送达状态。`sent` 表示服务端交给开放连接，不代表客户端界面已渲染；`read` 仍由已读事件单独确认。详细计划见
`harness/build/phase-34-chat-delivery-state.md`。

### Phase 35 — Reject conflicting partner chat idempotency keys

保留现有 `(sender_id, client_message_id)` 唯一约束；同 ID、同内容的重试返回原消息，若同 ID 被用于不同文本/语音内容或另一关系，则返回明确冲突，不向接收方广播旧内容。详细计划见
`harness/build/phase-35-chat-idempotency-conflict.md`。

### Phase 36 — Isolate client chat state by relationship

把关系 ID 作为每条客户端消息的会话归属；加载新的 relationship 时，只合并该关系的缓存和实时消息，保留但不删除旧关系本地副本。详细计划见
`harness/build/phase-36-chat-relationship-isolation.md`。

### Phase 37 — Retry uncertain partner text messages

为发送状态不确定的失败文字消息提供显式重试，复用原文字和 `clientMessageId`，并仅在当前关系及 WebSocket ready 时开放操作；服务端明确拒绝（含幂等冲突）不重试。语音失败重试需要保留/重新上传私有对象键，另行处理。详细计划见
`harness/build/phase-37-chat-text-retry.md`。

### Phase 38 — Clear invalid App auth sessions

对所有统一的 App 鉴权 API 请求，在收到 401 时清理仍与失败 token 匹配的本地会话，并通知 AuthProvider 清除内存认证态；采用串行化存储修改保护并发登录，403、网络错误与服务端错误不触发退出。详细计划见
`harness/build/phase-38-app-auth-invalidation.md`。

### Phase 39 — Strengthen couple invite code entropy

新生成的邀请码改为从当前用户友好字符表中选取 12 位，并使用 Node.js 密码学随机整数；现有 6–12 位
邀请码校验和 30 分钟有效期不变，旧的 6 位待绑定码继续兼容。新增无数据库依赖的服务端测试，验证
字符长度、字符集与每位随机选择的上界。详细计划见
`harness/build/phase-39-couple-invite-entropy.md`。

### Phase 40 — Acknowledge partner chat delivery

修正 Phase 34 中“服务端 WebSocket 接受写入即代表已送达”的语义。Web/App 接收到关系内的消息后
发送单条送达确认；服务端仅在确认通过当前接收者、关系成员和绑定状态校验后写入 `delivered_at`，
确认前的消息在重连时仍可补投。以增量 nullable 时间戳区分“等待确认”和“未连接/离线”，不更改
已读语义、解绑策略或跨实例推送架构。详细计划见
`harness/build/phase-40-chat-delivery-ack.md`。

### Phase 41 — Retry uncertain uploaded partner audio

为 Web/App 中“对象已上传、WebSocket 发送结果不确定”的语音消息增加显式重试。重试复用原
`clientMessageId`、对象键和时长，由现有服务端幂等校验防止重复记录。对象键仅在运行时内存保留，
不写入浏览器缓存或 AsyncStorage；上传本身失败仍要求用户重新录制/发送。详细计划见
`harness/build/phase-41-chat-audio-retry.md`。

### Phase 42 — Serialize concurrent couple bindings

针对 PRD-COUPLE-001 中“同时进入冲突关系”的 P0 边界，为邀请码读取加事务行锁，并对邀请双方的
用户行按 ID 升序串行加锁后再检查当前绑定状态、创建关系与消费邀请码；条件消费使用数据库当前时间，
等待期间过期则回滚整个事务。仅调整现有 MySQL 事务，
不新增表/列、不改变解绑后历史处置或邀请过期策略；无 MySQL 集成环境时只记录可运行单元测试和
静态 SQL/锁顺序审查，不宣称并发实测完成。详细计划见
`harness/build/phase-42-couple-binding-concurrency.md`。

### Phase 43 — Web wish recycle and restore

补齐 Web 心愿从详情移入回收站、打开回收站查看服务端删除/清理时间并恢复的可观察闭环，复用现有
`/wishes`、`/wishes/recycle`、`/wishes/:id/restore` 契约并保持情侣授权不变。暂不暴露 Web 永久删除：
当前服务端永久删除只删除心愿主记录，过程记录和媒体对象的共同处置策略尚不明确。详细计划见
`harness/build/phase-43-web-wish-recycle-restore.md`。

### Phase 44 — Web wish status progression

补齐 Web 对服务端既有 `todo`、`doing`、`done` 三态的用户操作：待办心愿可开始计划，进行中心愿可
确认完成，已完成心愿不再展示重复的完成操作。复用原有关系授权 PATCH，不改状态模型、App 行为或
服务端契约。详细计划见 `harness/build/phase-44-web-wish-status-progression.md`。

### Phase 45 — Enforce media upload policy

补齐 PRD-MEMORY-001 / PRD 安全要求中的服务端上传限制：仅允许 `album` 图片/视频与 `interact` 音频，
按声明 MIME 白名单生成安全对象扩展名，拒绝空文件，并将 100 MiB 超限映射为 413。保留当前客户端
私有对象键契约与大小上限；不新增内容嗅探、大小策略或外部 R2 集成。详细计划见
`harness/build/phase-45-media-upload-policy.md`。

### Phase 46 — Keep Web Today profile failures distinct

修正 Web 首页将账户资料查询失败或仍在加载时当作“未绑定”的呈现。首页只在资料状态为 `ready` 时
判断情侣关系；加载/初始状态明确显示加载中，失败状态提供重试并隐藏未绑定引导及共同生活卡片。
复用现有 `refreshProfile`，不改变认证、API 或绑定流程。详细计划见
`harness/build/phase-46-web-today-profile-failure.md`。

### Phase 47 — Enforce exact album media ownership keys

加固 PRD-MEMORY-001 的对象所有权边界：相册和故事写入只接受当前用户的
`album/<userId>/<object>` 键，不接受仅在别的路径片段出现用户 ID、其他媒体目录、相邻用户 ID
或 `.` / `..` 路径段的对象键。复用并加固现有共享检查，保留情侣关系授权及读取行为不变。详细计划见
`harness/build/phase-47-album-object-key-ownership.md`。

### Phase 48 — Remove hidden Web daily-interaction routes

移除 Web 中已不再上线的 `/status` 与 `/sentence` 占位路由，避免直接访问旧地址后看到带有“完成/留下”
按钮的伪入口；依赖现有应用通配路由回到首页。保留仍服务于其他模块的通用占位组件，不实现 P1 状态/一句话功能。
详细计划见 `harness/build/phase-48-hide-web-daily-interaction-routes.md`。

### Phase 49 — Make App wish memories failure-safe

为 App 心愿回忆页补齐真实加载、失败和重试状态：未成功取得心愿及过程记录前，不展示默认封面、零计数
或“暂无记录”；请求失败时显示明确错误和重试入口。复用现有 `/wishes/:id/records` 读取，不改变媒体、
记录或服务端契约。详细计划见 `harness/build/phase-49-app-wish-memory-states.md`。

### Phase 50 — Make App album story reads failure-safe

为 App 故事列表与详情区分加载、请求失败和成功空数据：失败时展示可重试错误，不再落入“没有故事/没有媒体”
的空状态。复用既有故事查询和收藏 API，不改故事数据、权限或收藏语义。详细计划见
`harness/build/phase-50-app-story-read-states.md`。

### Phase 51 — Make App wish doing page failure-safe

为 App 进行中心愿过程页补齐加载、失败、重试和成功状态。只有成功读取心愿与过程记录后才显示真实内容、
“暂无记录”空状态以及结束/添加记录操作；失败不再落入硬编码标题与空记录假象。复用现有记录查询和心愿更新
API，不改变心愿状态、记录或媒体契约。详细计划见
`harness/build/phase-51-app-wish-doing-states.md`。

### Phase 52 — Make App album photo/video tabs failure-safe

为 App 相册照片和视频标签补齐加载、失败与成功状态。请求失败时显示可重试错误，只有成功读取后才能展示
“还没有照片/视频”。复用既有相册媒体查询，保留上传成功后的刷新、媒体分组及查看器行为；“全部”与“收藏”
读取视图留作独立阶段。详细计划见 `harness/build/phase-52-app-album-media-tabs-states.md`。

### Phase 53 — Make App All Media overview failure-safe

为 App 相册“全部”页的心愿、媒体和故事并行读取补齐加载、失败、重试及成功状态。三项请求全部成功前不渲染
空相册视图；任一失败时显示统一错误与重试。复用现有 GET API、关系授权和内容布局，不更改单项视图或媒体行为。
详细计划见 `harness/build/phase-53-app-all-media-overview-states.md`。

### Phase 54 — Make App Favorites grids failure-safe

为 App 收藏故事、照片和视频三个条件挂载的列表补齐成功空数据与失败状态区分。加载失败时显示可重试错误；只有
对应收藏 GET 成功且过滤结果为空时才展示原空状态文案。保留现有收藏 API、分类、导航和媒体查看行为，并在子标签
卸载或重试后忽略旧请求。详细计划见 `harness/build/phase-54-app-favorites-states.md`。

### Phase 55 — Make App wish record creation failure-safe

为 App 新增心愿过程记录页面补齐目标心愿加载、失败和重试状态。目标心愿确认成功前不展示可编辑记录表单、
默认心愿卡片或保存操作；复用现有 `getWishById` 与记录草稿行为，不改变创建 API、媒体上传或服务端授权。
详细计划见 `harness/build/phase-55-app-wish-record-create-states.md`。

### Phase 56 — Make App wish recycle reads failure-safe

为 App 心愿回收站补齐加载、失败/重试和成功状态，避免读取失败后把初始空列表误报为回收站为空。
保留现有删除、恢复、永久删除 API 与确认行为；详细范围和验收见
`harness/build/phase-56-app-wish-recycle-read-states.md`。

### Phase 57 — Make App wish-list reads failure-safe

为 App 主心愿列表补齐加载、失败/重试和分类空状态，失败时不保留仍可选择/删除的旧卡片。
现有批量删除 API、确认和导航语义不变；详细范围和验收见
`harness/build/phase-57-app-wish-list-read-states.md`。

### Phase 58 — Verify uploaded media signatures

扩展 Phase 45 的服务端上传策略，在写入对象存储之前拒绝与声明 MIME 明显不匹配或缺少有效头部的文件；
不变更格式白名单和大小限制，并记录通用媒体容器尚未进行完整解码/轨道校验。详细范围见
`harness/build/phase-58-media-upload-signature-checks.md`。

### Phase 59 — Unify anniversary reminder plan inputs

服务端纪念日只保存单个 `reminderDaysBefore` 数值；将 App 与 Web 创建/编辑界面改成互斥单选计划，且 Web 编辑保留服务端现有的任意 0–30 天值。不增加“无计划”语义、不发送通知、不改 API 或日期计算；详细范围见
`harness/build/phase-59-anniversary-reminder-plan-inputs.md`。阶段已完成；实测结果见
`harness/build-log.md`。

## 后续阶段的准入条件

新增实现阶段前必须：

1. 有明确的用户优先级或 `PRD.md` 需求 ID、缺陷或其他需求来源。
2. 说明受影响组件、数据、API 和外部依赖。
3. 定义可观察的验收标准和真实可运行的验证命令。
4. 区分重构、行为变更、依赖变更和运维变更。
5. 对认证、情侣数据、媒体或数据库风险提供额外验证和恢复说明。
6. 用户明确授权该阶段；如果当前有效 Goal 已明确覆盖相应 PRD 需求和结果，则可在该 Goal 范围内
   持续推进，不必为每个小点重复确认。

## 计划变更规则

- 不因发现代码已经存在就把阶段标记为完成。
- 不在早期阶段顺手纳入后续工作。
- 缺少证据或决策时标记为 unresolved，而不是推测。
- 路线图调整要保留原因，并在 build log 中记录实际发生的状态变化。

## 长任务执行模型

对于持续数小时或跨多个会话的工作，每个阶段都按下列顺序推进：

1. **Orientation**：读取仓库规则、目标、计划、阶段文件、build log、相关 context 和实时源码。
2. **Preflight**：确认分支、工作树、现有用户改动、依赖状态、外部系统和可用验证面。
3. **Approval packet**：列出本阶段目标、精确范围、非目标、预计文件、风险、验证命令和停止条件。
4. **Red**：在适用时观察最小、可信的失败信号；不具备测试条件时说明替代基线。
5. **Green**：只做满足已批准行为的最小实现。
6. **Refactor**：在行为与范围不变的情况下改善结构，并重复聚焦验证。
7. **Verify**：运行阶段规定的聚焦检查、更广验证和必要的人工/集成检查。
8. **Review**：按风险检查回归、安全、数据、契约、运行和恢复问题。
9. **Evidence**：把实质性决定写入 phase context，把真实命令和结果写入 build log。
10. **Handoff**：逐项核对验收标准，报告限制并停止；下一阶段需要新的授权。

一个阶段可以跨多个会话，但不得因为会话切换而扩大范围、丢失失败证据或跳过审批边界。

## 当前仓库基线事实

以下事实用于约束计划，但不是产品完成声明：

- 仓库品牌为合拍（InSync），品牌标识以 `brand.json` 为准。
- 仓库包含 `app/`、`web/` 和 `server/` 三个分别管理依赖的运行单元。
- 移动端使用 Expo、React Native 和 Expo Router；Web 端使用 React、Vite 和 React Router；
  服务端使用 Express、MySQL、WebSocket、JWT 和 R2 兼容对象存储。
- 当前源码包含认证、情侣空间、心愿、纪念日、相册/故事、媒体上传和伴侣聊天等领域。
- 根 README 对后端仍存在 scaffold/501 的描述，但实时服务端已挂载多个业务路由；这属于需要在
  Phase 01 核实的文档偏差，不能在 Phase 00 顺手修改。
- 当前三个 package manifest 没有自动化测试脚本。可用的基础验证主要是 lint、TypeScript 检查
  和 build；端到端验证需要环境变量及外部依赖。
- 服务端启动需要 MySQL、JWT 和对象存储配置；这类依赖不能在未确认目标时自动访问。
- 本计划创建时，本地 `main` 比 `origin/main` 领先 5 个提交。本 workflow 分支从本地当前状态
  创建，保留这些提交，不把它们视为本阶段产生的变更。

若这些事实与后续实时仓库冲突，记录偏差并以观察到的仓库状态为准；不要静默重写历史证据。

## 关键决策登记

### D-001 — 分离计划、上下文和证据

- **决定：** `PLANS.md` 只拥有路线图与阶段依赖；阶段文件拥有批准范围与计划验证；phase context
  拥有实质性发现与决策；build log 拥有实际进度与验证证据。
- **原因：** 防止把“准备执行”误记为“已经通过”，也减少跨会话重复探索。
- **影响：** 同一事实不在多个文件中完整复制；其他文件通过路径引用权威来源。
- **复核条件：** 若维护成本明显超过收益，可在复盘中合并低价值文档，但不能混淆计划与证据。

### D-002 — 采用右尺寸的初始路线图

- **决定：** 当前只正式安排 Phase 00 和 Phase 01，不依据源码自行制定完整产品路线图。
- **原因：** 仓库没有经确认的产品优先级；立即建立大量实现阶段会把代理推断冒充用户要求。
- **影响：** Phase 01 只生成有证据的候选阶段，用户选择之后才扩充正式路线图。
- **复核条件：** 用户提供 PRD、缺陷清单、里程碑或明确重构目标时。

### D-003 — 当前任务只建立工程工作流

- **决定：** Phase 00 不修改业务源码、现有 README、依赖、配置、数据库或外部系统。
- **原因：** 用户当前授权是加入协作文件和创建分支，而非修复或重构应用。
- **影响：** 即使发现明显文档偏差，也只记录为后续评估输入。
- **复核条件：** 用户另行批准具体业务或文档变更。

### D-004 — 验证必须以观察结果为准

- **决定：** 只有实际运行的命令和人工检查可以进入 build log 的通过证据。
- **原因：** 计划命令、代码存在和历史描述都不能证明当前工作树可用。
- **影响：** 缺少环境、依赖或凭据时明确标记 `Not run`，并说明影响。
- **复核条件：** 无；这是长期证据原则。

### D-005 — 暂不假设测试框架

- **决定：** 在用户批准前，不为 app、web 或 server 自行选择和安装测试框架。
- **原因：** 三个运行单元技术栈不同，测试投资顺序属于实质性工程决策。
- **影响：** Phase 01 需要评估测试切入点；实现阶段若无法提供自动化 Red 步骤，应明确使用的替代
  复现和验证方法。
- **复核条件：** 用户确认测试策略，或某个缺陷阶段批准新增最小测试基础。

### D-006 — 高风险边界优先于代码整洁

- **决定：** 认证、情侣关系隔离、私有媒体、数据库 schema、WebSocket 身份关联和恢复能力的风险
  高于纯样式或目录整理。
- **原因：** 这些边界直接影响隐私、数据完整性和跨用户访问。
- **影响：** Phase 01 的候选阶段优先级必须先看影响与证据，不能只按“最容易重构”排序。
- **复核条件：** 风险被测试和运行证据充分控制后。

### D-007 — 客户端/服务端契约需要明确所有权

- **决定：** API 变化前必须识别 `server/` 实现、`app/` 调用、`web/` 调用以及
  `web/openapi.json` 之间的真实关系。
- **原因：** 当前存在多个消费者和一个 OpenAPI 文件，但仓库材料尚未证明其权威和生成流程。
- **影响：** 不得只改一个消费者后声称契约完成；未知所有权在 Phase 01 中保持 unresolved。
- **复核条件：** 确立并验证契约生成/同步流程后。

### D-008 — Git 与外部写操作单独授权

- **决定：** 创建本地分支已在 Phase 00 获准；commit、push、PR、部署、数据库/存储写入仍需单独授权。
- **原因：** 这些操作的影响范围和可恢复性不同于本地文件编辑。
- **影响：** 阶段完成不会自动触发 commit 或 push。
- **复核条件：** 用户针对具体操作发出明确请求。

## 全局验收框架

后续每个实现阶段应从下列维度选择适用标准。未适用的维度需说明原因，不能简单删除。

### 行为与范围

- 已批准行为能够通过测试、可重复命令或明确人工步骤观察。
- 明确非目标保持不变，没有混入后续阶段或顺手重构。
- 失败路径与空状态得到处理，不只验证理想路径。

### 代码质量

- 改动遵循邻近 TypeScript 和模块风格。
- 不引入无使用方的抽象、依赖或兼容层。
- 聚焦 lint、类型检查和 build 在适用范围内通过。
- 新增复杂逻辑有回归保护；不能自动化时记录替代证据和剩余风险。

### 客户端/服务端契约

- 请求路径、方法、载荷、响应、错误码和认证要求在相关消费者之间一致。
- 对兼容性破坏有迁移或版本策略。
- OpenAPI 或类型生成物的更新符合已确认的权威流程。

### 安全与隐私

- 未认证、错误用户、非情侣成员和资源不存在等路径有明确行为。
- 服务端强制执行授权，不能只依赖客户端状态。
- 日志、错误和文档不泄露凭据、令牌、签名地址或用户内容。
- 上传和媒体读取维持类型、大小、所有权和访问时效边界。

### 数据与恢复

- schema 变化说明现有数据兼容性、锁定/停机风险和恢复方案。
- 不把“自动创建缺失表或列”当作所有迁移场景都安全的证明。
- 重试、部分失败或并发情况下不会静默产生重复、丢失或跨用户数据。

### 可靠性与运行

- 网络、数据库、对象存储和 WebSocket 不可用时，系统返回可理解的失败状态。
- 长任务、上传或连接中断时的取消、重连或清理行为得到说明。
- 需要监控、日志、备份或人工恢复的事项在交接中可见。

### 证据与交接

- build log 记录实际命令、时间、结果和未运行项。
- context 只保留影响未来工作的实质性决定和未知项。
- review 发现已修复、接受或保留为明确阻塞项。
- 阶段完成报告包含改动、验证、限制、剩余风险和下一项待批准动作。

## Phase 00 详细执行合同

### 目标

建立初始 workflow/harness，并证明只修改了获准的协作文件。

### 工作包

1. **仓库确认**
   - 根据 README 与 `brand.json` 确认“合拍”项目身份。
   - 检查 Git 分支、工作树和本地/远端基线关系。
   - 读取三个 package manifest，提取真实命令与技术栈。
2. **分支隔离**
   - 从本地当前 HEAD 创建包含 `refactor` 的分支。
   - 不重置、不 rebase、不合并、不推送。
3. **长期指令**
   - 创建 `AGENTS.md`，记录仓库结构、边界、命令和交接规则。
4. **目标与计划**
   - 创建 `GOALS.md`、`PLANS.md`，区分已知目标、非目标、未知项和阶段授权。
5. **复用入口**
   - 创建 `PROMPTS.md`，覆盖定向、规划、执行、验证、评审和交接。
6. **阶段与证据**
   - 创建 Phase 00/01 文件、context 规则、build log 和 code-review 目录占位。
7. **自审与验证**
   - 检查重复所有权、路径、状态、敏感信息、改动范围和 diff 格式。

### Phase 00 验收矩阵

| ID | 验收标准 | 验证方法 | 要求证据 |
|---|---|---|---|
| P00-A1 | 分支名称包含 `refactor` | `git branch --show-current` | 精确分支名 |
| P00-A2 | 只新增获准的 workflow/harness 文件 | `git status --short` 与 `git diff --name-status` | 完整变更列表 |
| P00-A3 | 三个运行单元和命令描述准确 | 对照三个 `package.json` | 自审结果与已知限制 |
| P00-A4 | 计划、context、日志职责不冲突 | 交叉检查四类文件 | 无重复权威来源的结论 |
| P00-A5 | 不包含凭据或环境值 | 针对新增文件做敏感模式检查 | 检查结果与任何误报说明 |
| P00-A6 | Markdown diff 无空白错误 | `git diff --check` | 退出结果 |
| P00-A7 | Phase 01 仍未启动 | 检查 phase、plan、log 状态 | 均为 `Not started`/awaiting approval |
| P00-A8 | 没有 commit、push、部署或外部写入 | 检查本地 Git 与活动记录 | 明确声明未执行 |

### Phase 00 完成条件

只有 P00-A1 至 P00-A8 全部满足，且 build log 追加观察证据后，才能同时把本文件、Phase 00
文件和 phase summary 的状态更新为 `Complete`。任一范围外文件变化都必须先调查；不能为通过验收
而删除或覆盖用户改动。

## Phase 01 详细执行合同

Phase 01 是长任务的发现和决策阶段，不是隐式重构授权。

### 工作流 A — 仓库与运行单元地图

- 记录根脚本如何启动 app、web 与 server。
- 识别每个运行单元的入口、路由、状态管理、数据访问和构建边界。
- 标记共享代码缺失、重复实现和实际耦合，但不立即抽象。
- 对每个结论引用具体路径；避免粘贴大段源码。

### 工作流 B — 文档与实现偏差

- 对照根 README、web README、package scripts、服务端挂载路由和数据库 schema。
- 区分“明显过期”“信息不完整”“需要运行才能确认”。
- 为文档修复提出单独小范围，不与代码重构捆绑。

### 工作流 C — API 与数据契约

- 映射 app/web 的 API 客户端与 server 路由/handler。
- 检查认证头、请求/响应形状、错误处理和命名差异。
- 确认 `web/openapi.json` 与生成脚本的使用方式；无法确认时保持 unresolved。
- 识别能以类型、契约测试或生成流程机械保证的一致性规则。

### 工作流 D — 身份与情侣隔离

- 追踪登录、token 失效、会话恢复和 WebSocket 身份建立路径。
- 检查资源查询是否在服务端关联当前用户/情侣关系。
- 优先记录可能导致跨用户或跨情侣访问的风险。
- 不使用真实用户数据验证。

### 工作流 E — 媒体生命周期

- 映射选择、上传、数据库记录、签名读取、缩略图/预览和删除/清理路径。
- 检查类型、大小、所有权、失败补偿、孤儿对象和过期访问行为。
- 明确哪些结论来自静态代码，哪些需要本地集成环境。

### 工作流 F — 数据库与恢复

- 读取 schema 初始化和补列逻辑，识别锁、幂等、索引、外键与兼容风险。
- 区分开发环境方便性和生产迁移安全性。
- 评估备份、恢复、回滚和失败后重试是否有仓库证据。
- 不连接数据库或执行 schema 写入，除非用户明确批准安全目标。

### 工作流 G — WebSocket 与失败行为

- 检查伴侣聊天连接、认证、重连、断线、消息持久化与确认路径。
- 识别重复消息、丢失消息、越权订阅和部分失败风险。
- 检查客户端在服务不可用时是否呈现真实状态。

### 工作流 H — 质量与验证能力

- 实际运行获准且环境允许的 app/server/web lint、类型检查和 build。
- 记录没有自动化测试脚本这一事实以及最有价值的第一批测试边界。
- 不仅按测试数量排序；优先考虑高风险且可稳定复现的行为。
- 评估 CI、格式化和生成物检查是否存在，不假设缺失功能已经由外部系统承担。

### Phase 01 交付物

- 仓库和运行单元地图。
- 文档偏差列表。
- 按影响与证据排序的风险清单。
- 验证命令的真实结果和未运行原因。
- 已知未知项与需要用户决定的问题。
- 候选阶段列表：每项包含目标、范围、非目标、依赖、风险、验收标准和建议优先级。
- 如获批准，`harness/context/phase-01-repository-baseline-assessment-context.md` 与 build log 更新。

### Phase 01 验收矩阵

| ID | 验收标准 | 可接受证据 | 不可接受替代 |
|---|---|---|---|
| P01-A1 | 三个运行单元和根脚本均被覆盖 | 路径与入口映射 | 仅根据 README 概述 |
| P01-A2 | 文档偏差具体且可定位 | 文档行/章节与实现路径 | “文档可能过期”的笼统结论 |
| P01-A3 | 高风险边界均被评估 | auth/couple/media/db/ws 的路径和结论 | 只做代码风格审查 |
| P01-A4 | 验证状态真实 | 实际命令、结果、未运行原因 | 根据 package script 推定通过 |
| P01-A5 | 候选阶段可独立执行 | 每项有范围、依赖、验收和停止条件 | 一个覆盖全仓库的大重构 |
| P01-A6 | 推断与事实分开 | 明确标注 observed/inferred/unresolved | 把猜测写成确定要求 |
| P01-A7 | 无业务或外部写入 | 干净的范围核对 | 未记录的自动修复或数据库访问 |
| P01-A8 | 用户能够做优先级选择 | 简明比较、价值、风险、成本 | 自动进入最高优先级阶段 |

### Phase 01 阻塞和停止条件

遇到以下情况时停止相应工作流并报告，而不是绕过：

- 需要读取密钥、生产数据或真实用户内容才能继续。
- 必须连接会写入的数据库、对象存储或第三方系统。
- 现有用户改动与拟检查/写入文件冲突，且无法安全区分。
- 仓库状态与计划基线显著冲突，需要用户决定以哪个版本为准。
- 候选改动会改变产品行为，但缺少产品要求或验收标准。
- 验证需要新增依赖、测试框架或基础设施。

## 候选后续工作流（尚未批准）

下列条目只是 Phase 01 可能评估的分类，不是正式阶段，也不授权创建文件或实现：

| 候选方向 | 触发条件 | 可能价值 | 必须先回答的问题 |
|---|---|---|---|
| 测试基础与 CI | 确认高风险逻辑缺少可重复验证 | 降低回归、为重构提供 Red/Green 信号 | 优先 server、web 还是 app；采用何种框架与运行环境 |
| API 契约统一 | 发现 app/web/server 形状或错误语义漂移 | 降低多客户端集成错误 | OpenAPI 是否权威；是否允许生成客户端 |
| 认证与情侣隔离加固 | 存在未覆盖的授权路径或会话边界 | 降低隐私和越权风险 | 目标访问矩阵与兼容行为是什么 |
| 媒体生命周期加固 | 存在孤儿对象、签名访问或失败补偿风险 | 提高隐私、成本和可靠性 | 删除、过期、重试与清理政策是什么 |
| 数据库迁移机制 | 自动 schema 演进不足以支持高风险变更 | 提高可恢复性和发布信心 | 部署拓扑、停机容忍、备份/恢复要求是什么 |
| WebSocket 可靠性 | 发现重连、去重、持久化或授权缺口 | 提高聊天一致性 | 消息投递保证与离线行为是什么 |
| 文档与开发体验 | 文档偏差阻碍可靠启动/验证 | 缩短环境搭建和交接时间 | 哪些平台和本地依赖需要成为正式支持目标 |

只有用户选择某一方向并确认目标后，才把它转换为编号阶段。

## 后续阶段优先级模型

Phase 01 提出候选阶段时，使用以下维度而不是主观偏好：

| 维度 | 高优先级信号 |
|---|---|
| 用户影响 | 阻断核心流程、导致数据丢失或明显错误 |
| 安全与隐私 | 可越权、泄露私有媒体/会话、跨情侣访问 |
| 数据风险 | 破坏现有行、不可恢复、重复或丢失记录 |
| 发生概率 | 已复现、已有代码证据、频繁路径 |
| 验证缺口 | 无法稳定判断正确性，且改动频繁 |
| 依赖解锁 | 能让多个后续阶段更小、更安全 |
| 实施成本 | 可以独立交付、回滚和验证 |

建议优先级使用：

- **P0：** 当前存在不安全或实质错误的行为，需要先阻止影响扩大。
- **P1：** 高影响、重复失败、审批或证据缺口。
- **P2：** 明显提升可靠性、效率或可维护性。
- **P3：** 可选整理和体验改善。

优先级不等于授权；即使是 P0，也要说明安全的处理范围和必要批准。

## 阶段文件创建标准

新增 `harness/build/<phase>.md` 时至少包括：

- 状态、来源、目标、范围与非目标；
- 依赖、预计文件和需要用户决定的问题；
- 审批 gate；
- Red、Green、Refactor、Verify 计划；
- 聚焦和更广验证命令；
- 安全、隐私、可靠性、可观察性与恢复考虑；
- 可逐项判断的验收标准；
- 完成前必须记录的证据；
- 交接与停止条件。

阶段规模应满足：一次评审能够理解，一组聚焦检查能够验证，失败时能够独立回退。若无法满足，
继续拆分而不是依靠更长提示词掩盖范围过大。

## 证据等级

在计划、评审和交接中明确使用以下证据等级：

- **Observed：** 当前工作树中实际读取、运行或复现的结果。
- **Reported：** 用户、历史日志或文档描述，但本阶段未重新观察。
- **Inferred：** 由代码关系推断，尚未运行验证。
- **Planned：** 未来准备执行的步骤，不是当前证据。
- **Unavailable：** 因环境、权限或外部依赖不能获得，并说明影响。

验收要求如果依赖 Observed 证据，就不能用 Reported、Inferred 或 Planned 替代。

## 计划维护与复盘

每个阶段完成后检查：

1. 原计划是否准确预测了受影响范围和验证面。
2. 哪些实质性决定应留在项目 context，哪些可成为长期 `AGENTS.md` 规则。
3. 是否出现重复发现、代理漂移、越权、误导性完成声明或未运行验证。
4. 哪些可机械检查的问题值得加入脚本或测试。
5. 是否需要收紧现有流程，而不是创建更多文档或新的 Skill。

只有反复出现、跨阶段可复用且边界清晰的流程，才考虑沉淀为 Skill。一次性问题留在项目文件中。
复盘建议不会自动修改计划、Skill、代码或远端状态；每类变更仍需分别批准。
