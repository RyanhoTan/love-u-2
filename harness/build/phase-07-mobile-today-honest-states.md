# Phase 07 — Mobile today honest states

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-TODAY-001。
- Phase 06 清理假状态/一句话后观察到的首页状态折叠问题。
- 现有情侣空间和纪念日 API。

## Objective

移动端首页只在真实已绑定关系下展示情侣信息；加载、失败和未绑定都有可辨识、可继续操作的界面。

## In scope

- 增加首页加载、失败重试和未绑定引导。
- 先查询情侣关系，仅在已绑定时查询纪念日。
- 只有真实已绑定关系展示情侣天数、心愿和纪念日入口。
- 缺少关系日期时不显示虚构的 0 天。

## Explicit non-goals

- 不修改情侣或纪念日服务端接口。
- 不新增首页缓存、下拉刷新或 skeleton。
- 不改变心愿和纪念日内部页面。
- 不实现状态或一句话。

## Acceptance criteria

- 加载中显示明确进度。
- 请求失败不展示默认情侣数据，并提供可用重试操作。
- 未绑定用户看到绑定引导，不看到情侣专属天数、心愿和纪念日。
- 已绑定用户只展示接口返回的双方资料、天数和纪念日。
- app lint、状态分支静态检查和 diff 检查通过。

## Verification

- 检查 `homeStatus` 的 loading/error/ready 分支和 `coupleSpace.isBound` 分支。
- `pnpm --dir app lint`
- `pnpm --dir app exec tsc --noEmit`
- `git diff --check`

## Handoff and stop condition

验证和独立提交后停止，不自动改动首页其他业务模块。
