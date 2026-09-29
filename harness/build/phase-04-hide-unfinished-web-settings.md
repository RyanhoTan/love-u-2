# Phase 04 — Hide unfinished Web settings

## Status

`Complete`

## Source inputs

- `PRD.md` 7.4 暂缓、隐藏或去除。
- `PRD.md` R1 可信核心闭环和 PRD-TODAY-001 的“未上线功能不伪装可用”原则。
- Web “我的”菜单与 `meRoutes` 的当前实现。

## Objective

在通知偏好、恋爱报告和主题外观尚无真实数据或保存能力时，不向 Web 用户展示看似可用的入口。

## In scope

- 隐藏 Web “我的”中的通知、恋爱报告和外观入口。
- 移除三个只渲染通用占位页的 Web 路由。
- 同步 PRD 当前基线和阶段证据。

## Explicit non-goals

- 不实现通知、报告或主题能力。
- 不修改移动端菜单。
- 不删除全局通用占位组件，因为其他 Web 路由仍在使用。
- 不改变真实个人资料和情侣空间入口。

## Acceptance criteria

- `/me` 不再展示通知、恋爱报告和外观入口。
- `meRoutes` 不再注册对应的占位路由。
- 个人资料与情侣空间仍正常注册和构建。
- Web lint/build 通过，目标路径静态检查无匹配。

## Verification

- `rg 'me/(notify|report|appearance)' web/src`
- `pnpm --dir web lint`
- `pnpm --dir web build`
- `git diff --check`

## Handoff and stop condition

验证和独立提交后停止，不自动扩展到移动端或实现 R2/R3 功能。
