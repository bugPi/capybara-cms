/** 审计动作 → 中文文案（仪表盘 / 审计日志共用） */

const LABELS: Record<string, string> = {
  "auth.login": "登录系统",
  "auth.logout": "退出登录",
  "post.create": "创建文章",
  "post.update": "更新文章",
  "post.publish": "发布文章",
  "post.review": "提交审核",
  "post.draft": "转为草稿",
  "post.archive": "归档文章",
  "post.trash": "移入回收站",
  "post.restore": "恢复文章",
  "post.restore_revision": "恢复文章版本",
  "post.delete": "彻底删除",
  "category.create": "创建分类",
  "category.update": "更新分类",
  "category.delete": "删除分类",
  "tag.create": "创建标签",
  "tag.update": "更新标签",
  "tag.delete": "删除标签",
  "media.upload": "上传媒体",
  "media.delete": "删除媒体",
  "user.create": "创建用户",
  "user.update": "更新用户",
  "user.delete": "删除用户",
  "user.change_password": "修改密码",
  "settings.update": "更新设置",
  "apikey.create": "创建 API Key",
  "apikey.revoke": "吊销 API Key",
  "webhook.create": "创建 Webhook",
  "webhook.toggle": "切换 Webhook",
  "webhook.delete": "删除 Webhook",
  "mcp.toggle": "切换 MCP 工具",
  "site.create": "创建站点",
  "site.update": "更新站点",
  "site.delete": "删除站点",
};

export function auditActionLabel(action: string): string {
  return LABELS[action] ?? action;
}
