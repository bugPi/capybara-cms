/**
 * 博客文章数据（模拟 CMS 内容源）
 * 生产环境可替换为数据库 / Headless CMS API
 */

export type BlogLocale = "zh" | "en";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  /** 当前语言下的标签展示名 */
  tags: string[];
  /** 稳定 id，用于筛选与样式，与语言无关 */
  tagIds: string[];
  content: string;
  featured?: boolean;
};

type LocaleFields = {
  title: string;
  excerpt: string;
  content: string;
  author: string;
};

type RawPost = {
  slug: string;
  date: string;
  featured?: boolean;
  tagIds: string[];
  zh: LocaleFields;
  en: LocaleFields;
};

/** 标签展示名（列表 / 详情共用，不依赖 React） */
const TAG_LABELS: Record<string, { zh: string; en: string }> = {
  mcp: { zh: "MCP", en: "MCP" },
  workflow: { zh: "工作流", en: "Workflow" },
  agents: { zh: "智能体", en: "Agents" },
  seo: { zh: "SEO", en: "SEO" },
  jsonLd: { zh: "JSON-LD", en: "JSON-LD" },
  metadata: { zh: "元数据", en: "Metadata" },
  migration: { zh: "迁移", en: "Migration" },
  implementation: { zh: "实施", en: "Delivery" },
  script: { zh: "脚本", en: "Automation" },
  api: { zh: "API", en: "API" },
  webhook: { zh: "Webhook", en: "Webhook" },
  integration: { zh: "集成", en: "Integration" },
  rbac: { zh: "RBAC", en: "RBAC" },
  audit: { zh: "审计", en: "Audit" },
  security: { zh: "安全", en: "Security" },
  multiSite: { zh: "多站点", en: "Multi-site" },
  orchestration: { zh: "编排", en: "Orchestration" },
  reuse: { zh: "复用", en: "Reuse" },
};

function tagLabelsForLocale(tagIds: string[], locale: BlogLocale): string[] {
  return tagIds.map((id) => TAG_LABELS[id]?.[locale] ?? id);
}

/** 供 UI 按 tagId 与 locale 显示标签名（与 `BlogPost.tags` 一致） */
export function getTagLabel(tagId: string, locale: string): string {
  const loc = resolveBlogLocale(locale);
  return TAG_LABELS[tagId]?.[loc] ?? tagId;
}

export function resolveBlogLocale(locale: string): BlogLocale {
  return locale === "en" ? "en" : "zh";
}

function toBlogPost(raw: RawPost, locale: BlogLocale): BlogPost {
  const fields = raw[locale];
  return {
    slug: raw.slug,
    title: fields.title,
    excerpt: fields.excerpt,
    date: raw.date,
    author: fields.author,
    tags: tagLabelsForLocale(raw.tagIds, locale),
    tagIds: raw.tagIds,
    content: fields.content,
    featured: raw.featured,
  };
}

const POSTS_RAW: RawPost[] = [
  {
    slug: "mcp-workflow-guide",
    date: "2026-03-28",
    featured: true,
    tagIds: ["mcp", "workflow", "agents"],
    zh: {
      title: "MCP 工具链：让智能体在围栏里起草与发布",
      excerpt:
        "介绍如何在 Capybara CMS 中为智能体配置 MCP 工具链，实现起草、提交审核、定时发布等操作，同时保持完整的审计轨迹。",
      author: "产品团队",
      content: `
MCP（Model Context Protocol）为智能体提供了标准化的工具调用接口。在 Capybara CMS 中，我们把「起草内容」「提交审核」「预约发布」「查询版本」等步骤封装为 MCP 工具，方便接进各类智能体工作流。

## 围栏与治理

与直接调用 REST API 不同，MCP 工具链在权限层面做了闸口设计：

- **起草**：智能体可在允许的栏目下创建草稿，但不能直接发布。
- **提交审核**：草稿进入预设审批链，人工确认后才能上线。
- **定时发布**：支持预约时间窗口，系统自动排队执行。
- **审计日志**：每一步都有「谁、何时、做了什么」的记录，不可篡改。

这种围栏设计，既保留了智能体提效的优势，又不会绕过现有的治理规则。

## 一个典型流程

假设你用的是 Claude Desktop 或其他支持 MCP 的智能体客户端：

1. 在客户端配置 CMS 提供的 MCP 服务器地址与认证令牌。
2. 智能体通过 \`draft_blog_post\` 工具创建一篇草稿，内容可以是提纲、初稿或润色后的全文。
3. 草稿生成后，智能体调用 \`submit_for_review\` 提交审批，指定审批人。
4. 审批人收到通知（邮件 / IM），登录 CMS 审阅内容，确认或驳回。
5. 审批通过后，智能体调用 \`schedule_publish\` 设置发布时间，或直接 \`publish_now\`。

整个过程，智能体只做「被允许」的事，权限边界清晰。

## 与 API 的区别

直接调用 REST API 可以做更多事，比如绕过审批直接发布。这在自动化脚本场景有用，但对于智能体来说，权限粒度太粗。MCP 工具链把这些步骤封装成单一动作，动作之间有状态依赖（比如只有草稿才能提交审批），避免误操作。

如果你已经在用 API 集成，可以并行启用 MCP，两套接口共享同一套权限与审计底层。

## 下一步

- 在后台「集成设置」中启用 MCP 服务。
- 导出配置文件，供智能体客户端加载。
- 在沙箱环境试跑一篇起草流程，熟悉后再接入生产。
`,
    },
    en: {
      title: "MCP toolchain: drafting and publishing for agents inside guardrails",
      excerpt:
        "Configure MCP tools in Capybara CMS so agents can draft, submit for review, and schedule publishes—while keeping a complete audit trail.",
      author: "Product team",
      content: `
The Model Context Protocol (MCP) gives agents a standard way to call tools. In Capybara CMS we wrap steps like **draft content**, **submit for review**, **schedule publish**, and **fetch versions** as MCP tools so they fit cleanly into agent workflows.

## Guardrails and governance

Unlike calling the REST API directly, the MCP path is gated in terms of permissions:

- **Draft**: agents can create drafts in allowed sections, but cannot publish outright.
- **Review**: drafts enter an approval chain; nothing goes live without humans.
- **Scheduled publish**: time windows and queues are enforced by the system.
- **Audit log**: every step records who did what and when, and is tamper-evident.

You keep the speed of agents without bypassing the rules your org already relies on.

## A typical flow

With a client such as Claude Desktop:

1. Configure the MCP server URL and credentials from the CMS.
2. The agent calls \`draft_blog_post\` to create a draft—outline, first pass, or polished copy.
3. It calls \`submit_for_review\` and names reviewers.
4. Reviewers get notified (email, chat), open the CMS, and approve or reject.
5. After approval, the agent calls \`schedule_publish\` or \`publish_now\`.

The agent only performs **allowed** actions; boundaries stay explicit.

## MCP vs raw API

A generic REST API can do more—including skipping review—which is useful for automation scripts but coarse for agents. MCP wraps one step at a time and enforces state (for example, only a draft can be submitted for review), which reduces mistakes.

If you already integrate via API, you can add MCP in parallel; both share the same permissions and audit substrate.

## Next steps

- Enable MCP under **Integrations** in the admin.
- Export the config bundle for your agent client.
- Run one full draft flow in a sandbox before production.
`,
    },
  },
  {
    slug: "seo-best-practices",
    date: "2026-03-14",
    tagIds: ["seo", "jsonLd", "metadata"],
    zh: {
      title: "SEO 不靠玄学：标题、URL、结构化数据一套模板搞定",
      excerpt:
        "分享如何在 CMS 中配置标题与描述模板、规范 URL、Open Graph 与 JSON-LD，避免上线前临时补洞。",
      author: "技术团队",
      content: `
很多项目的 SEO 都是「上线前一周突击补洞」。Capybara CMS 把这些能力做成模板与字段，让内容团队在起草时就能顺带完成。

## 标题与描述模板

在站点设置中，可以为不同栏目配置标题模板，比如：

- 博客：\`{title} | {站点名称}\`
- 产品页：\`{产品名} - {分类} | {站点名称}\`

模板变量会自动从内容字段填充。同理，描述可以设置为截取正文前 160 字，或手动填写优先文案。

## 规范 URL

每个内容在创建时自动生成 slug，支持手动调整。URL 结构在栏目级别定义：

- 博客：\`/blog/{slug}\`
- 案例：\`/cases/{slug}\`

canonical 标签自动指向主 URL，避免多站点同步时的重复内容问题。

## Open Graph 与 Twitter Card

OG 标题、描述、图片可以在内容编辑界面单独填写，或继承 SEO 字段。卡片预览功能可以在发布前检查社交平台展示效果。

## JSON-LD

常见结构化数据类型已内置模板：

- \`Article\`：博客、新闻
- \`Product\`：产品页
- \`BreadcrumbList\`：面包屑导航
- \`Organization\`：站点基本信息

填写对应字段后，系统自动生成 JSON-LD 并嵌入页面头部。

## 站点地图与 robots.txt

站点地图按栏目自动生成，新内容上线即更新。robots.txt 支持按环境配置（比如禁止索引 staging）。

这些能力不需要上线前临时补，起草时就顺手完成，减少「最后一天加班」。
`,
    },
    en: {
      title: "SEO without guesswork: titles, URLs, and structured data from one template",
      excerpt:
        "Set title and description templates, canonical URLs, Open Graph, and JSON-LD in the CMS—so you are not patching SEO the week before launch.",
      author: "Engineering",
      content: `
Too many teams treat SEO as a last-minute scramble. Capybara CMS bakes templates and fields into the authoring flow so writers finish metadata while they draft.

## Title and description templates

In site settings, configure patterns per section, for example:

- Blog: \`{title} | {siteName}\`
- Product: \`{productName} - {category} | {siteName}\`

Variables resolve from content fields. Descriptions can default to the first 160 characters of the body or use a dedicated field when you need a custom line.

## Clean URLs

Each item gets a generated slug you can edit. Paths are defined per section:

- Blog: \`/blog/{slug}\`
- Cases: \`/cases/{slug}\`

Canonical tags point at the primary URL, which helps when the same story is syndicated to more than one property.

## Open Graph and Twitter Card

OG title, description, and image can be edited per entry or inherited from SEO fields. Preview cards before publish so social snippets look right.

## JSON-LD

Built-in shapes cover common types:

- \`Article\` for blog and news
- \`Product\` for product pages
- \`BreadcrumbList\` for navigation
- \`Organization\` for site identity

Fill the fields once; the system emits JSON-LD in the document head.

## Sitemaps and robots.txt

Sitemaps regenerate when content ships. \`robots.txt\` can differ by environment—for example, block indexing on staging.

None of this should wait for a launch-week crunch; it belongs in the everyday authoring loop.
`,
    },
  },
  {
    slug: "parallel-migration",
    date: "2026-02-28",
    tagIds: ["migration", "implementation", "script"],
    zh: {
      title: "并行迁移：从旧 CMS 搬家不靠一次性切换",
      excerpt:
        "介绍如何按栏目分阶段迁移，先并行同步，再切换流量与 301，配合脚本化导入降低风险。",
      author: "实施团队",
      content: `
一次性切站风险太高：要么成功，要么 rollback。Capybara CMS 提倡「并行迁移」，先在两侧同步运行一段时间，再逐步切换流量。

## 分阶段推进

1. **模型对齐**：梳理旧系统的栏目、字段、URL 结构，在新系统建立对应模型。
2. **脚本化导入**：用 REST API 或 Webhook 批量导入历史内容，保留 slug 与时间戳。
3. **双写期**：新内容在新系统起草，旧系统保持更新（或停止更新）。
4. **流量切换**：关键栏目先切，配合 301 跳转；非关键栏目后续跟进。
5. **收尾**：旧系统下线，保留备份以防审计需要。

## 脚本化导入

CMS 提供导入脚本模板，支持：

- 批量创建内容模型
- 映射字段（比如旧系统「作者」映射到新系统用户）
- 保留时间戳与版本历史
- 导入图片并替换链接

脚本可以本地运行，或接入 CI 流程，增量更新。

## 301 与 SEO

切换时，旧 URL 设置 301 到新地址。CMS 自动生成跳转映射表，可直接交给运维配置。站点地图在切换后更新，搜索引擎会逐步收录新地址。

## 双写期校验

在双写期，可以对比两侧内容，确认字段完整、链接正确。脚本可以定时跑校验任务，发现差异自动告警。

这套流程把风险分散到多个阶段，避免「一个周末搞定全部」的赌注式迁移。
`,
    },
    en: {
      title: "Parallel migration: moving off a legacy CMS without a big-bang cutover",
      excerpt:
        "Phase the move by section: sync in parallel first, then switch traffic and 301s—with scripted imports to keep risk low.",
      author: "Implementation",
      content: `
A single cutover weekend is brittle: you either win or roll back. Capybara CMS favors **parallel migration**—run both systems for a while, then shift traffic in slices.

## Phased rollout

1. **Model mapping**: inventory sections, fields, and URLs in the legacy stack and recreate them in the new one.
2. **Scripted import**: use REST or webhooks to bulk-load history while preserving slugs and timestamps.
3. **Dual-write period**: new work happens in the new CMS while the old one is frozen or kept in sync.
4. **Traffic moves**: switch critical sections first with 301s; follow with the long tail.
5. **Decommission**: retire the old stack but keep backups for audits.

## Scripted import

Templates help you:

- Create models in bulk
- Map fields (for example legacy “author” to a user reference)
- Preserve timestamps and revision history
- Rewrite asset URLs after import

Run scripts locally or in CI for incremental syncs.

## 301s and SEO

Point old URLs to new ones with 301 redirects. The CMS can emit a redirect map for ops. Refresh sitemaps after the switch so search engines pick up the new URLs.

## Validation while dual-writing

Compare both sides for field completeness and broken links. Scheduled checks can diff environments and alert on drift.

Spreading risk across phases beats betting the company on one deploy window.
`,
    },
  },
  {
    slug: "headless-api-webhook",
    date: "2026-02-12",
    tagIds: ["api", "webhook", "integration"],
    zh: {
      title: "Headless CMS：REST API 与 Webhook 接进现有工单",
      excerpt:
        "讲解如何通过 REST API 与 Webhook 将内容事件接入内部工单、IM 或 CI，不另造黑箱。",
      author: "工程团队",
      content: `
Headless CMS 的核心是「内容与渲染分离」。Capybara CMS 提供标准 REST API 与 Webhook，方便接入现有系统。

## REST API

常见操作都有 API 支持：

- 创建 / 更新 / 删除内容
- 查询列表与单个内容
- 版本历史与审计日志
- 媒体上传与管理

API 认证使用 OAuth 2.0 或 API Key，权限与后台一致。

## Webhook

内容事件可以触发 Webhook：

- 内容创建、更新、发布、删除
- 审批通过 / 驳回
- 媒体上传完成

Webhook 可以接进：

- 内部工单系统：自动创建任务
- IM：发送通知
- CI：触发静态站点构建
- BI：写入分析数据

## 示例：接进工单

假设你用的是 Linear 或自建工单系统：

1. 在 CMS 配置 Webhook URL 与密钥。
2. 选择触发事件（比如「审批通过」）。
3. 工单系统接收事件，自动创建「发布确认」任务，指派给运营。

这样，内容上线流程就在现有工单里可见，不需要另开一个后台。

## 与 MCP 的区别

API 与 Webhook 面向系统集成，适合自动化脚本与后端服务。MCP 面向智能体，提供封装后的工具动作。两套接口共享同一套权限底层，可以并行使用。

如果你已经在用 API 集成，可以继续沿用；新增 MCP 不会冲突。
`,
    },
    en: {
      title: "Headless CMS: REST APIs and webhooks that plug into your tickets",
      excerpt:
        "Wire content events into ticketing, chat, or CI with REST and webhooks—no parallel shadow stack required.",
      author: "Platform engineering",
      content: `
Headless CMS is about **separating content from presentation**. Capybara CMS ships a first-class REST API and webhooks so events meet the systems you already run.

## REST API

Typical operations are covered:

- Create, update, delete content
- List and fetch individual entries
- Read version history and audit trails
- Upload and manage media

Authenticate with OAuth 2.0 or API keys; authorization mirrors the admin UI.

## Webhooks

Fire webhooks on:

- Content created, updated, published, or deleted
- Approvals approved or rejected
- Media processing finished

Send them to:

- Ticketing (auto-create tasks)
- Chat notifications
- CI to rebuild static sites
- Analytics pipelines

## Example: ticketing

With Linear or an internal tracker:

1. Register the webhook URL and secret in the CMS.
2. Subscribe to events such as “approval granted.”
3. Your tracker opens a “publish confirmation” task for the right owner.

The release path stays visible where ops already works—no duplicate console.

## Compared with MCP

APIs and webhooks target integrations and automation services. MCP targets agents with opinionated, stateful tools. Both sit on the same permissions and audit layer, so you can adopt MCP without retiring API work.
`,
    },
  },
  {
    slug: "rbac-and-audit",
    date: "2026-01-28",
    tagIds: ["rbac", "audit", "security"],
    zh: {
      title: "RBAC 与审计日志：谁在什么时间改了什么段落",
      excerpt:
        "介绍细粒度 RBAC 与审计日志，权限落到栏目 / 字段，每一步有据可查。",
      author: "安全团队",
      content: `
很多 CMS 的权限只到「栏目」级别，审计日志只记录「谁编辑了某篇内容」。Capybara CMS 把权限细化到字段，审计日志能追溯到段落。

## RBAC 粒度

权限可以配置到：

- **栏目级别**：谁能访问某个栏目（比如「博客」「产品」）。
- **字段级别**：谁能编辑标题、正文、SEO 字段、媒体等。
- **动作级别**：谁能创建、编辑、审批、发布、删除。

比如，实习生只能编辑正文，不能改标题与 SEO 字段；编辑可以改全部字段，但不能发布；主编可以审批与发布。

## 审计日志

每次内容变更都会记录：

- 操作人（用户 / API / MCP）
- 时间戳
- 变更字段与差异（比如「正文第 3 段从 A 改成 B」）
- 关联事件（比如「审批通过」「定时发布执行」）

日志不可篡改，可以导出供合规审计。

## 与合规评审

在金融、医疗等行业，合规评审需要证明「内容上线经过了审批」。审计日志可以直接导出报告，每一步都有签名与时间戳。

## 数据库设计

审计日志存储在独立表，与内容主表分离，避免查询性能影响。日志保留周期可配置，默认 2 年。

这套设计让「找证据」不再是翻群聊记录，而是查系统日志。
`,
    },
    en: {
      title: "RBAC and audit logs: who changed which paragraph, when",
      excerpt:
        "Fine-grained RBAC down to fields, with audit trails that survive compliance reviews—not just “someone edited this page.”",
      author: "Security",
      content: `
Many CMS products stop at section-level roles and coarse “user edited document” events. Capybara CMS binds permissions to **fields** and records diffs you can defend in an audit.

## RBAC depth

Configure access at:

- **Section**: who may open blog vs. product content.
- **Field**: who may touch title, body, SEO blocks, or media.
- **Action**: who may create, edit, approve, publish, or delete.

Example: interns edit body copy only; editors change all fields but cannot publish; leads approve and ship.

## Audit trail

Each change stores:

- Actor (human user, API key, or MCP call)
- Timestamp
- Field-level diff (for example, paragraph three changed from A to B)
- Linked workflow events (approval granted, schedule fired)

Logs are append-only and exportable for regulators.

## Compliance reviews

In regulated industries you must show content passed human review. Exportable reports tie signatures and timestamps to each step—no screenshot archaeology.

## Storage model

Audit rows live in a separate table from primary content so reporting workloads do not slow authors. Retention defaults to two years and is configurable.

Evidence lives in the system of record, not in chat history.
`,
    },
  },
  {
    slug: "multi-site-orchestration",
    date: "2026-01-12",
    tagIds: ["multiSite", "orchestration", "reuse"],
    zh: {
      title: "多站点编排：一个模型建一次，多个站点各自取用",
      excerpt:
        "讲解如何用一套内容模型支撑多个站点（主站、活动页、小程序），避免复制粘贴十份配置。",
      author: "架构团队",
      content: `
很多公司有多个站点：主站、活动页、小程序、海外版。传统做法是为每个站点建一套后台，复制粘贴配置与内容。Capybara CMS 支持一个模型建一次，多个站点各自取用。

## 内容模型复用

同一套「产品信息」「新闻稿」「案例」模型，可以在多个站点引用。字段结构统一，减少维护成本。

## 渠道覆盖

内容可以标记「适用于哪些站点」，比如：

- 全部站点：新闻稿
- 仅主站：深度文章
- 仅小程序：活动页

发布时，系统自动同步到对应站点。未标记站点不会看到这篇内容。

## 环境变量

每个站点可以有独立环境变量，比如：

- \`SITE_NAME\`：站点名称
- \`SITE_URL\`：站点 URL
- \`OG_IMAGE\`：社交卡片默认图片

模板与字段可以引用这些变量，避免硬编码。

## 区域站点

海外站点可以有独立语言字段，比如：

- 正文：中文 + 英文
- 标题：中文 + 英文
- SEO：各语言独立配置

站点根据访问者语言自动选择字段展示。

## 实际收益

- 减少配置复制：一套模板覆盖多个站点。
- 内容同步：新闻稿一次起草，多站点上线。
- 维护集中：改一处，全部站点生效。

这套设计适合有多站点需求的中大型团队。
`,
    },
    en: {
      title: "Multi-site orchestration: model once, reuse everywhere",
      excerpt:
        "One content model can power the marketing site, campaigns, and mini-programs—without duplicating ten stacks of configuration.",
      author: "Architecture",
      content: `
Companies rarely run a single surface. You might have a flagship site, campaign microsites, a mini-program, and regional properties. Copying configs across siloed CMS instances does not scale.

## Reuse the model

The same “product story,” “press release,” or “customer case” model can feed multiple channels with one schema. Field parity cuts maintenance overhead.

## Channel targeting

Mark which sites should receive an entry:

- Everywhere: press releases
- Main site only: long-form essays
- Mini-program only: event splash pages

Publishing syncs only to the destinations you select; other sites never see the item.

## Per-site environment

Each site can expose variables such as:

- \`SITE_NAME\`
- \`SITE_URL\`
- \`OG_IMAGE\`

Templates reference variables instead of hard-coded strings.

## Regional stacks

International sites can store parallel language fields—body, title, SEO—then render the right locale for each visitor.

## Why teams adopt it

- Fewer duplicated templates
- One draft, many launches
- Central updates propagate automatically

It is aimed at teams juggling more than one public surface without multiplying CMS sprawl.
`,
    },
  },
];

export function getPostBySlug(
  slug: string,
  locale: string = "zh"
): BlogPost | undefined {
  const loc = resolveBlogLocale(locale);
  const raw = POSTS_RAW.find((p) => p.slug === slug);
  if (!raw) return undefined;
  return toBlogPost(raw, loc);
}

export function getPostSlugs(): string[] {
  return POSTS_RAW.map((p) => p.slug);
}

export function getSortedPosts(locale: string = "zh"): BlogPost[] {
  const loc = resolveBlogLocale(locale);
  return [...POSTS_RAW]
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .map((raw) => toBlogPost(raw, loc));
}

export function getFeaturedPosts(locale: string = "zh"): BlogPost[] {
  return getSortedPosts(locale).filter((p) => p.featured);
}

export function getPostsByTag(tagId: string, locale: string = "zh"): BlogPost[] {
  return getSortedPosts(locale).filter((p) => p.tagIds.includes(tagId));
}

/** 用于筛选：唯一 tagId 列表（按首次出现顺序） */
export function getAllTagIds(posts: BlogPost[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const post of posts) {
    for (const id of post.tagIds) {
      if (!seen.has(id)) {
        seen.add(id);
        order.push(id);
      }
    }
  }
  return order;
}
