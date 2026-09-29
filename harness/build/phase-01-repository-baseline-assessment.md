# Phase 01 — Repository baseline assessment

## Status

`Not started`

## Source inputs

- `AGENTS.md`、`GOALS.md`、`PLANS.md`、`PROMPTS.md`。
- `harness/build-log.md` 和 Phase 00 的证据。
- 实时 `app/`、`web/`、`server/`、根目录脚本与配置。
- 用户在启动该阶段时提供的优先级或关注点。

## Objective

通过只读检查建立合拍仓库的可信工程基线，识别文档偏差、架构边界、验证缺口以及值得优先处理
的重构风险，并把候选实现工作拆成可以独立批准的后续阶段。

## In scope

- 盘点三个运行单元、共享契约、开发脚本和外部依赖。
- 对比根 README、package scripts 和实际路由/模块，记录明显偏差。
- 评估认证、情侣数据隔离、媒体访问、数据库 schema 演进和 WebSocket 边界。
- 记录现有 lint/build 能力与自动化测试缺口。
- 根据证据提出小而可验证的候选重构阶段，包括范围、风险和验收方式。
- 如用户明确批准文档写入，创建本阶段 context 并更新 plan/build log。

## Explicit non-goals

- 不修改业务代码、测试、依赖、配置、schema 或 API。
- 不运行会写数据库、对象存储、真机或外部系统的操作。
- 不把候选重构建议视为已批准路线图。
- 不提交、不推送、不部署。

## Dependencies and prerequisites

- Phase 00 已完成。
- 用户明确批准启动本阶段。
- 对需要环境变量或外部服务的检查，先确认允许的目标和访问范围。

## Expected affected files

默认是只读阶段。只有在用户同时批准文档写入时，才可修改：

- `harness/context/phase-01-repository-baseline-assessment-context.md`
- `harness/build-log.md`
- `PLANS.md` 或新的 `harness/build/<phase>.md`（每个路径需先单独列出并确认）

## Decisions requiring human input

- 产品和重构工作的优先级。
- 是否建立测试框架，以及先覆盖 server、web 还是 app。
- API 契约和 OpenAPI 生成物的权威来源。
- 可使用的本地数据库、对象存储、模拟环境和测试数据。

## Approval gate

Phase 01 当前未获启动授权。开始前必须向用户确认；建议中产生的任何实现阶段也必须分别批准。

## Red, green, refactor, verification plan

- **Red:** 不适用；本阶段不实现代码。记录缺失检查，而不是制造失败。
- **Green:** 形成引用具体文件和命令的现状报告及候选阶段。
- **Refactor:** 合并重复发现，按风险和依赖整理阶段边界。
- **Verify:** 复核每项结论的来源，区分事实、推断、未知项和未运行验证。

## Focused verification

```bash
git status --short --branch
pnpm --dir app lint
pnpm --dir app exec tsc --noEmit
pnpm --dir server lint
pnpm --dir server build
pnpm --dir web lint
pnpm --dir web build
```

具体命令在启动阶段时根据依赖是否已安装和用户授权重新确认。命令未运行时必须记录为未验证。

## Broader verification

只有用户提供或批准安全的本地依赖后，才考虑启动服务或人工验证。不得访问生产数据或真实用户
资源。

## Security, privacy, reliability and recovery

- 不读取 `.env` 值；只检查代码中声明的变量名称和失败行为。
- 不输出令牌、签名 URL、用户内容或连接字符串。
- 对 schema 与存储只做静态检查，不执行写操作。
- 高风险发现优先于代码整洁建议。

## Acceptance criteria

- 报告覆盖仓库结构、运行单元、契约、数据和验证面。
- 所有重要结论都能追溯到文件、命令或明确的未验证状态。
- README 或其他文档偏差被具体指出。
- 候选阶段足够小、依赖明确，并包含可观察验收标准。
- 没有业务文件、外部系统或远端 Git 状态发生改变。

## Evidence required before completion

- 检查的文件和命令清单。
- 实际执行的 lint/build 结果和未执行原因。
- 风险、限制和未知项。
- 用户对后续阶段优先级的决定。

## Handoff and stop condition

提交基线报告和候选阶段后停止，等待用户选择。不要自动创建所有阶段文件或开始重构。
