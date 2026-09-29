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
