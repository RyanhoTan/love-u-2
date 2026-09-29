# Phase 21 — Mobile anniversary list honest states

## Status

`Complete`

## Source inputs

- PRD-DAY-001：纪念日列表是已实现核心路径。
- R1：失败时诚实反馈；当前移动端读取失败会清空列表并把页面渲染为“还没有纪念日”。

## Objective

移动端纪念日列表区分加载、成功空列表、成功有数据和读取失败；失败时允许重试。

## In scope

- 添加独立读取错误状态与重试操作；成功后清除错误并显示真实列表或空状态。
- 读取失败不展示虚假的空数据描述。
- 保留现有创建入口、列表卡片与 API 契约。

## Explicit non-goals

- 不实现尚缺失的编辑/删除页面或点击卡片交互。
- 不改变服务端、缓存策略、提醒、创建或关系语义。
- 不接入真实设备/后端。

## Acceptance criteria

- 加载中有明确文案；读取失败展示错误和可用重试按钮，而非“还没有纪念日”。
- 只有接口成功且列表为空时显示真实空状态；成功有数据时显示卡片。
- app lint/typecheck、静态状态分支检查与 diff 检查通过。

## Verification and limitations

- 人工复核异步加载的 loading/error/empty/list 分支、失败后重试与成功清错。
- `pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、`git diff --check`。
- 无真机/API 失败集成，因此不能宣称端到端通过。

## Handoff

完成验证与证据记录后独立提交，继续其他 R1/P0 缺口。
