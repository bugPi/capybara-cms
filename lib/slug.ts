/**
 * URL slug 生成
 * - 拉丁字符：小写 + 连字符
 * - 纯中文标题无法直接转写：回退为 post-<时间戳>，由用户手动修改
 */
export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    return `post-${Date.now()}`;
  }
  return slug;
}

/** 文件名校验：仅保留安全字符，避免路径穿越 */
export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}
