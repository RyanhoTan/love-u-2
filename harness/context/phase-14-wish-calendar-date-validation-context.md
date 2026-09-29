# Phase 14 context

## Request date boundary

心愿 `targetDate` 和记录 `recordDate` 在服务端以无时区的 `YYYY-MM-DD` 字符串接收，再写入 `DATE NOT NULL`。现有正则只检查形状，会让不存在的日历日通过。新校验须同时满足形状、真实日历日和当前仓库 DATE 回填默认值 `1000-01-01` 所对应的下界，避免数据库依赖 SQL mode 决定错误行为。

这是输入收紧，不更改历史行或日期字段是否可空。目标日期可空仍牵涉产品场景和当前非空数据库列，需要另行决定和迁移计划。
