# 调研发现 (findings.md)

## 项目架构
- Next.js 16.2.3 (App Router, Turbopack), React 19.2.4, Tailwind 4, shadcn/ui (radix-ui 统一包), better-sqlite3 + drizzle-orm, next-intl, GSAP
- 路径别名 `@/` → 项目根
- 后台路由: `app/capybara/(console)/` 路由组 + login；未登录由 `(console)/layout.tsx` redirect 到 /capybara/login
- 会话: cookie `capybara_session` 存 userId (httpOnly)；`lib/auth.ts` getSessionUser/requireUser/requireAdmin
- DB: `lib/db/index.ts` 原生 SQL 建表（无 drizzle-kit），单例 globalThis；种子 `lib/db/seed.ts`（幂等，users 非空即跳过）
- 审计: `lib/db/audit.ts` writeAudit(actor, action, entityType, entityId, detail)；`lib/audit-labels.ts` auditActionLabel()

## 已有 server actions（均 "use server"，带 requireUser/requireAdmin + writeAudit）
- lib/actions/auth.ts: login/logout (LoginState)
- lib/actions/posts.ts: createPost/updatePost/deletePost(软删)/restorePost/hardDeletePost/... (PostFormState, useActionState 模式)
- lib/actions/taxonomy.ts: createCategory/updateCategory/deleteCategory/createTag/updateTag/deleteTag (TaxonomyState)
- lib/actions/settings.ts: updateGeneralSettings/...（含 apiKeys/webhooks/mcpTools 管理？需读完）
- lib/actions/media.ts: uploadMedia/deleteMedia (MediaState)
- lib/actions/sites.ts: createSite/updateSite/deleteSite/setDefaultSite? (SiteState)
- lib/actions/users.ts: createUser/updateUser/deleteUser (UserFormState)

## UI 模式
- 表单: useActionState(action, null) + Field/FieldGroup/FieldLabel 组件（components/ui/field.tsx）
- 列表: table 组件 + 分页 (components/ui/pagination.tsx)
- 状态徽章: components/status-badge.tsx (StatusBadge)
- 空态: components/ui/empty.tsx (Empty title/description)
- 侧边栏: components/app-sidebar.tsx (navData 静态)，NavMain/NavUser
- 布局壳: components/console-shell.tsx
- 卡片: components/ui/card.tsx

## 已知问题
- build 失败: app-sidebar.tsx:130 NavUser user.avatar `string | undefined` 不匹配 `string`
- lint 17 errors/6 warnings:
  - footer.tsx / login-form.tsx 用 `<a>` 导航（应 <Link>）
  - hero.tsx/pricing.tsx/faq.tsx/landing-motion.tsx react-hooks 问题（setState in effect / memoization / missing deps / prefer-const）
  - i18n/request.ts:9 no-explicit-any
  - lib/actions/settings.ts:8 requireAdmin 未使用
- middleware.ts 弃用警告（middleware → proxy，Next 16）

## 待建页面（actions 已就绪）
| 路由 | 需要的 actions/查询 |
|------|------|
| /capybara/content/categories | lib/actions/taxonomy.ts + getCategoriesWithCounts (lib/queries.ts) |
| /capybara/content/tags | taxonomy + getTagsWithCounts |
| /capybara/media | media actions + media 表查询 |
| /capybara/users | users actions + users 表查询 |
| /capybara/sites | sites actions + sites 表查询 |
| /capybara/audit | auditLogs 查询（分页/筛选） |
| /capybara/settings/general | updateGeneralSettings + settings 表 |
| /capybara/settings/api | apiKeys/webhooks actions（若存在）+ 表 |
| /capybara/settings/mcp | mcpTools actions（若存在）+ 表 |

## 种子数据
- 4 用户: admin@capybara-cms.local / editor / author / reviewer，密码全 demo
- 6 篇文章（从 blog-posts.ts 迁移）、5 分类、标签若干、2 站点、9 项设置、1 API key (ck_live_demo_readonly)、1 webhook (disabled)、6 MCP 工具
