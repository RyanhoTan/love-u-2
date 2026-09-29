# Phase 00 — Repository workflow foundation

## Status

`Complete`

## Source inputs

- 用户要求依据 OpenAI Cookbook 的迭代开发工作流，为“合拍”项目加入必要文件。
- 当前仓库 `README.md`、`brand.json` 和三个 package manifest。
- 当前分支和工作树状态。
- 官方工作流关于信息所有权、阶段边界、验证证据和人工 gate 的建议。

## Objective

建立一套与合拍当前规模和风险相匹配的仓库协作框架，让后续 Codex 工作能够读取稳定指令、
按阶段控制范围，并把计划、上下文和真实验证证据分开保存。

## In scope

- 创建或更新：
  - `AGENTS.md`
  - `GOALS.md`
  - `PLANS.md`
  - `PROMPTS.md`
  - `harness/build/phase-00-repository-workflow-foundation.md`
  - `harness/build/phase-01-repository-baseline-assessment.md`
  - `harness/build-log.md`
  - `harness/context/README.md`
  - `harness/code_review/.gitkeep`
- 创建名称包含 `refactor` 的本地分支。
- 根据实际 package scripts 记录验证入口和现有测试限制。
- 检查新增文档的一致性和 Git diff 格式。

## Explicit non-goals

- 不修改 `app/`、`web/`、`server/` 或现有 `README.md`。
- 不安装或升级依赖，不新增测试框架。
- 不运行需要环境变量、数据库、对象存储或真机的服务。
- 不制定未经用户确认的产品功能路线图。
- 不提交、不推送、不创建 PR、不部署。

## Dependencies and prerequisites

- 现有 Git 工作树在开始时干净。
- 当前本地 `main` 比 `origin/main` 领先 5 个提交；新分支从当前本地状态创建并保留这些提交。
- 用户已经授权创建分支和上述 workflow/harness 文件。

## Expected affected files

仅限 “In scope” 中列出的文件。业务源代码和配置不应变化。

## Decisions requiring human input

- Phase 01 是否启动。
- 后续产品优先级、重构目标和测试策略。
- 是否提交和推送本分支。

## Approval gate

本阶段已由用户在当前会话中明确授权。任何业务代码、依赖、外部系统或远端 Git 变更均需新的
明确授权。

## Red, green, refactor, verification plan

- **Red:** 不适用。该阶段只创建文档和目录约定，仓库也没有文档测试器；不得伪造失败测试。
- **Green:** 所有批准文件存在，内容与实时仓库结构和包脚本一致。
- **Refactor:** 删除重复信息，确保每类信息只有一个权威所有者。
- **Verify:** 检查精确改动列表、Markdown 结构、内部路径引用、敏感信息和 `git diff --check`。

## Focused verification

```bash
git status --short --branch
git diff --check
```

另外以只读脚本确认预期文件存在、阶段状态和路径引用没有明显缺失。

## Broader verification

不运行应用 lint/build：本阶段不修改应用代码，运行这些命令不会为文档正确性增加有效证据。

## Security, privacy, reliability and recovery

- 文件不得包含 `.env` 内容、密钥、令牌或个人信息。
- 不修改数据、外部系统或远端仓库，因此不需要数据恢复。
- 若发现用户已有改动，停止覆盖并重新评估范围。

## Acceptance criteria

- 当前分支名称包含 `refactor`。
- 所有批准文件已创建，且没有业务文件或依赖变化。
- 文件准确描述 `app/`、`web/`、`server/` 和现有验证命令。
- 计划与实际证据分开；没有把未来阶段描述为已经完成。
- 产品未知项和自动化测试缺口明确可见。
- `git diff --check` 通过，工作树状态与变更列表已记录。

## Evidence required before completion

- 分支名称和 `git status` 输出。
- 新增文件列表。
- `git diff --check` 的实际结果。
- 对文档路径、状态和敏感信息的检查结果。

## Handoff and stop condition

验收标准满足后，将 Phase 00 标记为 `Complete`，在 build log 追加完成证据并停止。不得自动启动
Phase 01，也不得提交或推送。
