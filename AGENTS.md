# AGENTS.md — 合拍（InSync）协作指南

## 项目概览

合拍（InSync）是面向情侣的共享生活应用。本仓库包含三个主要运行单元：

- `app/`：Expo、React Native、Expo Router 和 TypeScript 移动端。
- `web/`：Vite、React 和 TypeScript Web 端。
- `server/`：Express、TypeScript、MySQL、WebSocket 和对象存储后端。

品牌名称、slug、移动端 scheme 和存储键统一以根目录 `brand.json` 为准。

## 开始工作前

1. 读取本文件以及当前目录适用的其他 `AGENTS.md`。
2. 读取 `PRD.md`、`GOALS.md`、`PLANS.md`、所选 `harness/build/<phase>.md`、
   `harness/build-log.md` 和相关 phase context。
3. 用 `git status --short --branch` 检查分支和现有改动。用户已有改动必须保留。
4. 检查实时仓库内容、包脚本和配置；文档与实现冲突时，以实现为事实依据，
   同时明确报告文档偏差。
5. 在写入前确认本次请求授权的范围、非目标、验收标准和验证方式。

如果没有已批准的阶段，不要自行开始产品功能、架构迁移或大范围重构；先提交一份
有证据支持的阶段建议。

## 信息所有权

- `AGENTS.md`：长期有效的仓库规则、工作约定和验证入口。
- `PRD.md`：产品定位、业务方向、功能增删、优先级和产品验收要求。
- `GOALS.md`：产品与工程结果、成功条件、范围和非目标。
- `PLANS.md`：已批准的阶段顺序及依赖关系。
- `PROMPTS.md`：启动、执行、验证、评审和交接工作的可复用入口。
- `harness/build/<phase>.md`：单个阶段获准的范围、验收标准和计划验证。
- `harness/context/<phase>-context.md`：影响未来工作的实质性发现、决策和未知项。
- `harness/build-log.md`：实际进度以及已经观察到的验证证据。
- `harness/code_review/`：详细评审发现和签收状态。

不要在这些文件之间大段复制信息；需要关联时链接到权威文件。

## 仓库边界

- 把改动限制在用户请求或已批准阶段内，避免顺手清理无关代码。
- 未经单独明确要求，不提交、不推送、不部署、不切换远端状态，也不创建或使用凭据。
- 不读取、记录或提交 `app/.env`、`server/.env` 以及任何密钥、令牌或个人数据。
- 不执行破坏性 Git 命令，不覆盖用户已有改动。
- 数据库变更必须默认保护现有数据；说明兼容性、回滚或恢复方案，不把自动建表等同于
  已验证的生产迁移。
- 身份认证、情侣关系隔离、私有媒体访问和上传处理属于高风险边界。相关改动必须包含
  未授权路径、跨情侣访问和失败行为的验证。
- API 或数据模型改动要检查 `app/`、`web/`、`server/` 与 `web/openapi.json` 的影响，
  但只修改当前阶段明确授权的消费者和生成物。

## 常用命令

从仓库根目录运行：

```bash
pnpm run install:all
pnpm dev
pnpm run dev:app
pnpm run dev:web
pnpm run dev:server
```

按受影响范围验证：

```bash
pnpm --dir app lint
pnpm --dir app exec tsc --noEmit
pnpm --dir server lint
pnpm --dir server build
pnpm --dir web lint
pnpm --dir web build
```

运行服务需要本地环境变量以及可用的 MySQL、对象存储等外部依赖。缺少这些条件时，
明确记录未执行的集成验证，不能把构建或 lint 结果描述为端到端通过。

根目录 `pnpm format` 会写入文件，只在格式化范围得到授权时运行。

## 实施约定

- 遵循邻近代码的 TypeScript、命名、模块和格式风格。
- 优先做最小、可独立验证的改动。
- 适用时采用 Red → Green → Refactor → Verify：先获得有意义的失败信号，再做最小实现，
  在行为不变的前提下重构，最后执行聚焦和更广泛验证。
- 服务端提供 `pnpm --dir server test`（Node 内置测试运行器，测试文件位于 `server/test/`）；
  App/Web 尚无已配置的自动化测试脚本。不要声称未运行的测试通过；新增测试框架或依赖需要明确
  纳入阶段范围。
- 修复缺陷时优先添加能复现缺陷的回归测试；若当前测试基础不足，记录原因和替代验证。
- 对外部服务、真机、网络、数据库或存储的写操作需要单独确认其目标和影响。

## 阶段完成与交接

阶段只有在以下条件满足时才可标记为 `Complete`：

- 已批准的验收标准全部满足。
- 要求的命令或人工检查确实运行并记录结果。
- 失败、跳过项、限制和剩余风险仍然可见。
- 相关 context 已记录重要决策，build log 已记录实际证据。
- 需要的评审问题已解决或被明确接受。

完成一个阶段后停止；下一阶段必须由新的用户请求或明确批准启动。
