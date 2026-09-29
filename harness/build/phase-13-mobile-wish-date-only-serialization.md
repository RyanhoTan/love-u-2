# Phase 13 — Mobile wish date-only serialization

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001：目标日期和过程记录属于共同心愿的真实字段；两端显示和提交不能冲突。
- `PRD.md` 4、10.5：真实优先、跨端业务字段含义一致。
- `DatePickerModal` 以本地日期模式返回 `Date`；当前心愿创建和记录创建都用 UTC `toISOString().slice(0, 10)` 提交。

## Objective

移动端提交的 `targetDate` 和 `recordDate` 与用户在日期选择器看到的本地日历日期相同，且仍符合 API `YYYY-MM-DD` 格式。

## In scope

- 添加心愿领域共用的本地日历日期格式化函数。
- 心愿创建的 `targetDate` 和过程记录创建的 `recordDate` 使用该函数。
- 将时区偏移导致的旧输出差异与新行为记入阶段证据。

## Explicit non-goals

- 不更改服务端日期 schema、MySQL 列、OpenAPI 或 Web 日期选择器。
- 不改变日期默认值、可选性或纪念日、资料生日行为。
- 不修改媒体上传、记录内容或状态流转。

## Acceptance criteria

- 上海本地 2026-09-29 00:30 与洛杉矶本地 2026-09-29 23:30 均格式化为 `2026-09-29`。
- 年、月、日以本地 `getFullYear/getMonth/getDate` 读取，月日补零，输出始终为 `YYYY-MM-DD`。
- 创建心愿和创建过程记录两条 API payload 路径均调用该函数，不再使用 UTC 切片。
- `pnpm --dir app lint`、`pnpm --dir app exec tsc --noEmit`、`git diff --check` 通过。

## Verification

- 用两个 `TZ` 环境设置对实际导出的函数运行聚焦断言。
- 静态检查两处 payload。
- 运行 app lint、TypeScript `--noEmit` 与 diff 检查。

## Risks and limitations

- 没有 Android/iOS 模拟器或真实账号后端联调；验证只能覆盖 JavaScript 日期计算与静态 API 路径。
- 未来若产品决定让目标日期可空，需要另一个覆盖数据库、服务端与两端表单的阶段；本阶段维持现有必填契约。

## Handoff and stop condition

聚焦日期断言与受影响包检查通过、记录证据并单独提交后完成本阶段，继续其他 P0 缺口。
