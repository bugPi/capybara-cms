import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function Empty({
  className,
  icon: Icon,
  title,
  description,
  children,
}: {
  className?: string;
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full flex-col items-center justify-center py-14 text-center sm:py-20",
        className
      )}
    >
      {Icon ? (
        <div
          className="mb-5 flex size-12 items-center justify-center rounded-full bg-muted/40 text-muted-foreground"
          aria-hidden
        >
          <Icon className="size-6 stroke-[1.5]" />
        </div>
      ) : null}
      <h3 className="max-w-md text-pretty text-base font-semibold tracking-tight text-foreground sm:text-lg">
        {title}
      </h3>
      {description ? (
        <p className="mt-2.5 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children ? (
        <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
      ) : null}
    </div>
  );
}
