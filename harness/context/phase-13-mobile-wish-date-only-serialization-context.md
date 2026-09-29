# Phase 13 context

## Date-only boundary

`DatePickerModal` 的 `mode="date"` 表示用户选择的是设备本地日历日。心愿 `targetDate` 和记录 `recordDate` 是 API 的 `YYYY-MM-DD` 日期字段，不代表 UTC 时刻。提交时读取本地年、月、日；`toISOString()` 会先转换 UTC，可能改变日历日。

现有纪念日创建页已用本地 getter 格式化 API 日期。本阶段只把心愿域的两条提交路径对齐这一语义；后续修改其他日期字段时应沿用该区分。目标日期是否允许为空仍涉及当前非空数据库列及产品场景，未在本阶段决定。
