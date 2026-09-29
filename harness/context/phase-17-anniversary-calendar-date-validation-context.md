# Phase 17 context

纪念日 `originalDate` 在 create/update 请求中原来只验证 `YYYY-MM-DD` 形状。聚焦基线证明两种 schema 都接受 `2026-02-30`。由于 MySQL DATE 和日期算法期望真实日历日，这会造成依赖数据库 SQL mode 的失败或含糊结果。

本阶段复用 Phase 14 的实际日历日期判断，并限制 1000–9999 年，与当前 schema 回填默认下界一致。它是输入收紧，不改日期必填性、历史数据或重复纪念日对 2 月 29 日的既有处理。服务器与设备的“今天”时区政策仍待单独处理。

校验函数现放在 `server/src/schema/dateOnly.ts`，由心愿两个日期字段和纪念日的 `originalDate` 共用；四位年份形状仍由各字段的正则保证。create/update 的有效/无效日期矩阵与心愿回归矩阵都通过，非法日期经 `parseRequestBody` 映射到 `HttpError.statusCode = 400`。第一次聚焦脚本错误检查了 `status` 字段，修正脚本后通过；实现行为没有因此修改。
