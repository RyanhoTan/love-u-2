# Phase 02 — Web today real-data baseline

## Status

`Complete`

## Source inputs

- `PRD.md` 中 PRD-TODAY-001 与 R1“可信核心闭环”。
- 用户明确要求开始按 PRD 实现，并允许每个小点完成后提交。
- Web “今天”页、登录页、情侣 session、纪念日和相册查询实现。

## Objective

清除 Web 生产页面对 `TODAY` mock 业务内容的依赖，使“今天”页只展示真实账户/情侣资料、
纪念日和相册数据，未绑定或无数据时展示诚实空状态。

## In scope

- 移除 Web “今天”页的 stock hero、模拟状态和模拟一句话。
- 用真实用户与伴侣头像/名称展示情侣卡片。
- 未绑定时只显示绑定引导，不请求情侣专属纪念日或相册内容。
- 移除没有实际行为的首页搜索/通知图标。
- 将登录背景改为非业务数据的本地 CSS 装饰。
- 删除不再被引用的 `web/src/mocks/index.ts`。
- 运行 Web lint、build 和静态 mock 引用检查。

## Explicit non-goals

- 不实现今日状态、一句话、搜索或通知后端。
- 不修改移动端、服务端、数据库或 OpenAPI。
- 不改变认证、情侣绑定、纪念日或相册 API。
- 不推送或部署。

## Dependencies and prerequisites

- Phase 00 已完成。
- 该阶段由用户的 PRD 实施请求直接授权，不依赖尚未启动的 Phase 01。
- Web 依赖已安装，修改前 lint 与 build 均通过。

## Expected affected files

- `web/src/pages/today-page/index.tsx`
- `web/src/pages/login-page/index.tsx`
- `web/src/mocks/index.ts`（删除）
- `PRD.md`
- `PLANS.md`
- `harness/build/phase-02-web-today-real-data.md`
- `harness/build-log.md`

## Approval gate

当前阶段已由用户授权。状态/一句话、通知或搜索实现需要后续独立阶段。

## Red, green, refactor, verification plan

- **Red:** 修改前 `rg 'TODAY|@/mocks' web/src/pages web/src/mocks` 命中生产页面和 mock 模块。
- **Green:** 页面不再引用模拟业务内容，真实情侣/纪念日/相册状态可以渲染。
- **Refactor:** 删除失去使用方的 mock 模块和无行为入口。
- **Verify:** Web lint、Web build、mock 引用检查和 diff 自审。

## Acceptance criteria

- PRD-TODAY-001 的首页不再展示模拟状态、模拟一句话或 stock 情侣照片。
- 已绑定用户只看到 session、纪念日和相册 API 提供的数据。
- 未绑定用户看到绑定入口，不呈现虚构共同内容。
- 登录页不依赖 mock 业务模块或远程 stock 图片。
- `web/src` 中没有 `TODAY` 或 `@/mocks` 引用。
- Web lint 与 build 通过。
- 改动以独立 Conventional Commit 提交，不推送。

## Evidence required before completion

- 修改前与修改后的 mock 引用检查。
- `pnpm --dir web lint` 和 `pnpm --dir web build` 实际结果。
- Git diff 与提交 SHA。

## Handoff and stop condition

验收通过并提交后将阶段标记为 `Complete`。后续功能另建小阶段，不自动实现占位状态或通知。
