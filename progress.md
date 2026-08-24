# 会话进度日志 (progress.md)
## Session 7 - 后台 Arco 风格改造 + 沉浸式编辑器重写（2026-08-24）

### 完成情况

- **Arco Design 中后台风格**（`app/globals.css` 新增 `.arco` 作用域，仅作用于 `/capybara`，前台营销站不受影响）
  - 设计 token：arcoblue `#165DFF` 主色、Arco 灰阶（`#F7F8FA` 页面底 / `#F2F3F5` 填充 / `#E5E6EB` 边框 / `#1D2129`~`#86909C` 文字）、小圆角（≈2-4px）、明暗双主题
  - 通过覆盖 shadcn 语义变量（`--primary/--brand/--radius/--sidebar-*/--muted/...`）让全部现有组件自动 Arco 化，未改动任何 ui 基础组件
  - 表格：表头浅灰底 + 二级文字色（CSS 变量驱动）；登录页改为灰底白卡简约风
  - 去装饰：移除后台品牌渐变光晕（`console-surface` 渐变）、噪点（`console-grain`）、呼吸/脉冲动画、渐变标题字；保留克制的入场 fade
  - 侧边栏 Logo 改纯色 arcoblue 方块；`PageHeader` 去图标块（Arco Pro 页头风格，保留接口兼容）
  - `StatusBadge`/`RoleBadge` 换 Arco 色板（绿 #00B42A / 橙 #FF7D00 / 蓝 / 灰，圆点 + 浅色底标签）
  - 仪表盘统计卡 Arco 化：灰标签 + 大数字 + 浅色图标块 + hover 阴影
- **沉浸式编辑器重写**（`components/post-editor-shell.tsx` 完全重写，新建/编辑共用；删除 `post-form.tsx`）
  - 极简顶栏（h-12 吸顶毛玻璃）：收起侧栏 + 返回 + 状态徽章 + 保存状态（未保存/保存中/已保存）+ 字数统计 + 设置入口 + 保存按钮
  - 居中书写区（max-w-760px）：无边框大标题输入（text-3xl）+ 无边框富文本编辑器
  - wangEditor 精简工具栏（`toolbarKeys` 白名单：标题/加粗/斜体/删除线/列表/引用/行内代码/代码块/链接/表格/分割线/撤销重做），吸顶于顶栏之下
  - 编辑器随内容自动增高（`.w-e-text-container height:auto`），页面级滚动，正文底部留 40vh 呼吸空间
  - 元信息（状态/分类/标签/精选/slug/摘要）+ 版本历史统一收进右侧抽屉（Sheet + Tabs），新建模式仅显示发布设置
  - 全字段状态化 + form 内隐藏字段提交（与 server action 完全兼容）；`⌘/Ctrl+S` 快捷保存；脏状态跟踪；保存失败 toast
  - 保存/恢复版本后由 `key={post.updatedAt}` 重挂载载入最新内容（沿用原机制）
  - `PostRevisions` 改为无壳列表组件（原 Card 壳由抽屉承担）
- **验证**
  - `pnpm build` ✅（44 路由）、lint 0 errors ✅、tsc ✅
  - 16 个后台页面 dev 冒烟全部 200；前台营销站确认未受 `.arco` 影响
  - E2E（server action 渐进增强协议 `$ACTION_REF_*`）：updatePost 提交新表单字段结构 -> DB 更新/快照生成/标签替换/303 重定向全部正常
  - 测试后已全新 DB 重新种子恢复原状

### 运维记录
- dev server 运行于 http://localhost:3000（后台任务，日志 /tmp/capybara-dev3.log）
- dev 模式 server action 的 action ID 与生产构建不同：从页面内嵌客户端 chunk 提取（`createServerReference` 调用处），或用表单的 `$ACTION_REF_1`/`$ACTION_1:0`/`$ACTION_1:1` 隐藏字段以渐进增强方式调用
- curl 模拟 action 提交时 `-F` 的值不能以 `<` 开头（会被当作文件引用），需用 `--form-string`

## Session 6 — 编辑文章沉浸式写作体验（2026-08-14）

### 完成情况
- **流式宽度**：编辑页与新建页移除 `max-w-3xl` 固定宽度限制，编辑器随视口自适应
- **专注模式**（新增 `components/post-editor-shell.tsx`）
  - 「专注写作」按钮切换：收起版本历史面板与页面标题，编辑器全宽 + 高度撑满视口
    （`calc(100vh - 240px)`）
  - 专注模式极简顶栏：返回列表 + 文章标题 + 退出专注
  - 普通模式：流式宽度编辑器 + 右侧版本历史面板（保持原有恢复/查看能力）
- **透传高度**：`RichTextEditor` / `RichEditorInner` / `PostForm` 新增 `height` / `editorHeight` 可选 prop
- 编辑页改为服务端取数 + `PostEditorShell` 客户端外壳（表单 `key` 跟随 `updatedAt` 重挂载逻辑保留）
- **验证**：编辑页/新建页 200、专注入口与版本面板渲染确认、`max-w-3xl` 已移除、`pnpm build` ✅、lint/tsc ✅

## Session 5 — 后台图表与图标（2026-08-14）

### 完成情况
- **图表（recharts 3.10.1，支持 React 19）**：仪表盘新增「数据概览」区块
  - 发布趋势：最近 12 个月创建文章数（面积图，品牌渐变填充）
  - 文章状态：环形图 + 中心总数 + 图例（已发布/草稿/待审核/已归档）
  - 最近操作：最近 7 天审计日志柱状图
  - 分类文章数：横向条形图
  - 图表均带悬停 tooltip、入场动画（700ms）、跟随主题色（CSS 变量）
- **数据查询**（`lib/queries.ts`）：`getPostsTrend(12)`、`getAuditActivity(7)`（strftime 按月/日分组，空月/空日补 0）
- **图标**：新增 `PageHeader` 组件（品牌色图标块 + 标题 + 描述 + 操作区），
  应用到 13 个后台页面/组件头部：文章列表/回收站、创建文章、编辑文章、分类、标签、媒体、
  用户、站点、审计日志、常规设置、API 配置、MCP 工具、账号设置
- **验证**：14 个后台页面 200、仪表盘图表（recharts/svg/4 个图表区块）渲染确认、
  `pnpm build` ✅、lint/tsc ✅
- 修复过程记录：manager 组件头部替换导致的 JSX 结构破损（按钮移入 action）、
  lucide 图标重复导入合并、recharts Tooltip formatter 类型放宽

## Session 4 — 后台样式调整（2026-08-14）

### 最终状态：后台与前台一致（品牌渐变质感）+ 动画（经用户最终确认）
- 过程：先做「品牌渐变」→ 用户改为「shadcn 素色」→ 用户最终确认「后台与前台一致 + 动画」
- **风格**（重新应用品牌渐变，与前台营销站一致）
  - `console-surface` 内容区品牌径向光晕 + 竖向渐变背景；`console-header` 毛玻璃顶栏；
    `console-grain` 与前台同款噪点质感；`console-title-accent` 渐变标题
  - 侧边栏品牌渐变 Logo（呼吸光晕 + hover 光泽）；导航 `data-active` 品牌色激活态（保留路径自动高亮）
  - 仪表盘统计卡彩色图标块 + hover 抬升；状态/角色徽章彩色化；登录页渐变顶条卡片；文章列表圆角抬升表格
- **动画**（globals.css 新增 keyframes + 类）
  - `anim-fade-up`：元素上浮淡入（仪表盘统计卡/区块交错延迟 60ms 递增）
  - `anim-page`：`<main>` 按 pathname 重挂载触发路由切换入场动画
  - `anim-breathe`：Logo/标题图标呼吸光晕；`anim-pulse-dot`：圆点脉冲
  - `prefers-reduced-motion` 下全部动画关闭
- 验证：14 个后台页面 200、样式与动画类均出现在渲染 HTML、`pnpm build` ✅、lint/tsc ✅

## Session 3 — 前台接入数据库 + 真实鉴权（2026-08-14）

### 完成情况
- **前台博客接入数据库** ✅
  - 新 `lib/blog.ts` 公共查询：已发布文章列表 / 按 slug 详情 / 相关阅读（仅暴露 published 且未删除）
  - 博客列表页改为服务端查库 + 客户端组件（`components/blog-list.tsx`）拆分，保留筛选/视图切换/GSAP 动效
  - 详情页查库，正文兼容双格式：富文本 HTML 原样渲染 + 历史 Markdown 走 react-markdown；SEO metadata、相关阅读、标签均来自数据库
  - `sitemap.ts` 接入已发布文章（zh/en 双语言 URL）
  - 端到端验证：后台新建+发布富文本文章 → 即时出现在前台列表/详情；草稿不显示；测试数据已清理
  - 遗留：`lib/blog-posts.ts` 仅剩 seed 使用（种子文章来源），前台页面已不再引用 mock
- **真实鉴权 + 密码哈希** ✅
  - `lib/password.ts`：node:crypto scrypt 加盐哈希（`scrypt$N$r$p$salt$hash`），零第三方依赖
  - `lib/auth.ts`：签名会话 cookie（`userId.expiry.HMAC-SHA256`，密钥来自 `SESSION_SECRET` 环境变量，生产未配置则抛错），内置 7 天过期
  - `login`：哈希校验 + 旧明文登录自动升级哈希 + 连续 5 次失败锁定 15 分钟（内存限流）；cookie 增加 secure 标志（生产）
  - 存量明文密码启动时自动迁移为哈希（`upgradeLegacyPasswords`）；seed 密码改为哈希
  - 新增「修改密码」页 `/capybara/account`（校验当前密码、新密码 ≥8 位、审计 `user.change_password`）；NavUser 退出登录改为调用真实 logout + 增加修改密码入口
  - E2E：哈希登录、篡改/伪造 cookie 拒绝、限流锁定、改密后新旧密码验证、明文升级，全部通过
- **验证**：`pnpm build`（44 路由）✅、lint 0 errors ✅、tsc ✅

### 运维记录
- 演示账号密码不变：`demo`（4 个账号均哈希存储）
- 生产部署必须设置 `SESSION_SECRET`（≥16 字符），否则 auth 模块抛错
- 登录限流为进程内存实现，多实例部署需换共享存储

## Session 2 — 富文本编辑器 + 版本历史（2026-08-14）

### 完成情况
- **富文本编辑器（wangEditor 5）** ✅
  - 调研确认钉钉仓颉 WeEditor（`@ali/hetu-we-editor`）为阿里内部包，公共 npm/CDN/GitHub 均不可用，经用户确认改用 wangEditor 5（MIT、React 19 兼容）
  - 安装 `@wangeditor/editor@5.1.23` + `@wangeditor/editor-for-react@1.0.6`（wangEditor 模块加载依赖 DOM，用 `next/dynamic ssr:false` 仅在客户端加载）
  - 文章表单正文由纯 textarea（Markdown）改为所见即所得编辑器，输出 HTML，经隐藏字段随 Server Action 提交
  - 工具栏排除视频/图片上传/全屏（图片上传后续可接媒体库）
- **版本历史** ✅
  - 新表 `post_revisions`（post_id/title/slug/excerpt/content/status/author_id/created_at，级联删除，按 post+时间建索引）
  - 创建/更新文章自动快照当前状态，每篇最多保留 30 个版本（自动清理最旧）
  - 编辑页右侧「版本历史」面板：列表 + 查看（对话框渲染 HTML）+ 恢复（确认对话框）
  - `restoreRevision`：恢复标题/摘要/正文（slug 仅在未被占用时恢复），恢复前先快照当前状态保证可回退，写审计 `post.restore_revision` + 派发 `post.updated` webhook
  - 编辑表单 `key` 跟随 `updatedAt`，恢复后自动重挂载载入恢复内容
- **验证** ✅
  - `pnpm build` 通过（44 路由）、`pnpm lint` 0 errors、`tsc --noEmit` 通过
  - E2E（server action 协议）：登录 → 创建文章（HTML 正文）→ 快照 v1 → 更新发布 → 快照 v2 → 恢复 v1 → 正文回滚 + 生成 v3（恢复前快照）+ 审计记录 3 条；测试数据已清理
- **运维记录**：pnpm store v10/v11 不匹配 → `pnpm install --config.confirm-modules-purge=false` 重新对齐；better-sqlite3 预编译正常

### 已知遗留
- 前台博客仍读 mock 数据，未接入数据库（后台发布的 HTML 文章不会出现在前台）
- 富文本图片上传未接媒体库（工具栏暂隐藏图片组）
- 旧种子文章正文为 Markdown，在富文本编辑器中显示为原文（需手动转换）

## Session 1 — 后台开发完成（2026-08-13）

### 完成情况
- **Phase 1 构建修复** ✅
  - NavUser avatar 类型 `string | undefined` → 可选
  - lint 17 errors/6 warnings 全部清零（`<a>`→`<Link>` ×4 文件、theme-toggle setState-in-effect → useSyncExternalStore、faq/pricing useCallback 空依赖 → 普通函数、features let→const、layout/request `any` → 类型断言、settings 未用导入）
  - seed.ts `timestamp_ms` 列传值 Date 修复（8 处）
  - `middleware.ts` → `proxy.ts`（Next 16 新约定，消除弃用警告）
- **Phase 2 分类/标签管理页** ✅ `/capybara/content/categories`、`/content/tags`
- **Phase 3 媒体库** ✅ `/capybara/media`（上传/网格/复制 URL/删除）
- **Phase 4 用户管理** ✅ `/capybara/users`（创建/编辑/删除、角色/状态）
- **Phase 5 站点管理** ✅ `/capybara/sites`（默认站点、语言）
- **Phase 6 审计日志** ✅ `/capybara/audit`（分页 + 操作/操作者筛选）
- **Phase 7 系统设置** ✅ `/settings/general`、`/settings/api`（API Key + Webhook）、`/settings/mcp`
- **Phase 8 标准功能补充** ✅
  - REST API：`GET/POST /api/posts`、`GET/PATCH/DELETE /api/posts/:id`，Bearer API Key 鉴权，read/write scope 校验，更新 last_used_at，写审计
  - Webhook 派发：`lib/webhooks.ts`，HMAC-SHA256 签名，接入 posts 全部动作（created/updated/published/deleted）
- **Phase 9 验证** ✅
  - `pnpm build` 通过（43 页面，仅 metadataBase 提示）
  - `pnpm lint` 0 errors 0 warnings；`tsc --noEmit` 通过
  - dev server 冒烟：13 个后台页面全部 200；API 读取 200/写入 403 权限正确/坏 key 401
  - 端到端：API 写 key 创建文章 201 → Webhook 收到带签名的 post.created payload

### 新文件
- 页面：`app/capybara/(console)/` 下 categories/tags/media/users/sites/audit/settings/{general,api,mcp} 共 10 个 page.tsx；`app/api/posts/route.ts`、`app/api/posts/[id]/route.ts`
- 组件：`confirm-action.tsx`、`category-manager.tsx`、`tag-manager.tsx`、`media-manager.tsx`、`user-manager.tsx`、`site-manager.tsx`、`settings/{general-form,api-manager,mcp-manager}.tsx`
- 库：`lib/api-auth.ts`、`lib/webhooks.ts`；`lib/queries.ts` 新增用户/站点/媒体/审计/设置/API Key/Webhook/MCP 查询

### 修改文件
- 修复：`nav-user.tsx`、`header.tsx`、`theme-toggle.tsx`、`login-form.tsx`、`post-form.tsx`、`faq.tsx`、`pricing.tsx`、`features.tsx`、`app/layout.tsx`、`app/[locale]/layout.tsx`、`i18n/request.ts`、`lib/actions/settings.ts`、`lib/actions/posts.ts`（+webhook 派发）、`lib/db/seed.ts`
- 重命名：`middleware.ts` → `proxy.ts`
- `.gitignore`：+`/data`

### 运维记录
- 端口 3000 原有一个用户遗留的 dev server（next dev，持有已删除 DB inode），已重启为全新 dev server（当前代码 + 全新种子 DB）
- 测试用的写 Key / webhook / 文章已清理；生产验证服务器（3100）已停止
- dev server 当前运行于 http://localhost:3000（后台任务）

### 已知遗留（非本次范围）
- 公开博客仍读 mock 数据（lib/blog-posts.ts），未接入后台数据库
- 鉴权为演示级（明文密码 + cookie userId），注释 TODO 标注需换 jose/iron-session + 哈希
- 审计日志保留天数清理任务未实现（仅有设置项）
- MCP 工具仅开关管理，无实际 MCP server
