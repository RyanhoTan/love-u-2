# Build log

本文件是已观察到的实施进度和验证证据的权威来源。计划中的命令或预期行为不能作为通过证据。

## Phase summary

| Phase | Status | Branch | Started | Completed | Evidence | Blockers |
|---|---|---|---|---|---|---|
| 00 — Repository workflow foundation | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方开始与完成记录 | None |
| 01 — Repository baseline assessment | Not started | — | — | — | — | Not required for active PRD R1/P0 iteration; may be started if a later change depends on a full baseline |
| 02 — Web today real-data baseline | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录 | None |
| 03 — Web profile editing | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录 | None |
| 04 — Hide unfinished Web settings | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录 | None |
| 05 — Hide unfinished mobile settings | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录 | None |
| 06 — Hide fake mobile daily interactions | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录 | None |
| 07 — Mobile today honest states | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录 | None |
| 08 — Web wish description editing | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录 | None |
| 09 — Mobile wish description editing | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录 | None |
| 10 — Mobile wish detail honest states | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录 | None |
| 11 — Web wish title editing | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录 | None |
| 12 — Mobile wish title editing | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录 | None |
| 13 — Mobile wish date-only serialization | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录 | None |
| 14 — Wish calendar date validation | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录 | None |
| 15 — Wish deletion lifecycle authorization | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录；无真实 MySQL 集成 | None |
| 16 — Wish record creation authorization | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录；无真实 MySQL 集成 | None |
| 17 — Anniversary calendar date validation | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录；无真实 MySQL 集成 | None |
| 18 — Anniversary mutation authorization | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录；无真实 MySQL 集成 | None |
| 19 — Anniversary creation authorization | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录；无真实 MySQL 集成 | None |
| 20 — Honest anniversary reminder copy | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录；无真机/浏览器检查 | None |
| 21 — Mobile anniversary list honest states | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录；无真机/后端联调 | None |
| 22 — Mobile anniversary editing and deletion | Complete | `refactor/codex-workflow-harness` | 2026-09-29 | 2026-09-29 | 下方阶段记录；无真机/后端联调 | None |

## Activity

## 2026-09-29T11:05:15+08:00 — Phase 00: authorized and started

- **Status:** `Not started` → `In progress`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** 创建名称包含 `refactor` 的分支，并建立本阶段文件中列出的 workflow/harness 文件。
- **Changes:** 从本地 `main` 当前 HEAD 创建新分支；开始创建仓库协作文件。
- **Red:** Not applicable；这是文档和工作流初始化，仓库没有文档测试器。
- **Green:** Pending。
- **Refactor:** Pending。
- **Verification:** 开始前观察到工作树干净；本地 `main` 比 `origin/main` 领先 5 个提交。
- **Review:** Pending self-review。
- **Operational evidence:** 未访问环境变量、数据库、对象存储或远端写操作。
- **Limitations:** 尚未建立自动化文档验证；未运行应用 lint/build，因为业务代码不在阶段范围内。
- **Blockers:** None。
- **Next action:** 完成批准文件并运行文档范围验证；不授权 Phase 01。
- **Evidence references:** `harness/build/phase-00-repository-workflow-foundation.md`

后续活动记录只追加。若先前证据有误，追加更正说明，不静默改写历史。

## 2026-09-29T11:10:23+08:00 — Phase 00: workflow foundation completed

- **Status:** `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** `harness/build/phase-00-repository-workflow-foundation.md` 中列出的 9 个 workflow/harness 文件。
- **Changes:** 创建长期仓库指南、目标、417 行长任务计划、复用提示、两个阶段文件、build log、context 规则和 code-review 目录占位。
- **Red:** Not applicable；本阶段没有业务行为或已配置的文档测试器。
- **Green:** 9 个预期文件均存在；分支名称包含 `refactor`；业务目录没有修改。
- **Refactor:** 明确信息所有权；将后续重构方向保留为未批准候选项，避免把建议写成路线图授权。
- **Verification:** `git branch --show-current` 返回 `refactor/codex-workflow-harness`；`git status --short --branch` 只显示批准的根文档与 `harness/` 为未跟踪；逐文件 `git diff --no-index --check` 没有空白错误；敏感模式扫描没有匹配；阶段状态一致性检查确认 Phase 01 仍为 `Not started`。
- **Review:** 完成自审；文件内容与根、app、server、web package scripts 以及观察到的仓库结构一致。
- **Operational evidence:** 未读取 `.env` 值，未连接数据库或对象存储，未运行部署、commit、push 或远端写操作。
- **Limitations:** 应用 lint/build 未运行，因为本阶段没有业务代码改动；仓库仍没有自动化测试脚本；未验证外部服务集成。
- **Blockers:** None。
- **Next action:** 等待用户决定是否启动 Phase 01 或提交/推送当前分支；本记录不授权这些操作。
- **Evidence references:** `PLANS.md`、`harness/build/phase-00-repository-workflow-foundation.md`、当前 Git 状态。

## 2026-09-29T11:20:31+08:00 — Product planning: PRD baseline added

- **Status:** Planning artifact update; Phase 00 remains `Complete` and Phase 01 remains `Not started`。
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** 用户明确要求新增 PRD，并要求包含后续功能新增、修改和去除方向。
- **Changes:** 新增 `PRD.md`；更新 `AGENTS.md`、`GOALS.md`、`PLANS.md` 和 `PROMPTS.md`，将 PRD 接入信息所有权与工作入口。
- **Red:** Not applicable；这是产品规划文档更新，不实现业务行为。
- **Green:** Pending final document/path/sensitive-information validation。
- **Refactor:** 将产品方向归 `PRD.md` 持有，避免与稳定项目目标和工程阶段计划混淆。
- **Verification:** Pending。
- **Review:** PRD 基线来自当前 app/web 路由、server 路由和 schema 的只读检查；候选业务方向均标记为未授权实现。
- **Operational evidence:** 未修改业务代码，未访问环境变量、数据库、对象存储或远端状态。
- **Limitations:** 当前功能状态来自静态代码，不代表端到端通过；产品决策人和 10 项关键业务决策仍待确认。
- **Blockers:** None for document creation。
- **Next action:** 验证文档后等待用户确认 PRD 决策；不自动启动 Phase 01 或实现版本路线图。
- **Evidence references:** `PRD.md`、app/web 路由、server router 与 `server/src/db/schema.ts`。

## 2026-09-29T11:23:08+08:00 — Product planning: PRD validation completed

- **Status:** Product planning update complete; numbered phase statuses unchanged。
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** 验证新 PRD 及其在现有 workflow 文件中的引用。
- **Changes:** 无额外业务改动；确认 `PRD.md` 为 390 行 Draft v0.1，并由其他协作文件引用。
- **Red:** Not applicable。
- **Green:** PRD 存在，包含 10 个唯一需求 ID、业务方向、版本路线、验收、指标、发布准入和待确认决策。
- **Refactor:** 产品要求、稳定项目目标与工程执行计划的所有权已分离。
- **Verification:** 全部 10 个新增 workflow 文件逐文件空白检查通过；PRD 引用检查通过；10 个需求 ID 均唯一；过期规划措辞和敏感模式扫描无匹配；Phase 00 仍为 `Complete`，Phase 01 仍为 `Not started`。
- **Review:** 自审完成；现状表明确区分已实现、部分实现和占位，候选功能明确不构成实现授权。
- **Operational evidence:** 未执行应用、数据库、对象存储、commit、push 或部署操作。
- **Limitations:** PRD 状态是 Draft；功能现状来自静态代码检查，10 项产品决策仍需用户确认。
- **Blockers:** None。
- **Next action:** 由用户审阅业务取舍，或另行批准将某个 PRD 需求转换为实施阶段。
- **Evidence references:** `PRD.md`、`AGENTS.md`、`GOALS.md`、`PLANS.md`、`PROMPTS.md`。

## 2026-09-29T13:25:17+08:00 — Phase 02: authorized and started

- **Status:** `Not started` → `In progress`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** 按 PRD 开始小步实现；本阶段选择 PRD-TODAY-001 的 Web mock 清理。
- **Changes:** 开始移除首页模拟状态、模拟一句话、stock hero 和无行为搜索/通知入口；改用真实情侣 session 或诚实空状态。
- **Red:** `rg 'TODAY|@/mocks' web/src/pages web/src/mocks` 修改前命中首页、登录页和 mock 模块。
- **Green:** Pending。
- **Refactor:** Pending。
- **Verification:** 修改前 `pnpm --dir web lint` 和 `pnpm --dir web build` 均通过；build 有既有的 bundle size 警告。
- **Review:** Pending self-review。
- **Operational evidence:** 未访问数据库、对象存储、凭据或远端写操作。
- **Limitations:** 本阶段不实现真实状态、一句话、搜索或通知。
- **Blockers:** None。
- **Next action:** 完成代码、运行 Web 验证、更新证据并提交独立 commit。
- **Evidence references:** `PRD.md` PRD-TODAY-001、`harness/build/phase-02-web-today-real-data.md`。

## 2026-09-29T13:26:51+08:00 — Phase 02: Web today real-data baseline completed

- **Status:** `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-TODAY-001 的 Web mock 清理与真实/空状态基线。
- **Changes:** 首页使用真实用户和伴侣资料展示情侣卡片；仅为已绑定用户加载真实纪念日与相册；移除模拟状态、模拟一句话、stock hero、无行为搜索/通知图标和 `web/src/mocks/index.ts`；登录页改用本地 CSS 装饰背景；同步 PRD 基线。
- **Red:** 修改前静态检查命中 `TODAY` 与 `@/mocks` 的生产页面引用。
- **Green:** `web/src` 中不再存在 `TODAY` 或 `@/mocks` 引用，mock 目录无文件。
- **Refactor:** 删除无使用方的 `WISHES` mock；未实现的状态、句子、搜索和通知没有被伪装为可用功能。
- **Verification:** `pnpm --dir web lint` 通过；`pnpm --dir web build` 通过；`git diff --check` 通过。Vite 仍报告既有的 bundle 大于 500 kB 警告。
- **Review:** 自审确认未修改 API、服务端、数据库或移动端；未绑定状态不再渲染情侣专属查询组件。
- **Operational evidence:** 未访问数据库、对象存储或凭据，未推送或部署。
- **Limitations:** 尚未进行带真实后端会话的浏览器端到端验证；状态、一句话、搜索和通知仍需独立阶段。
- **Blockers:** None。
- **Next action:** 提交本阶段改动，然后选择下一个小型 PRD 需求。
- **Evidence references:** `PRD.md` PRD-TODAY-001、`web/src/pages/today-page/index.tsx`、`web/src/pages/login-page/index.tsx`、Web lint/build 输出。

## 2026-09-29T13:28:57+08:00 — Phase 03: authorized and started

- **Status:** `Not started` → `In progress`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-AUTH-001 的 Web 个人资料编辑，拆成 nullable birthday 契约与表单两个小提交。
- **Changes:** 开始修复 `/userinfo` 更新契约中数据库可空、返回可空但请求强制生日的问题。
- **Red:** Zod schema 对 `{ nickname, avatar: null, signature, birthday: null }` 返回 `Invalid input: expected string, received null`。
- **Green:** Pending。
- **Refactor:** Pending。
- **Verification:** 修改前 server lint/build 通过；Web lint/build 已在上一阶段通过。
- **Review:** 观察到服务端不支持更新 gender；本阶段不伪造该字段，也不扩展范围。
- **Operational evidence:** 未读取环境变量或连接数据库。
- **Limitations:** 头像上传、性别、密码和账号生命周期不在本阶段。
- **Blockers:** None。
- **Next action:** 完成 nullable birthday 契约、验证并独立提交。
- **Evidence references:** `server/src/schema/user.ts`、`server/src/router_handler/userinfo.ts`、`web/openapi.json`、`harness/build/phase-03-web-profile-editing.md`。

## 2026-09-29T13:29:57+08:00 — Phase 03: nullable birthday contract completed

- **Status:** `In progress` → `In progress`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** Phase 03 Small point A。
- **Changes:** `/userinfo` 更新 schema 接受 `birthday: null`；OpenAPI 与生成 Web 类型同步为 `DateOnly | null`。
- **Red:** 修改前 null 被 Zod 拒绝。
- **Green:** 修改后 null 通过，`2026/09/29` 等错误格式仍被拒绝。
- **Refactor:** 保持字段必传以维持完整 PUT 语义，只扩展值域支持明确清空。
- **Verification:** schema 解析检查通过；server lint/build 通过；Web lint/build 通过；生成类型检查和 `git diff --check` 通过。Vite 保留既有 bundle size 警告。
- **Review:** 变更向后兼容，现有字符串生日请求行为不变；handler 已将 null 作为 SQL 参数写入。
- **Operational evidence:** 未连接数据库，未访问凭据或外部系统。
- **Limitations:** 尚未运行真实 MySQL 集成；Web 表单仍待 Small point B。
- **Blockers:** None。
- **Next action:** 提交 Small point A，然后实现 Web 表单。
- **Evidence references:** `server/src/schema/user.ts`、`web/openapi.json`、`web/src/api/schemas.d.ts`。

## 2026-09-29T13:33:40+08:00 — Phase 03: Web profile editing completed

- **Status:** `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** Phase 03 Small point B。
- **Changes:** 新增 Web 个人资料表单和 `/userinfo` PUT client；用户可编辑昵称、签名和可选生日，保存成功后刷新 auth session 并返回“我的”；头像和用户名明确只读；服务端补充真实日历日期和未来日期验证；同步 PRD 基线。
- **Red:** `/me/profile` 修改前由 `PlaceholderPage` 提供，Web API client 没有资料更新调用。
- **Green:** 路由现在渲染 `ProfilePage`，表单调用 `updateUserInfo`，支持清空生日并覆盖加载、字段错误、提交中和请求失败状态。
- **Refactor:** 复用现有 `useAuth`、`Input`、`Button`、`PageBody` 与 `QueryError`；没有新增依赖或复制会话状态管理。
- **Verification:** OpenAPI 类型重新生成；schema 检查得到 `{"nullOk":true,"validOk":true,"invalidRejected":true,"futureRejected":true}`；server lint/build、Web lint/build、静态路由/调用检查和 `git diff --check` 均通过。Vite 仍报告既有的 bundle 大于 500 kB 警告。
- **Review:** 保存请求保留现有头像；昵称与签名在客户端和服务端均有限长；失败时保留输入且不跳转；未把头像上传、性别、密码或账号删除扩入本阶段。
- **Operational evidence:** 未连接真实数据库，未读取凭据，未推送或部署。
- **Limitations:** 未使用真实账号执行浏览器端到端保存；头像仍需移动端更新；真实 MySQL 写入和多时区边界未集成验证。
- **Blockers:** None。
- **Next action:** 提交 Small point B，然后从 PRD 选择下一个独立、可验证的小点。
- **Evidence references:** `web/src/pages/profile-page/index.tsx`、`web/src/api/user.ts`、`web/src/routes/me.tsx`、`server/src/schema/user.ts`、`PRD.md`、server/Web lint/build 输出。

## 2026-09-29T13:35:44+08:00 — Phase 04: unfinished Web settings hidden

- **Status:** `Not started` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD 7.4 和 R1 中“未上线功能不伪装可用”的 Web 个人中心小点。
- **Changes:** 从 Web “我的”移除通知、恋爱报告和外观入口，同时移除三个仅渲染通用占位页的路由；同步产品基线。
- **Red:** 修改前静态检查命中三个菜单链接和三个 `PlaceholderPage` 路由，通知路由甚至展示了没有保存行为的“保存”按钮。
- **Green:** Web 个人中心只保留已有真实实现的情侣空间和个人资料；三个未完成功能不再有 Web 入口或专用占位路由，直接旧地址由全局回退返回首页。
- **Refactor:** 清理不再使用的图标和 `page` helper import，没有删除可复用的通用占位组件或影响其他模块。
- **Verification:** Web lint/build、目标路径静态检查和 `git diff --check` 通过；Vite 保留既有的 Zod 注释解析与 bundle size 警告。
- **Review:** 范围仅限 Web；移动端假成功/占位入口保留给后续独立小点；资料与情侣空间路由未改变。
- **Operational evidence:** 未访问数据库、凭据或外部系统，未推送或部署。
- **Limitations:** 旧收藏地址没有专门的“功能尚未上线”页面，而是使用现有全局首页回退。
- **Blockers:** None。
- **Next action:** 提交本小点，再选择下一项 R1 假成功或契约一致性问题。
- **Evidence references:** `web/src/pages/me-page/index.tsx`、`web/src/routes/me.tsx`、`PRD.md`、Web lint/build 输出。

## 2026-09-29T13:36:19+08:00 — Phase 05: unfinished mobile settings hidden

- **Status:** `Not started` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD 7.4、R1 通知假成功清理和 Phase 04 的移动端对应小点。
- **Changes:** 从移动端“我的”隐藏通知设置、主题换肤和恋爱报告；删除只维护组件内状态、点击即显示保存成功的通知设置页；同步产品基线。
- **Red:** 修改前静态检查命中三个菜单入口，通知页没有 API 或持久化却执行 `toast.success("通知设置已保存")`。
- **Green:** 三个入口和通知假保存页面均从移动端生产路由中移除，真实资料与情侣空间入口不变。
- **Refactor:** 清理对应未使用图标 import，不改动通知依赖或未来真实通知实现空间。
- **Verification:** app lint、目标字符串静态检查和 `git diff --check` 通过。
- **Review:** 隐私与安全、关于我们当前仍为信息提示入口，未纳入本阶段；未来通知偏好应由账户级 API、持久化和实际发送链路共同驱动。
- **Operational evidence:** 未请求系统通知权限，未访问后端、数据库、凭据或外部服务，未推送或部署。
- **Limitations:** 未运行 Android/iOS 模拟器；删除页可从 Git 历史恢复，待真实通知闭环设计完成后应以新实现重新引入。
- **Blockers:** None。
- **Next action:** 提交本小点，再选择一个能够独立验证的 R1 核心一致性问题。
- **Evidence references:** `app/app/home/(tabs)/mine.tsx`、删除的 `app/app/home/(mine)/notification-settings/index.tsx`、`PRD.md`、app lint 输出。

## 2026-09-29T13:37:47+08:00 — Phase 06: fake mobile daily interactions hidden

- **Status:** `Not started` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-STATUS-001 与 R1 中状态/一句话硬编码和假成功清理。
- **Changes:** 从移动端首页移除“今日状态”和“一句话”入口；删除硬编码对方状态/句子、只维护本地输入并无条件提示发送或保存成功的页面；保留真实心愿入口；同步产品基线。
- **Red:** 修改前静态检查命中 `/home/status`、`/home/asentence`、硬编码“想你”和固定句子，以及没有 API 调用的成功 toast。
- **Green:** 移动端生产路由和首页不再暴露两个未闭环功能，相关硬编码页面已移除。
- **Refactor:** 清理不再使用的首页图标 import，不删除仍被真实心愿记录使用的状态素材。
- **Verification:** app lint、目标路由/文案静态检查和 `git diff --check` 通过。
- **Review:** 该阶段没有把本地状态伪装成持久化；真实状态/一句话需要 R2 的数据模型、授权 API 和跨账号验收后再引入。
- **Operational evidence:** 未访问后端、数据库、凭据或外部服务，未推送或部署。
- **Limitations:** 未运行 Android/iOS 模拟器；首页仍有未绑定和请求失败时展示“0 天”的独立 R1 问题，将在下一小点处理。
- **Blockers:** None。
- **Next action:** 提交本小点，然后修正移动端首页绑定、加载和错误状态。
- **Evidence references:** `app/app/home/(tabs)/index.tsx`、删除的状态/一句话页面、`PRD.md`、app lint 输出。

## 2026-09-29T13:41:06+08:00 — Phase 07: mobile today honest states completed

- **Status:** `Not started` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-TODAY-001 的移动端加载、失败、未绑定与已绑定状态。
- **Changes:** 首页增加显式加载状态、失败重试和未绑定引导；先读取情侣关系，只为已绑定用户加载纪念日；只有真实已绑定关系展示双方头像、天数、心愿和纪念日；缺少关系日期时用破折号而非伪造 0 天。
- **Red:** 修改前任何请求失败都会清空数据并继续渲染默认伴侣头像、“我们在一起 0 天”和情侣专属入口；未绑定用户也得到相同假展示。
- **Green:** 四种顶层状态由 `homeStatus` 和 `coupleSpace.isBound` 明确分支，错误页可重试，未绑定页进入真实绑定流程。
- **Refactor:** 将情侣关系设为首页主查询，避免未绑定用户发起无意义的纪念日请求；复用现有 API 和布局组件，没有新增依赖。
- **Verification:** app lint、TypeScript `--noEmit`、静态状态分支检查和 `git diff --check` 通过。
- **Review:** 失败不再伪装空数据；未绑定用户不再看到情侣专属入口；已绑定但未设置关系日期时不虚构天数。
- **Operational evidence:** 未连接真实后端或数据库，未读取凭据，未推送或部署。
- **Limitations:** 未用 Android/iOS 模拟器或真实账号执行端到端；目前聚焦时会显示全屏加载而不是保留旧数据后台刷新。
- **Blockers:** None。
- **Next action:** 提交本小点，再基于 PRD 选择下一个核心路径一致性问题。
- **Evidence references:** `app/app/home/(tabs)/index.tsx`、`PRD.md`、app lint 输出。

## 2026-09-29T13:48:08+08:00 — Roadmap reconciled for active PRD iteration

- **Status:** Planning record corrected; Phase 01 remains `Not started`; Phases 02–07 remain `Complete`.
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** 用户授权按 PRD 持续实现 R1/P0 功能、每个小点独立提交；当前活动 Goal 明确承载该授权和完成条件。
- **Changes:** 修正 `PLANS.md` 中“仅安排 Phase 00/01、后续实现均未授权”的过期说明；明确 Phase 01 不是活动 P0 迭代的先决条件；同步 Phase 01 的 build-log blocker 描述。
- **Verification:** 当前分支为 `refactor/codex-workflow-harness`，本次修改前工作树干净；Phase summary 与已完成阶段列表一致；`git diff --check` 通过。
- **Review:** Phase 01 的只读评估仍未实施，不把它误标成完成；待确认的业务决策仍需在具体功能遇到时停止并请求用户输入。
- **Operational evidence:** 未改业务代码，未连接外部服务或读取凭据，未推送或部署。
- **Next action:** 提交此路线图修正，然后继续检查当前 PRD P0 未完成项。

## 2026-09-29T13:50:00+08:00 — Phase 08: Web wish description editing authorized and started

- **Status:** `Not started` → `In progress`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** 活动 PRD R1/P0 Goal 下的 PRD-WISH-001 小点：Web 心愿描述编辑。
- **Changes:** 开始扩展受范围授权的 PATCH 请求以支持更新描述，并在 Web 心愿详情提供编辑与保存交互。
- **Red:** `WishDetailInfo` 含“心愿描述改为可编辑”的 TODO；`updateWishSchema` 只接受 status；详情页没有编辑入口。
- **Green:** Pending。
- **Refactor:** Pending。
- **Verification:** 修改前工作树干净；当前实现证据来自 `web/src/pages/wishes-page/detail-info.tsx`、`server/src/schema/wish.ts`、`server/src/router_handler/wish.ts` 与现有 generated API contract。
- **Review:** `findWishById` 会按当前关系或个人范围校验目标心愿；本阶段还会让 UPDATE 语句再次约束当前授权范围，以覆盖校验与写入之间关系变化的窗口。
- **Operational evidence:** 未读取环境变量、连接数据库或访问外部系统。
- **Limitations:** 暂不支持移动端编辑，也不修改心愿标题、地点、日期、预算、封面或状态流转以外的字段。
- **Next action:** 完成 Web 描述编辑、契约生成与 server/Web lint/build 后独立提交。
- **Evidence references:** `PRD.md` PRD-WISH-001、`web/src/pages/wishes-page/detail-info.tsx`、server wish schema/handler。

## 2026-09-29T13:56:56+08:00 — Phase 08: Web wish description editing completed

- **Status:** `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-WISH-001 的 Web 描述编辑小点；支持 status-only PATCH 的兼容性。
- **Changes:** `/wishes/:id` PATCH 支持 `description`；详情页可编辑、清空并保存描述；请求成功后 TanStack Query 刷新；同步 OpenAPI、生成 Web 类型和 PRD 基线。
- **Red:** 修改前 schema 只接受必填 `status`，详情信息组件存在编辑 TODO，用户没有可编辑描述的入口。
- **Green:** Web modal 发送 `{ description }`，显示提交中与错误状态；失败保留草稿，可取消或重试；空字符串清空描述；原状态流转仍走同一 PATCH。
- **Refactor:** PATCH 查询只拼接代码中列出的可更新列，值全部使用 SQL 参数；UPDATE 同时检查心愿 id、未删除状态、原关系仍绑定且当前用户属于该关系，或个人心愿仍是未绑定状态与创建者范围。
- **Verification:** OpenAPI 类型重新生成；schema 解析验证 `statusOk/descriptionOk/clearDescriptionOk` 为 true，`emptyRejected/overlongRejected/invalidStatusRejected` 为 true；server lint/build、Web lint/build 和 `git diff --check` 通过。Vite 保留已有 Zod 注释解析和大于 500 kB bundle 警告。
- **Review:** 没有新增数据库字段；服务端仍是最终权限边界；没有连接 MySQL 或执行真实情侣账号编辑。
- **Operational evidence:** 未读取凭据，未访问数据库/对象存储，未推送或部署。
- **Limitations:** 本阶段仅 Web 编辑描述，不含移动端和标题/封面/日期/地点/预算编辑；尚未进行浏览器后端联调。
- **Blockers:** None。
- **Next action:** 提交 Web 描述编辑小点，然后继续 PRD-WISH-001 的下一个独立缺口。
- **Evidence references:** `server/src/schema/wish.ts`、`server/src/router_handler/wish.ts`、`web/openapi.json`、`web/src/api/schemas.d.ts`、Web 心愿详情组件、server/Web 命令输出。

## 2026-09-29T13:58:21+08:00 — Phase 09: mobile wish description editing authorized and started

- **Status:** `Not started` → `In progress`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** 活动 PRD R1/P0 Goal 下的 PRD-WISH-001 小点：移动端心愿描述编辑。
- **Changes:** 开始扩展移动端 `/wishes/:id` client payload 类型，并在详情页接入独立描述编辑页。
- **Red:** 修改前移动端详情页“更多”只显示 toast，description 无编辑入口；API payload 类型只允许 `status`。
- **Green:** Pending。
- **Refactor:** Pending。
- **Verification:** Phase 08 已验证并提交服务端 description PATCH 契约；修改前工作树干净。
- **Review:** 复用服务端现有关系授权和 schema；不引入新数据表或只写本地状态的反馈。
- **Operational evidence:** 未连接后端或数据库，未读取凭据。
- **Limitations:** 本阶段只编辑描述，不编辑标题、封面、日期、地点或预算。
- **Next action:** 完成移动端加载、编辑、保存成功/失败体验并运行 app lint/typecheck 后独立提交。
- **Evidence references:** `app/app/home/wish-list/[id]/index.tsx`、`app/app/features/wish-list/api.ts`、Phase 08 completion evidence。

## 2026-09-29T14:01:01+08:00 — Phase 09: mobile wish description editing completed

- **Status:** `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-WISH-001 移动端心愿描述编辑小点。
- **Changes:** 移动端 PATCH payload 类型增加 description-only 更新并保留 status-only 更新；心愿详情铅笔入口打开独立编辑页；编辑页读取现有描述、限制 1000 字符、支持清空、显示加载/错误/保存状态；成功后返回详情并在重新聚焦时刷新；空描述改为诚实空状态；同步 PRD 基线。
- **Red:** 修改前“更多”按钮只显示 toast，描述不可编辑；清空描述后详情页会显示硬编码 `description`。
- **Green:** 编辑页发送真实 PATCH，只在请求成功后提示保存并返回；失败时保留输入，读取失败可重试。
- **Refactor:** 详情数据加载改用 `useFocusEffect` 并在失焦时忽略迟到响应；不新增缓存或本地伪持久化。
- **Verification:** `pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit` 和 `git diff --check` 通过。
- **Review:** 服务端最终校验描述长度和当前关系权限；已有 `status` 更新调用仍通过 TypeScript 检查并保持相同请求格式。
- **Operational evidence:** 未连接后端、数据库或对象存储，未读取凭据，未推送或部署。
- **Limitations:** 未运行 Android/iOS 模拟器或真实账号联调；目前只编辑描述，其他字段编辑仍待后续小点。
- **Blockers:** None。
- **Next action:** 提交移动端描述编辑，再继续 PRD-WISH-001 其余 P0 缺口。
- **Evidence references:** `app/app/features/wish-list/api.ts`、`app/app/home/wish-list/[id]/index.tsx`、`app/app/home/wish-list/[id]/edit.tsx`、app lint/TypeScript 输出。

## 2026-09-29T14:06:25+08:00 — Phase 10: mobile wish detail honest states authorized and started

- **Status:** `Not started` → `In progress`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** 活动 PRD R1/P0 Goal 中 PRD-WISH-001 的移动端心愿详情真实状态小点。
- **Changes:** 开始替换详情页在 GET 未完成或失败时仍显示的硬编码心愿字段与状态；新增明确加载、可重试失败状态，并移除没有服务端来源的参与人/创建者演示头像。
- **Red:** 修改前 `wish` 为 null 时页面展示标题 `title`、状态 `planning`、`targetDate`、`locationName`、`budgetAmount` 和固定 2/2 参与人；读取失败仅 toast 后仍保留这些假数据。
- **Green:** Pending。
- **Refactor:** Pending。
- **Verification:** 修改前工作树干净；静态证据来自 `app/app/home/wish-list/[id]/index.tsx` 和 `app/app/features/wish-list/api.ts`。
- **Review:** 使用 API 返回的 `todo/doing/done` 状态；不引入服务端/API/数据库变更，不改变成功加载后的状态流转和编辑描述流程。
- **Operational evidence:** 未连接后端、数据库、对象存储或读取凭据。
- **Limitations:** 本阶段不补齐参与人/头像的真实关系资料、不更改详情页其他无行为操作、不解决其他状态页的 mock。
- **Blockers:** None。
- **Next action:** 实现加载/失败/重试 UI，验证 app lint 与 TypeScript，再提交该小点。
- **Evidence references:** `PRD.md` PRD-WISH-001、Phase 10 阶段文件、移动端心愿详情源码。

## 2026-09-29T14:11:00+08:00 — Phase 10: mobile wish detail honest states completed

- **Status:** `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-WISH-001 的移动端详情加载、失败、重试和移除硬编码演示数据。
- **Changes:** 心愿详情在加载期间显示加载态；读取失败或 ID 无效时显示错误与重新加载，不展示详情操作；成功后只使用服务端返回的 title/status/description/date/location/budget；缺失可选日期、地点和预算使用破折号；移除固定创建人/参与人头像与 2/2 文案。
- **Red:** 修改前静态源码显示 `wish === null` 时以 `title`、`planning`、`targetDate`、`locationName`、`budgetAmount` 和 2/2 参与人作为演示数据；失败只 toast 并继续显示演示内容。
- **Green:** `rg` 检查不再命中上述字段占位值、静态状态或演示头像；错误分支有可触发的重新加载按钮，详情和状态操作只在成功数据分支渲染。
- **Refactor:** 使用请求序号忽略页面失焦或被更新请求覆盖的迟到结果；不新增 API、依赖或本地伪持久化。
- **Verification:** `pnpm --dir app lint` 通过；`pnpm --dir app exec tsc --noEmit` 通过；静态占位值检查通过；`git diff --check` 通过。
- **Review:** Tag 使用 API `WishStatus`（`todo`/`doing`/`done`）；空预算 `0` 正确显示为 `¥0`；成功读取后描述编辑与“开始计划”仍使用原真实 API。
- **Operational evidence:** 未连接后端、数据库、对象存储或读取凭据，未推送或部署。
- **Limitations:** 未运行 Android/iOS 模拟器、真实账号联调或数据库集成；不处理其他心愿状态页和无行为按钮。
- **Blockers:** None。
- **Next action:** 独立提交此修复，再继续 PRD R1/P0 中不依赖未决业务规则的缺口。
- **Evidence references:** `app/app/home/wish-list/[id]/index.tsx`、`PRD.md` PRD-WISH-001、Phase 10 lint/typecheck/static check 输出。

## 2026-09-29T14:14:00+08:00 — Phase 11: Web wish title editing authorized and started

- **Status:** `Not started` → `In progress`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** 活动 PRD R1/P0 Goal 中 PRD-WISH-001 的 Web 心愿标题编辑小点。
- **Changes:** 开始将 title 加入现有 `/wishes/:id` PATCH schema/handler/OpenAPI，并在 Web 详情提供真实标题编辑对话框。
- **Red:** 修改前 server `updateWishSchema` 仅接受 `status` 与 `description`；Web 详情不显示心愿标题，也没有标题编辑入口；PATCH OpenAPI 说明仅可修改 status（与已实现 description 不一致）。
- **Green:** Pending。
- **Refactor:** Pending。
- **Verification:** 修改前分支为 `refactor/codex-workflow-harness`，工作树干净；服务端 UPDATE 已有关系授权条件和参数化字段列表，计划复用。
- **Review:** 标题 trim 后必须为 1–100 字符；SQL 列名固定在 handler 内，用户值只作为参数；保留 description/status 已有请求形式。
- **Operational evidence:** 未读取凭据、连接 MySQL 或访问远端。
- **Limitations:** 本阶段只覆盖 server 契约和 Web UI，不覆盖移动端标题编辑、心愿其他字段或真实 MySQL 多账号联调。
- **Blockers:** None。
- **Next action:** 扩展 schema/handler/OpenAPI，完成 Web dialog，运行 server/Web lint/build 与 schema parse 后单独提交。
- **Evidence references:** `server/src/schema/wish.ts`、`server/src/router_handler/wish.ts`、`web/openapi.json`、Web 心愿详情组件。

## 2026-09-29T14:19:00+08:00 — Phase 11: Web wish title editing completed

- **Status:** `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-WISH-001 中仅 Web 的心愿标题编辑；PATCH 继续支持 status 与 description。
- **Changes:** Server PATCH 接受 trim 后 1–100 字符标题，并以固定列名、参数化值和原关系授权 SQL 写入；同步 OpenAPI 和生成的 Web 类型；详情显示真实标题，dialog 提交期间防重复、失败保留草稿、成功后关闭并刷新查询。
- **Red:** 初始 schema parse 发现未知字段未被拒绝，而 OpenAPI 已声明 `additionalProperties: false`；现有 Zod 对象默认会剥除未知字段。
- **Green:** `.strict()` 使服务端行为与 OpenAPI 一致。最终 schema parse 矩阵 `validAndTrimmed/emptyRejected/overlongRejected/unknownRejected/emptyPatchRejected/statusOk/descriptionOk` 全部为 true。
- **Refactor:** PATCH summary/description 从“仅更新状态”修正为反映 title/status/description；未改变既有关系/个人心愿 UPDATE 授权谓词。
- **Verification:** `pnpm --dir web api` 生成类型通过；`pnpm --dir server lint`、`pnpm --dir server build`、`pnpm --dir web lint`、`pnpm --dir web build`、`git diff --check` 通过。Vite 仍报告 Zod 注释位置和 JS chunk >500 kB 警告。
- **Review:** Web 和 app 已知请求只发送允许的 status/description 字段；新增 title 按 SQL 参数传值；数据库关系授权条件和软删除条件原样保留。
- **Operational evidence:** 未连接 MySQL、未读取凭据、未访问外部服务，未推送或部署。
- **Limitations:** 未做数据库跨情侣授权集成、真实浏览器后端联调；本阶段故意未提供移动端标题编辑，其他字段仍未完成。
- **Blockers:** None。
- **Next action:** 独立提交本阶段，然后继续 PRD R1/P0 余项。
- **Evidence references:** `server/src/schema/wish.ts`、`server/src/router_handler/wish.ts`、`web/openapi.json`、`web/src/api/schemas.d.ts`、Web 心愿详情 UI、server/Web 验证输出。

## 2026-09-29T14:22:00+08:00 — Phase 12: mobile wish title editing authorized and started

- **Status:** `Not started` → `In progress`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** 活动 PRD R1/P0 Goal 中 PRD-WISH-001 的移动端心愿标题编辑。
- **Changes:** 开始在现有移动端心愿编辑页添加标题字段，并扩展 app API payload 类型使用 Phase 11 已有的服务端 PATCH。
- **Red:** 修改前移动端编辑页只能加载/更新描述；app `UpdateWishPayload` 仅允许 status 或 description。
- **Green:** Pending。
- **Refactor:** Pending。
- **Verification:** 修改前分支为 `refactor/codex-workflow-harness`，工作树干净；Phase 11 的服务端 title PATCH/OpenAPI 已验证并提交。
- **Review:** 编辑页比较加载时的 title/description，只发送实际改变字段，避免标题编辑覆盖并发更新的描述；空标题在客户端阻止并由服务端再次校验。
- **Operational evidence:** 不改服务端、数据库、OpenAPI 或 Web；未连接后端、未读取凭据。
- **Limitations:** 本阶段不编辑目标日期、地点、预算、封面，不做真机或真实账号后端联调。
- **Blockers:** None。
- **Next action:** 完成表单/API 类型，运行 app lint 与 TypeScript 后单独提交。
- **Evidence references:** `app/app/features/wish-list/api.ts`、`app/app/home/wish-list/[id]/edit.tsx`、Phase 11 server PATCH。

## 2026-09-29T14:26:00+08:00 — Phase 12: mobile wish title editing completed

- **Status:** `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-WISH-001 移动端心愿标题编辑；保留已有描述与状态请求。
- **Changes:** 移动端编辑页读取标题和描述真实初值；title 支持 trim 后非空、最多 100 字符，description 最多 1000 字符且可清空；更新 payload 支持 title-only、description-only 和两字段一起更新；详情编辑入口及编辑页标题同步更新。
- **Red:** 修改前编辑页只有描述输入，API payload 类型仅有 status/description，无法发送 title。
- **Green:** 保存时比较初始值，只把改变字段放入 PATCH；标题不变时编辑描述不会附带 title，描述不变时编辑标题不会附带旧 description；无改动不发送空 PATCH。
- **Refactor:** 更新通用提示为“编辑心愿/心愿保存成功”；输入变化后清除旧错误；服务端 title 校验与原描述/状态边界不变。
- **Verification:** `pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、payload 静态 review 和 `git diff --check` 通过。
- **Review:** app 中状态更新调用仍通过 TypeScript 检查；API 失败时保持两个字段草稿，成功 toast 仅在服务端 PATCH 成功后显示并返回详情。
- **Operational evidence:** 未连接后端、数据库或对象存储，未读取凭据，未推送或部署。
- **Limitations:** 未用 Android/iOS 模拟器、真实账号或数据库执行端到端验证；其他心愿元数据字段仍不能编辑。
- **Blockers:** None。
- **Next action:** 独立提交本小点，再继续 PRD R1/P0 剩余内容。
- **Evidence references:** `app/app/features/wish-list/api.ts`、`app/app/home/wish-list/[id]/index.tsx`、`app/app/home/wish-list/[id]/edit.tsx`、app lint/typecheck 输出。

## 2026-09-29T14:24:00+08:00 — Phase 13: mobile wish date-only serialization started

- **Status:** `Not started` → `In progress`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-WISH-001、跨端日期一致性下的移动端心愿与过程记录提交日期。
- **Red:** 源码中的两处 `date.toISOString().slice(0, 10)` 将选择器显示的本地日期转换为 UTC。用 `TZ=Asia/Shanghai` 构造 2026-09-29 00:30，旧表达式输出 `2026-09-28`；用 `TZ=America/Los_Angeles` 构造同日 23:30，输出 `2026-09-30`。
- **Changes:** 开始添加共用本地日期格式化并替换两处提交表达式。
- **Verification:** 开始前工作树干净；后续运行两时区聚焦检查、app lint/typecheck 和 diff 检查。
- **Review:** `DatePickerModal` 以 `mode="date"` 显示本地日历日；应读取 `Date` 的本地年、月、日，生成 API `YYYY-MM-DD`。
- **Operational evidence:** 未访问数据库、凭据或外部服务。
- **Limitations:** 本阶段不改后端日期列、纪念日行为或目标日可空策略；原生日期选择器需后续真机验证。
- **Blockers:** None。
- **Evidence references:** `app/app/home/wish-list/create.tsx`、`app/app/home/wish-list/[id]/records/create.tsx`、`app/components/wish-list/date-picker-modal.tsx`、聚焦 Node 输出。

## 2026-09-29T14:26:18+08:00 — Phase 13: mobile wish date-only serialization completed

- **Status:** `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Changes:** 新增心愿域 `formatLocalDateOnly`，用设备本地 `getFullYear/getMonth/getDate` 输出 `YYYY-MM-DD`；心愿创建和过程记录创建都改为调用它。
- **Red:** 旧 UTC 切片在上海本地 2026-09-29 00:30 得到 `2026-09-28`，在洛杉矶同日 23:30 得到 `2026-09-30`。
- **Green:** 对实际导出的函数分别设置 `TZ=Asia/Shanghai` 和 `TZ=America/Los_Angeles`，两次断言均输出 `2026-09-29`；两处 payload 静态检查只命中新函数，不再命中 UTC 切片。
- **Refactor:** 两条心愿路径共用一个格式化函数；纪念日已有本地日期格式化，语义一致。
- **Verification:** `pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、两时区聚焦断言和 `git diff --check` 均通过。
- **Review:** `DatePickerModal` 仍返回本地日期模式的 `Date`；API 字段名、格式和服务端/数据库未变。没有持久化 schema 变更或历史数据重写。
- **Operational evidence:** 未连接后端、MySQL 或对象存储，未读取凭据，未推送或部署。
- **Limitations:** 未运行 Android/iOS 模拟器及真实后端联调；目标日期可空策略和服务端日历日期校验仍需独立处理。
- **Log chronology:** 前一阶段完成标题的 14:26:00 是先前记录的约略时间，与本阶段开始时间交错；Git 提交顺序和本阶段的实际命令输出作为先后证据。
- **Blockers:** None。
- **Next action:** 单独提交此修复，继续处理 PRD P0 的日期和心愿字段一致性。
- **Evidence references:** `app/app/features/wish-list/date.ts`、两处 create 页面、`harness/context/phase-13-mobile-wish-date-only-serialization-context.md`、聚焦断言与 app 命令输出。

## 2026-09-29T14:28:51+08:00 — Phase 14: wish calendar date validation started

- **Status:** `Not started` → `In progress`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-WISH-001 的心愿目标日期与过程记录日期请求校验，及对应 OpenAPI 描述。
- **Red:** `createWishSchema` 接受 `targetDate: "2026-02-30"`，`createWishRecordSchema` 接受 `recordDate: "2025-02-29"`；格式正则也接受早于当前 DATE 默认下界的 `0999-12-31`。
- **Changes:** 开始添加真实日历日期校验，确保数据库写入之前通过请求校验。
- **Verification:** 开始前工作树干净；旧行为由 `pnpm --dir server exec tsx` 的 Zod `safeParse` 输出确认。
- **Review:** `parseRequestBody` 将 Zod 问题映射为 HTTP 400；创建 handlers 在数据库写入前调用 schema 解析。
- **Operational evidence:** 未连接 MySQL、对象存储或读取凭据。
- **Limitations:** 本阶段不改变日期字段是否必填，不更改已有数据、数据库 schema 或 Web/app 表单。
- **Blockers:** None。
- **Evidence references:** `server/src/schema/wish.ts`、`server/src/validation.ts`、`server/src/db/schema.ts`、`web/openapi.json`。

## 2026-09-29T14:31:18+08:00 — Phase 14: wish calendar date validation completed

- **Status:** `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Changes:** 心愿创建目标日与过程记录日共用四位年份、真实日历日和 1000 年下界校验；请求字段 OpenAPI 描述及 Web 生成类型同步更新。
- **Red:** 修改前 `2026-02-30`、`2025-02-29` 和 `0999-12-31` 都被现有格式正则接受。
- **Green:** 两个 Zod schema 均接受 `2024-02-29`、`2000-02-29`、`1000-01-01`、`9999-12-31`，拒绝 `2025-02-29`、`1900-02-29`、`2026-02-30`、`2026-13-01`、`0999-12-31`、`0000-01-01` 和格式错误日期。对两个无效请求直接调用 `parseRequestBody` 均获得 HTTP 400 状态。
- **Refactor:** 两个字段共用同一日历日期校验函数；仍返回字段名明确的格式或日历日期错误。
- **Verification:** schema 正反矩阵与 400 映射检查通过；`pnpm --dir web api`、server lint/build、Web lint/build、`git diff --check` 均通过。Web build 仍有既有 Zod 注释位置和大于 500 kB bundle 警告。
- **Review:** 两个 handler 在任何 DB 写入前调用 `parseRequestBody`；有效请求形状与原合同一致，未改历史数据或表结构。
- **Operational evidence:** 未连接 MySQL、对象存储或读取凭据，未推送或部署。
- **Limitations:** 未做真实 MySQL、浏览器或移动端集成；目标日期可空仍涉及另一个产品和数据迁移决策。
- **Blockers:** None。
- **Next action:** 独立提交此输入校验后继续其他 PRD P0 缺口。
- **Evidence references:** `server/src/schema/wish.ts`、`server/src/validation.ts`、`web/openapi.json`、`web/src/api/schemas.d.ts`、`harness/context/phase-14-wish-calendar-date-validation-context.md`。
## 2026-09-29T14:36:36+08:00 — Phase 15: wish deletion lifecycle authorization completed

- **Status:** `Not started` → `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-WISH-001 心愿软删除、恢复和永久删除的最终写入授权；不更改解绑历史数据的产品策略。
- **Red:** 三个 handler 原先先用 `findWishById` 校验范围，再以 `id`/删除状态执行写入，SQL 内没有当前关系授权，也不检查写入行数。预查后解绑、关系切换或行状态变化可造成无权写入或假成功。
- **Green:** 提取 Phase 08 已有的情侣/个人心愿写入授权谓词供 PATCH 与三个删除生命周期 handler 复用；三个最终 UPDATE/DELETE 增加同语句授权，并在 `affectedRows === 0` 时返回 404。
- **Verification:** `pnpm --dir server lint`、`pnpm --dir server build`、`git diff --check` 均通过；静态逐条检查三个 SQL 的 id、授权、删除状态条件与零行处理。未配置自动化测试套件。
- **Review:** 未授权或跨关系用户预查返回 404；预查后关系解绑/切换或个人心愿创建者绑定时，最终条件不匹配而返回 404；行删除状态变化同理。成功写入仍使用原有响应和 30 天保留期。
- **Operational evidence:** 未连接 MySQL、未执行真实删除、未读取凭据、未推送或部署。
- **Limitations:** 尚无隔离 MySQL 集成环境，因此没有运行并发时序或真实跨情侣请求验证；PRD 解绑历史数据处置仍待产品决策。
- **Next action:** 本小点独立提交；继续检查过程记录的写入授权边界。
- **Evidence references:** `server/src/router_handler/wish.ts`、`harness/context/phase-15-wish-deletion-lifecycle-authorization-context.md`、server lint/build 输出。
## 2026-09-29T14:38:55+08:00 — Phase 16: wish record creation authorization completed

- **Status:** `Not started` → `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-WISH-001 心愿过程记录的 INSERT 授权；不改变媒体生命周期或解绑后的历史数据策略。
- **Red:** 原先 `findWishById` 预查后直接 `INSERT ... VALUES`，若关系在两步之间解绑/切换或心愿软删除，INSERT 仍无条件创建记录。
- **Green:** 改为 `INSERT ... SELECT FROM wishes`，在同条语句校验心愿 id、Phase 15 写入授权及未删除状态。零行插入返回 404，且在缩略图和媒体处理之前终止。
- **Verification:** `pnpm --dir server lint`、`pnpm --dir server build`、`git diff --check` 均通过；聚焦静态检查确认八个记录值与一个心愿 id 占位符、授权和状态条件及零行保护顺序。第一次聚焦脚本错误地把动态授权参数当成 SQL 文本内固定占位符，修正预期后通过；这不是实现失败。
- **Review:** 未登录由 `getAuthenticatedUserId` 拒绝，非成员/跨关系预查返回 404；预查后的关系或心愿状态变化在 INSERT 条件中再次检查。成功路径字段和响应形状不变。
- **Operational evidence:** 未连接 MySQL、未执行真实写入、未读取凭据、未推送或部署。
- **Limitations:** 尚无隔离 MySQL 集成验证；媒体处理发生在记录插入之后，部分失败及媒体 URL 所有权仍需单独处理。
- **Next action:** 独立提交后继续 PRD R1/P0 的其他缺口。
- **Evidence references:** `server/src/router_handler/wish.ts`、`harness/context/phase-16-wish-record-creation-authorization-context.md`、server lint/build 与聚焦检查输出。
## 2026-09-29T14:42:19+08:00 — Phase 17: anniversary calendar date validation completed

- **Status:** `Not started` → `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-DAY-001 的纪念日创建/全量更新日期校验；不改时区、提醒发送或数据表。
- **Red:** 修改前 `createAnniversarySchema` 与 `updateAnniversarySchema` 都接受 `2026-02-30`。
- **Green:** 从心愿 schema 抽取共用日历日期校验，纪念日 `originalDate` 复用；OpenAPI 请求字段说明及 Web 生成类型同步。两个纪念日 schema 与两个心愿 schema 均接受有效闰日及 1000/9999 边界，拒绝非闰日、不存在的日期、1000 年前及格式错误日期；非法请求映射 400。
- **Verification:** 四个实际导出 schema 的正反矩阵、`parseRequestBody` 的 400 检查、`pnpm --dir web api`、server lint/build、Web lint/build、`git diff --check` 均通过。首次聚焦脚本误用 `status` 而非实际 `statusCode`，修正脚本后通过；这是检查脚本错误。
- **Review:** 两个纪念日 handler 均在 DB 写入前解析请求；有效请求形状、字段必填性及心愿原校验语义不变。Web 构建仍有 Zod 注释位置和 >500 kB chunk 的既有警告。
- **Operational evidence:** 未连接 MySQL、未访问真实设备或浏览器、未读取凭据、未推送或部署。
- **Limitations:** 未验证真实数据库或服务器/设备时区边界；纪念日提醒尚无发送闭环。
- **Next action:** 独立提交；继续 PRD-DAY-001 的服务端关系授权缺口。
- **Evidence references:** `server/src/schema/dateOnly.ts`、`server/src/schema/anniversary.ts`、`server/src/schema/wish.ts`、`web/openapi.json`、聚焦矩阵和构建输出。
## 2026-09-29T14:44:04+08:00 — Phase 18: anniversary mutation authorization completed

- **Status:** `Not started` → `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-DAY-001 编辑与删除纪念日的最终写入授权；不改变读取、创建、解绑历史数据策略或客户端。
- **Red:** 两个 handler 原先预读时核对当前 bound 关系，但最终 UPDATE 只按 id/active 写入；预读后解绑或更换关系仍可修改原纪念日。
- **Green:** 共用参数化的最终 SQL 谓词，固定原 relationship id，并要求关系仍 bound 且用户为成员；原有零行 404 分支保留。
- **Verification:** `pnpm --dir server lint`、`pnpm --dir server build`、`git diff --check` 通过；聚焦静态检查确认两个 UPDATE 引用同一授权条件、参数和零行保护。
- **Review:** 未登录由身份函数拒绝；非成员/跨关系预读 404；预读后解绑、换关系、已删除或状态变化由最终 UPDATE 零行 404 处理。成功响应及字段不变。
- **Operational evidence:** 未连接 MySQL、未运行真实多账号请求、未读取凭据、未推送或部署。
- **Limitations:** 缺隔离 MySQL 集成和并发时序验证；纪念日创建接口仍有预查到 INSERT 的授权间隙，留待独立小点。
- **Next action:** 独立提交；处理纪念日创建的当前关系授权。
- **Evidence references:** `server/src/router_handler/anniversary.ts`、`harness/context/phase-18-anniversary-mutation-authorization-context.md`、server lint/build 和聚焦检查输出。
## 2026-09-29T14:45:24+08:00 — Phase 19: anniversary creation authorization completed

- **Status:** `Not started` → `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-DAY-001 纪念日创建的当前关系授权；不改变解绑历史数据或客户端。
- **Red:** 原 INSERT 仅使用先前查出的 relationship id，无 bound 状态和成员的插入时检查；预查后解绑仍可能写入旧关系。
- **Green:** `INSERT ... SELECT` 从当前仍 bound、用户为任一成员的同一 relationship id 插入；零行返回原有 409，不读取新纪念日或发送 201。
- **Verification:** `pnpm --dir server lint`、`pnpm --dir server build`、`git diff --check` 通过；聚焦静态检查确认 6 个记录值 + 3 个关系/成员参数、bound 谓词及零行分支顺序。
- **Review:** 未登录由身份函数拒绝；预查时无 bound 关系为 409，预查后解绑/换关系由最终 INSERT 零行 409。有效路径字段、状态和响应形状不变。
- **Operational evidence:** 未连接 MySQL、未访问外部系统、未读取凭据、未推送或部署。
- **Limitations:** 尚无真实多账号或 MySQL 竞态集成验证；提醒触发与时区行为仍未闭环。
- **Next action:** 独立提交；继续审查其他 P0 用户可观察缺口。
- **Evidence references:** `server/src/router_handler/anniversary.ts`、`harness/context/phase-19-anniversary-creation-authorization-context.md`、server lint/build 与静态检查输出。
## 2026-09-29T14:49:02+08:00 — Phase 20: honest anniversary reminder copy completed

- **Status:** `Not started` → `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-DAY-001 无通知发送闭环时，两端纪念日页面不作已生效承诺；仅修改文案。
- **Red:** 移动端提醒开关没有未上线提示；Web 首页/空状态/表单/删除确认声称会提前通知双方或取消提醒，但服务端只持久化 `reminder_days_before`，无发送闭环。
- **Green:** 移动/Web 在计划设置旁显示当前不会发送通知；Web 首页、列表、重复选项、预览和删除文案不再将计划视为已投递提醒；删除文案与实际逻辑删除和无恢复入口一致。
- **Verification:** `pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、`pnpm --dir web lint`、`pnpm --dir web build`、目标文案搜索和 `git diff --check` 通过。Web 构建仍有既有 Zod 注释位置与 >500 kB chunk 警告。
- **Review:** 客户端请求和 `reminderDaysBefore` 字段未改变；没有数据库、OpenAPI 或服务端语义变化。多开关映射一个提醒天数字段的 UX 不一致仍待独立处理。
- **Operational evidence:** 未运行真机/浏览器、未访问数据库、未读取凭据、未推送或部署。
- **Limitations:** 文案修复不等于提醒投递上线；没有通知投递、设备授权或提醒触发的集成验证。
- **Next action:** 单独提交；继续补 PRD-DAY-001 的可编辑能力与提醒输入语义。
- **Evidence references:** 两端纪念日页面、PRD-DAY-001、目标文案搜索与 lint/build 输出。
## 2026-09-29T14:51:29+08:00 — Phase 21: mobile anniversary list honest states completed

- **Status:** `Not started` → `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-DAY-001 移动端纪念日列表读取失败反馈与重试；不改创建、编辑、删除、提醒或服务端。
- **Red:** 原实现 catch 后清空数组并只弹 toast，页面按 `anniversaries.length === 0` 长期显示“还没有纪念日”。
- **Green:** 独立 `loadError` 状态将加载、读取失败、成功空数组和成功有数据分开；失败时显示持续错误与重试，重试或成功后清理旧错误。
- **Verification:** `pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、状态分支静态核对和 `git diff --check` 通过。
- **Review:** 错误态优先于数组长度，不再把 API 失败称为空数据；现有创建入口和响应类型不变。未登录 token 分支仍由既有导航/认证边界负责。
- **Operational evidence:** 未使用真机或真实后端，未读取凭据，未推送或部署。
- **Limitations:** 无设备/弱网集成；顶部“编辑”仍为未完成 toast 入口，需独立处理。
- **Next action:** 独立提交；继续移动端纪念日可编辑/删除缺口。
- **Evidence references:** `app/app/home/anniversary/index.tsx`、`harness/context/phase-21-mobile-anniversary-list-honest-states-context.md`、app lint/typecheck 输出。
## 2026-09-29T14:57:37+08:00 — Phase 22: mobile anniversary editing and deletion completed

- **Status:** `Not started` → `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-DAY-001 移动端纪念日更新与删除；服务端、数据库、提醒投递不变。
- **Red:** 移动端顶栏“编辑”仅显示 `toast.info("编辑功能开发中")`，纪念日卡片无法进入可编辑界面；app API 无 PATCH/DELETE 封装。
- **Green:** 列表卡片进入编辑表单；从已授权列表获取真实字段，PATCH 提交完整 payload；删除先 Alert 二次确认，再调用 DELETE；成功提示后返回并由列表焦点加载刷新，失败留在表单显示错误。
- **Verification:** `pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、导航/API/状态分支静态复核、`git diff --check` 通过。
- **Review:** 标题、分类、日期、重复和提醒计划均可编辑；保存 payload 保留未主动改动的既有 reminderDaysBefore；加载失败可重试；非当前情侣范围从列表不可见，写请求仍由服务端 Phase 18 授权。
- **Operational evidence:** 未使用真机或真实后端/数据库，未读取凭据，未推送或部署。
- **Limitations:** 未做多账号授权集成或真机交互验证；日期重复/时区边界与提醒投递继续待验证。
- **Next action:** 独立提交；继续 PRD-DAY-001 时间边界及 app/web 表单语义检查。
- **Evidence references:** `app/app/features/anniversary/api.ts`、`app/app/home/anniversary/index.tsx`、`app/app/home/anniversary/[id]/edit.tsx`、app lint/typecheck 输出。
## 2026-09-29T15:06:44+08:00 — Phase 23: wish target-date editing completed

- **Status:** `Not started` → `In progress` → `Complete`
- **Branch:** `refactor/codex-workflow-harness`
- **Authorized scope:** PRD-WISH-001 心愿目标日期编辑；不扩展地点、预算、封面等字段，不允许清空目标日期。
- **Red:** 目标日期已在两端展示且创建时必填，服务端 PATCH 仅支持标题/描述/状态；没有目标日编辑 UI。
- **Green:** 服务端 PATCH 复用既有真实日期校验并在现有授权 UPDATE 中写 `target_date`；OpenAPI/Web 类型同步；Web 详情新增编辑 dialog；移动端编辑页新增日期选择，只提交实际变化字段。
- **Verification:** `updateWishSchema` 的 13 项日期/兼容矩阵通过；Web API 生成、server lint/build、Web lint/build、app lint/typecheck、`git diff --check` 均通过；静态复核缓存失效与写入授权条件。
- **Review:** 有效闰日和 1000/9999 范围边界接受；非闰日、无效格式、超范围、空日期及空 PATCH 拒绝。App 以 `formatLocalDateOnly` 序列化并避免日期编辑覆盖未更改标题/描述。OpenAPI patch 文档与生成类型一致。
- **Operational evidence:** 未连接 MySQL、真实账号、浏览器或设备；未读取凭据、未推送或部署。
- **Limitations:** 未做真实 DATE 往返或多账号/并发写入验证；原生选择器需真机验证。Web 构建仍报告依赖 Zod 注释位置和 >500 kB chunk 的既有警告。
- **Next action:** 独立提交后继续 PRD-WISH-001 的其他字段编辑和过程记录能力缺口。
- **Evidence references:** `server/src/schema/wish.ts`、`server/src/router_handler/wish.ts`、`web/openapi.json`、两端心愿详情编辑组件、schema 矩阵与各 workspace 检查输出。
