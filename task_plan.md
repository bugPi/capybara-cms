# Capybara CMS 后台开发完成计划

## 目标
根据现有 CMS 内容，补齐缺失的后台页面与标准 CMS 功能，完成后台开发。
验收标准：`pnpm build` 通过、`pnpm lint` 通过（0 error）、后台所有侧边栏入口可访问可用。

## 状态：✅ 全部完成（2026-08-13）

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 1 | 修复构建阻塞（TS 类型 + lint 17 errors） | ✅ complete |
| Phase 2 | 分类/标签管理页 | ✅ complete |
| Phase 3 | 媒体库页 | ✅ complete |
| Phase 4 | 用户管理页 | ✅ complete |
| Phase 5 | 站点管理页 | ✅ complete |
| Phase 6 | 审计日志页 | ✅ complete |
| Phase 7 | 系统设置页（常规/API/MCP） | ✅ complete |
| Phase 8 | 标准功能补充（REST API + Webhook 派发） | ✅ complete |
| Phase 9 | 收尾验证（lint/build/dev 冒烟 + 端到端 webhook） | ✅ complete |

## 验收结果
- `pnpm build` ✅（43 路由，含全部新页面 + /api/posts + Proxy；仅 metadataBase 提示）
- `pnpm lint` ✅ 0 errors / 0 warnings
- `npx tsc --noEmit` ✅ 通过
- 后台 13 个页面 dev 冒烟全部 200 ✅
- REST API 鉴权与权限（401/403）✅、Webhook HMAC 派发端到端 ✅

## 错误记录
| 错误 | 尝试 | 解决 |
|------|------|------|
| app-sidebar avatar 类型错误 | NavUser 参数类型收紧 | avatar 改为可选 |
| seed.ts timestamp_ms 传 number | — | 全部改传 Date（new Date(now)/new Date(post.date)） |
| login 页用 i18n Link 导致 build 崩溃（use-intl 无 Provider） | 改用 next/link | 已修复并重新 build 验证 |
| 种子只跑一半（posts/api_keys 空） | 排查 | 旧 dev server 持有已删除 DB inode；重启 dev server + 全新 DB 后种子完整（4 用户/6 文章/1 key/1 webhook/6 MCP） |
| middleware 弃用警告 | 查 Next16 文档 | 重命名为 proxy.ts |
