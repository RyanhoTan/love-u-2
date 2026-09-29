# Phase 10 — Mobile wish detail honest states

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001: 展示真实心愿与真实派生状态，不用写死展示状态；字段和删除语义需保持真实。
- `PRD.md` 产品原则 4. 真实优先：没有真实数据时显示清晰空状态，不用 mock 或硬编码内容伪装完成。
- Phase 09 已为移动端描述编辑接入真实详情读取与 PATCH。
- `app/app/home/wish-list/[id]/index.tsx` 当前在详情 GET 尚未完成或失败时仍渲染 `title`、`planning`、`targetDate`、`locationName`、`budgetAmount` 等占位演示值。

## Objective

用户打开移动端心愿详情时，只能看到由服务端真实心愿数据支持的字段与状态。详情加载期间显示加载反馈，读取失败后显示错误与重试操作；失败不得伪装成有效心愿详情。

## In scope

- 在移动端心愿详情页区分加载中、加载失败和成功状态。
- 失败状态可重试；无效心愿 ID 显示明确失败信息。
- 成功状态使用 API 的 `todo`、`doing`、`done` 作为 Tag 来源，不以 `planning` 等本地默认值覆盖。
- 删除页面中没有 API 支持的固定参与人/头像、创建人演示头像以及硬编码业务字段占位值。
- 更新 PRD 实现基线、PLANS 和 build log 证据。

## Explicit non-goals

- 不修改服务端 API、schema、数据库或生成契约。
- 不改变有效心愿的状态流转、描述编辑、记录、软删除或恢复。
- 不增加参与人或创建者关系资料 API，不补充真实头像展示。
- 不处理其他心愿页面中的模拟状态或无行为操作。
- 不新增依赖或自动化测试框架。

## Acceptance criteria

- 首次加载期间不展示心愿标题、Tag、目标日期、地点或预算的默认占位值。
- GET 失败后显示错误提示和可用的重试按钮；失败时没有假详情和成功操作。
- 无效 ID 按失败状态显示，用户可返回上一页或重试。
- GET 成功后 Tag 仅反映真实 `WishStatus`；未配置的可选展示字段使用中性空值，而非字段名占位符。
- 不再展示固定的“参与人 2/2”及硬编码头像作为真实关系数据。
- 既有开始计划与描述编辑请求保持不变。
- `pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit` 和 `git diff --check` 通过。

## Verification

- `pnpm --dir app lint`
- `pnpm --dir app exec tsc --noEmit`
- 源码检查确认 loading/error 分支不会渲染详情与状态变更操作。
- `git diff --check`

## Risks and limitations

- 本环境没有连接真实后端或移动端模拟器，因此不会验证账号态网络错误和原生布局。
- 删除静态参与人/创建人头像会收敛页面信息，直到后续提供真实关系资料数据；这比伪造 2/2 或头像可靠。

## Handoff and stop condition

完成验收、记录真实 lint/typecheck 结果并独立提交后结束本阶段。继续下一个小点时，由活动 PRD R1/P0 Goal 选择互不依赖的剩余缺口。
