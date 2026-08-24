"use client";

import dynamic from "next/dynamic";

/**
 * 富文本编辑器（wangEditor 5）
 *
 * wangEditor 只能在浏览器环境运行（模块加载时依赖 DOM），
 * 因此通过 next/dynamic ssr:false 仅在客户端加载，避免 SSR 崩溃。
 */
const RichEditorInner = dynamic(
  () => import("./rich-editor-inner").then((m) => m.RichEditorInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
        编辑器加载中…
      </div>
    ),
  }
);

export function RichTextEditor({
  initialContent,
  onChange,
  placeholder,
}: {
  /** 初始 HTML 内容（仅在首次挂载时使用） */
  initialContent: string;
  /** 编辑内容变化回调，参数为最新 HTML */
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  return (
    <RichEditorInner
      initialContent={initialContent}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}
