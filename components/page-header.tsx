import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * 页面标题栏（Arco Pro 风格）：
 * 标题 + 灰色描述 + 可选操作区，克制无装饰。
 * （icon 参数保留以兼容既有调用，不再渲染图标块。）
 */
export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "anim-fade-up flex flex-wrap items-center justify-between gap-4",
        className
      )}
    >
      <div>
        <h1 className="text-xl font-semibold leading-7 tracking-tight">
          {title}
        </h1>
        {description ? (
          <div className="mt-1 text-[13px] text-muted-foreground">
            {description}
          </div>
        ) : null}
      </div>
      {action}
    </div>
  );
}
