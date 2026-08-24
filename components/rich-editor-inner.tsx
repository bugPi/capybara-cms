"use client";

import { useEffect, useState } from "react";
import { Editor, Toolbar } from "@wangeditor/editor-for-react";
import type {
  IDomEditor,
  IEditorConfig,
  IToolbarConfig,
} from "@wangeditor/editor";

/**
 * 精简工具栏：只保留沉浸式写作最常用项
 * （排除字体/颜色/图片/视频/全屏等重度功能）
 */
const TOOLBAR_KEYS = [
  "headerSelect",
  "bold",
  "italic",
  "through",
  "|",
  "bulletedList",
  "numberedList",
  "blockquote",
  "code",
  "codeBlock",
  "|",
  "insertLink",
  "insertTable",
  "divider",
  "|",
  "undo",
  "redo",
];

export function RichEditorInner({
  initialContent,
  onChange,
  placeholder,
}: {
  initialContent: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [editor, setEditor] = useState<IDomEditor | null>(null);

  const toolbarConfig: Partial<IToolbarConfig> = {
    toolbarKeys: TOOLBAR_KEYS,
  };

  const editorConfig: Partial<IEditorConfig> = {
    placeholder: placeholder ?? "开始写作…",
  };

  // 卸载时销毁编辑器实例，避免内存泄漏
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  return (
    <div className="immersive-editor" style={{ zIndex: 100 }}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
      />
      <Editor
        defaultConfig={editorConfig}
        value={initialContent}
        onCreated={setEditor}
        onChange={(ed) => onChange(ed.getHtml())}
        mode="default"
        style={{ overflowY: "hidden" }}
      />
    </div>
  );
}
