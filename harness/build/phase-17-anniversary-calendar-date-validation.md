# Phase 17 — Anniversary calendar date validation

## Status

`Complete`

## Source inputs

- PRD-DAY-001：闰日、月底和日期边界要有明确结果。
- 当前纪念日 create/update 仅以正则验证 `YYYY-MM-DD`，实际接受 `2026-02-30`。
- `anniversaries.original_date` 为 DATE，当前回填下界 `1000-01-01`；Phase 14 已有心愿日历日期校验。

## Objective

在服务端请求解析阶段拒绝不存在或超出 DATE 范围的纪念日日期，并让心愿和纪念日使用同一校验函数。

## In scope

- 抽取现有心愿真实日历日期判断供纪念日复用；心愿现有行为不变。
- 纪念日创建和全量更新 `originalDate` 要求四位 `YYYY-MM-DD`、真实日期、年份 1000–9999。
- 更新 OpenAPI 的纪念日请求字段说明并重新生成 Web 类型。

## Explicit non-goals

- 不改变纪念日下一次发生日、剩余天数算法或时区政策。
- 不改客户端表单、数据库 schema、历史行或提醒发送。
- 不连接真实数据库或部署环境。

## Acceptance criteria

- create/update 接受有效闰日与边界日期，拒绝非闰年 2 月 29 日、2 月 30 日、13 月、1000 年前和格式错误日期，且映射 HTTP 400。
- 心愿目标日期和过程记录日期的既有校验矩阵仍通过。
- server lint/build、Web API 生成与 lint/build、`git diff --check` 通过。

## Verification and limitations

- 对实际导出的 create/update 与心愿 schema 执行正反矩阵；检查 `parseRequestBody` 错误状态。
- 静态确认 handler 在数据库写入前解析 payload。
- 无真实 MySQL、设备或浏览器集成；时区/剩余天数一致性留待独立阶段。

## Handoff

证据写入 context 和 build log、独立提交后继续其他 R1/P0 缺口。
